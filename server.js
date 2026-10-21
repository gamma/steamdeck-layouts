// Local development server: serves the app and relays the same upstream
// requests as proxy/api.php under ./api. Parsing happens client-side.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HOST = process.env.HOST || "127.0.0.1";
const PORT = Number.parseInt(process.env.PORT || "8000", 10);
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const USER_AGENT = "steamdeck-layouts/1.0";
const TIMEOUT_MS = 10_000;
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_HOSTS = new Set(["store.steampowered.com", "api.steampowered.com", "www.steaminputdb.com", "cdn.steamusercontent.com"]);
const FILE_DETAILS_URL = "https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v1/";
const SORT_VALUES = new Set(["vote", "publication", "trend", "text_search"]);

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".stl": "model/stl",
  ".txt": "text/plain; charset=utf-8",
  ".vdf": "text/plain; charset=utf-8"
};

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

http.createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url, "http://localhost");
    if (requestUrl.pathname === "/api") {
      const { url, contentType, form } = resolveUpstream(requestUrl.searchParams);
      const body = await fetchUpstream(url, form);
      res.writeHead(200, {
        "Content-Type": contentType,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "sandbox; default-src 'none'"
      });
      res.end(body);
      return;
    }
    serveStatic(requestUrl.pathname, res);
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    sendJson(res, status, { error: error instanceof HttpError ? error.message : "Server error" });
  }
}).listen(PORT, HOST, () => {
  console.log(`Steam Deck Layout Studio listening on http://${HOST}:${PORT}/`);
});

function resolveUpstream(params) {
  const param = (name) => params.get(name)?.trim() ?? "";

  switch (param("endpoint")) {
    case "store-search": {
      const query = param("q");
      if (!query || query.length > 200) throw new HttpError(400, "Invalid q");
      const url = new URL("https://store.steampowered.com/api/storesearch/");
      url.search = new URLSearchParams({ term: query, l: "english", cc: "us" }).toString();
      return { url: url.toString(), contentType: "application/json; charset=utf-8" };
    }
    case "community-layouts": {
      const appid = param("appid");
      if (!/^\d{1,10}$/.test(appid)) throw new HttpError(400, "Invalid appid");
      const url = new URL(`https://www.steaminputdb.com/app/${appid}`);
      const searchText = param("searchtext");
      const sort = param("sort");
      const controllerType = param("controller_type");
      if (searchText) {
        if (searchText.length > 200) throw new HttpError(400, "Invalid searchtext");
        url.searchParams.set("searchtext", searchText);
      }
      if (sort) {
        if (!SORT_VALUES.has(sort)) throw new HttpError(400, "Invalid sort");
        url.searchParams.set("sort-by", sort);
      }
      if (controllerType) {
        if (!/^[a-z0-9_]{1,40}$/.test(controllerType)) throw new HttpError(400, "Invalid controller_type");
        url.searchParams.set("controller_type", controllerType);
      }
      return { url: url.toString(), contentType: "text/plain; charset=utf-8" };
    }
    case "file-details": {
      // Keyless Steam Web API call; resolves a shared layout id to its file.
      const id = param("id");
      if (!/^\d{1,20}$/.test(id)) throw new HttpError(400, "Invalid id");
      return {
        url: FILE_DETAILS_URL,
        contentType: "application/json; charset=utf-8",
        form: new URLSearchParams({ itemcount: "1", "publishedfileids[0]": id }).toString()
      };
    }
    case "layout-file": {
      let url;
      try {
        url = new URL(param("url"));
      } catch {
        throw new HttpError(400, "Invalid url");
      }
      if (url.protocol !== "https:" || url.hostname !== "cdn.steamusercontent.com" || url.port || url.username || url.password) {
        throw new HttpError(400, "Unsupported layout host");
      }
      return { url: url.toString(), contentType: "text/plain; charset=utf-8" };
    }
    default:
      throw new HttpError(404, "Unknown endpoint");
  }
}

// Follows at most three redirects, each re-checked against the host allowlist.
async function fetchUpstream(initialUrl, form = null) {
  let url = initialUrl;
  for (let redirects = 0; redirects <= 3; redirects += 1) {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || !ALLOWED_HOSTS.has(parsed.hostname)) {
      throw new HttpError(502, "Upstream redirected to an unsupported host");
    }
    let response;
    try {
      response = await fetch(url, {
        method: form ? "POST" : "GET",
        headers: form
          ? { "User-Agent": USER_AGENT, "Content-Type": "application/x-www-form-urlencoded" }
          : { "User-Agent": USER_AGENT },
        body: form ?? undefined,
        redirect: "manual",
        signal: AbortSignal.timeout(TIMEOUT_MS)
      });
    } catch {
      throw new HttpError(502, "Upstream request failed");
    }
    const location = response.headers.get("location");
    if (response.status >= 300 && response.status < 400 && location) {
      url = new URL(location, url).toString();
      continue;
    }
    if (response.status !== 200) throw new HttpError(502, `Upstream request failed: ${response.status}`);
    return readLimited(response);
  }
  throw new HttpError(502, "Too many upstream redirects");
}

async function readLimited(response) {
  const chunks = [];
  let size = 0;
  for await (const chunk of response.body) {
    size += chunk.byteLength;
    if (size > MAX_BYTES) throw new HttpError(502, "Upstream response too large");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

function serveStatic(pathname, res) {
  const relativePath = decodeURIComponent(pathname === "/" ? "/index.html" : pathname);
  const absolutePath = path.resolve(ROOT, `.${relativePath}`);
  const insideRoot = absolutePath.startsWith(ROOT + path.sep);
  const hasDotSegment = path.relative(ROOT, absolutePath).split(path.sep).some((segment) => segment.startsWith("."));
  if (!insideRoot || hasDotSegment) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(absolutePath, (error, data) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    const ext = path.extname(absolutePath).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
    res.end(data);
  });
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(payload));
}
