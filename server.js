const http = require("http");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const HOST = process.env.HOST || "127.0.0.1";
const PORT = Number.parseInt(process.env.PORT || "8000", 10);
const ROOT = process.cwd();

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

http.createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url, `http://${req.headers.host}`);

    if (requestUrl.pathname === "/api/store-search") {
      const query = requestUrl.searchParams.get("q")?.trim();
      if (!query) return sendJson(res, 400, { error: "Missing q" });
      const data = await fetchJson(
        `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(query)}&l=english&cc=us`
      );
      const items = Array.isArray(data.items)
        ? data.items.filter((item) => item.type === "app").map((item) => ({
            id: item.id,
            name: item.name,
            metascore: item.metascore || "",
            tiny_image: item.tiny_image || ""
          }))
        : [];
      return sendJson(res, 200, { items });
    }

    if (requestUrl.pathname === "/api/community-layouts") {
      const appid = requestUrl.searchParams.get("appid")?.trim();
      if (!appid) return sendJson(res, 400, { error: "Missing appid" });

      const upstream = new URL(`https://www.steaminputdb.com/app/${appid}`);
      const searchText = requestUrl.searchParams.get("searchtext")?.trim();
      const sort = requestUrl.searchParams.get("sort")?.trim();
      const controllerType = requestUrl.searchParams.get("controller_type")?.trim();
      if (searchText) upstream.searchParams.set("searchtext", searchText);
      if (sort) upstream.searchParams.set("sort-by", sort);
      if (controllerType) upstream.searchParams.set("controller_type", controllerType);

      const html = await fetchText(upstream.toString());
      const layouts = extractSteamInputDbLayouts(html);
      return sendJson(res, 200, { layouts });
    }

    if (requestUrl.pathname === "/api/layout-file") {
      const fileUrl = requestUrl.searchParams.get("url");
      if (!fileUrl) return sendJson(res, 400, { error: "Missing url" });
      const parsed = new URL(fileUrl);
      if (parsed.hostname !== "cdn.steamusercontent.com") {
        return sendJson(res, 400, { error: "Unsupported layout host" });
      }
      const vdf = await fetchText(fileUrl);
      return sendJson(res, 200, { vdf });
    }

    return serveStatic(requestUrl.pathname, res);
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Server error" });
  }
}).listen(PORT, HOST, () => {
  console.log(`Steam Deck Layout Studio proxy listening on http://${HOST}:${PORT}/`);
});

async function fetchJson(url) {
  const response = await fetch(url, { headers: { "User-Agent": "steamdeck-layouts/1.0" } });
  if (!response.ok) throw new Error(`Upstream request failed: ${response.status}`);
  return response.json();
}

async function fetchText(url) {
  const response = await fetch(url, { headers: { "User-Agent": "steamdeck-layouts/1.0" } });
  if (!response.ok) throw new Error(`Upstream request failed: ${response.status}`);
  return response.text();
}

function extractSteamInputDbLayouts(html) {
  const literal = extractObjectLiteral(html, "configs:");
  if (!literal) return [];

  const hydrated = vm.runInNewContext(`({configs:${literal}})`, {}, { timeout: 50 });
  return Array.isArray(hydrated.configs?.items)
    ? hydrated.configs.items.map((item) => ({
        title: item.title || "",
        description: item.description || "",
        file_id: item.file_id,
        file_name: item.file_name || "",
        file_url: item.file_url || null,
        controller_type: item.controller_type || "",
        controller_type_nice: item.controller_type_nice || "",
        subscriptions: item.subscriptions ?? 0,
        votes: item.votes || {},
        tags: Array.isArray(item.tags) ? item.tags : [],
        time_created: item.time_created || "",
        time_updated: item.time_updated || ""
      }))
    : [];
}

function extractObjectLiteral(source, marker) {
  const markerIndex = source.indexOf(marker);
  if (markerIndex === -1) return null;

  const startIndex = source.indexOf("{", markerIndex + marker.length);
  if (startIndex === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = startIndex; index < source.length; index += 1) {
    const char = source[index];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === "\"") {
        inString = false;
      }
      continue;
    }

    if (char === "\"") {
      inString = true;
      continue;
    }
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(startIndex, index + 1);
    }
  }

  return null;
}

function serveStatic(pathname, res) {
  const safePath = pathname === "/" ? "/index.html" : pathname;
  const absolutePath = path.resolve(ROOT, `.${safePath}`);
  if (!absolutePath.startsWith(ROOT)) {
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
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(body);
}
