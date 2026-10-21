// @ts-check
// Parsing of upstream responses that the proxy passes through verbatim.
// Runs in the browser and in Node (tests); no platform APIs are used.

/**
 * Maps the Steam store search JSON to the game list shown in the dialog.
 * @param {any} payload
 */
export function mapStoreSearchItems(payload) {
  if (!Array.isArray(payload?.items)) return [];
  return payload.items
    .filter((item) => item && item.type === "app")
    .map((item) => ({
      id: item.id,
      name: String(item.name ?? ""),
      metascore: item.metascore || "",
      tiny_image: item.tiny_image || ""
    }));
}

/**
 * Extracts the layout list from a SteamInputDB app page. The page embeds its
 * data as a JavaScript object literal after `configs:`; it is parsed as data,
 * never evaluated.
 * @param {string} html
 */
export function extractSteamInputDbLayouts(html) {
  if (typeof html !== "string") return [];
  const markerIndex = html.indexOf("configs:");
  if (markerIndex === -1) return [];
  const startIndex = html.indexOf("{", markerIndex);
  if (startIndex === -1) return [];

  let configs;
  try {
    configs = parseJsLiteral(html, startIndex).value;
  } catch {
    return [];
  }
  if (!Array.isArray(configs?.items)) return [];

  return configs.items
    .filter((item) => item && typeof item === "object")
    .map((item) => ({
      title: asString(item.title),
      description: asString(item.description),
      file_id: item.file_id,
      file_name: asString(item.file_name),
      file_url: typeof item.file_url === "string" && item.file_url ? item.file_url : null,
      controller_type: asString(item.controller_type),
      controller_type_nice: asString(item.controller_type_nice),
      subscriptions: typeof item.subscriptions === "number" ? item.subscriptions : 0,
      votes: item.votes && typeof item.votes === "object" ? item.votes : {},
      tags: Array.isArray(item.tags) ? item.tags.map(String) : [],
      time_created: asString(item.time_created),
      time_updated: asString(item.time_updated)
    }));
}

function asString(value) {
  return value == null ? "" : String(value);
}

const KEYWORD_VALUES = new Map([
  ["true", true],
  ["false", false],
  ["null", null],
  ["undefined", undefined],
  ["NaN", NaN],
  ["Infinity", Infinity]
]);

/**
 * Parses one JavaScript literal value (objects, arrays, strings, numbers,
 * keywords, `void 0`, `new Date(...)`) starting at `startIndex`. Identifiers
 * that reference variables resolve to `undefined`. Anything executable throws.
 * @param {string} source
 * @param {number} [startIndex]
 * @returns {{ value: any, endIndex: number }}
 */
export function parseJsLiteral(source, startIndex = 0) {
  let index = startIndex;

  const fail = (message) => {
    throw new SyntaxError(`${message} at ${index}`);
  };

  const skipWhitespace = () => {
    while (index < source.length) {
      const char = source[index];
      if (char === " " || char === "\n" || char === "\r" || char === "\t") {
        index += 1;
      } else if (char === "/" && source[index + 1] === "/") {
        const end = source.indexOf("\n", index);
        index = end === -1 ? source.length : end;
      } else if (char === "/" && source[index + 1] === "*") {
        const end = source.indexOf("*/", index + 2);
        if (end === -1) fail("Unterminated comment");
        index = end + 2;
      } else {
        break;
      }
    }
  };

  const readIdentifier = () => {
    const match = /^[A-Za-z_$][\w$]*/.exec(source.slice(index, index + 256));
    if (!match) return null;
    index += match[0].length;
    return match[0];
  };

  const readString = () => {
    const quote = source[index];
    index += 1;
    let result = "";
    while (index < source.length) {
      const char = source[index];
      if (char === quote) {
        index += 1;
        return result;
      }
      if (quote === "`" && char === "$" && source[index + 1] === "{") fail("Template interpolation");
      if (char === "\\") {
        result += readEscape();
        continue;
      }
      result += char;
      index += 1;
    }
    return fail("Unterminated string");
  };

  const readEscape = () => {
    const next = source[index + 1];
    index += 2;
    switch (next) {
      case "n": return "\n";
      case "r": return "\r";
      case "t": return "\t";
      case "b": return "\b";
      case "f": return "\f";
      case "v": return "\v";
      case "0": return "\0";
      case "\n": return "";
      case "x": {
        const hex = source.slice(index, index + 2);
        if (!/^[0-9a-fA-F]{2}$/.test(hex)) fail("Bad hex escape");
        index += 2;
        return String.fromCharCode(Number.parseInt(hex, 16));
      }
      case "u": {
        if (source[index] === "{") {
          const end = source.indexOf("}", index);
          const hex = source.slice(index + 1, end);
          if (end === -1 || !/^[0-9a-fA-F]{1,6}$/.test(hex)) fail("Bad unicode escape");
          index = end + 1;
          return String.fromCodePoint(Number.parseInt(hex, 16));
        }
        const hex = source.slice(index, index + 4);
        if (!/^[0-9a-fA-F]{4}$/.test(hex)) fail("Bad unicode escape");
        index += 4;
        return String.fromCharCode(Number.parseInt(hex, 16));
      }
      default:
        return next ?? "";
    }
  };

  const readNumber = () => {
    const match = /^-?(?:0[xX][0-9a-fA-F]+|(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)/.exec(source.slice(index, index + 64));
    if (!match) fail("Bad number");
    index += match[0].length;
    const text = match[0];
    const negative = text.startsWith("-");
    const unsigned = negative ? text.slice(1) : text;
    const value = /^0[xX]/.test(unsigned) ? Number.parseInt(unsigned, 16) : Number(unsigned);
    return negative ? -value : value;
  };

  const readObject = () => {
    index += 1;
    const result = {};
    skipWhitespace();
    while (source[index] !== "}") {
      let key;
      const char = source[index];
      if (char === "\"" || char === "'") {
        key = readString();
      } else if (/[\d.-]/.test(char ?? "")) {
        key = String(readNumber());
      } else {
        key = readIdentifier();
        if (key === null) fail("Bad object key");
      }
      skipWhitespace();
      if (source[index] !== ":") fail("Expected ':'");
      index += 1;
      const value = readValue();
      // Plain assignment would let a "__proto__" key replace the prototype.
      Object.defineProperty(result, key, { value, enumerable: true, writable: true, configurable: true });
      skipWhitespace();
      if (source[index] === ",") {
        index += 1;
        skipWhitespace();
      } else if (source[index] !== "}") {
        fail("Expected ',' or '}'");
      }
    }
    index += 1;
    return result;
  };

  const readArray = () => {
    index += 1;
    const result = [];
    skipWhitespace();
    while (source[index] !== "]") {
      if (source[index] === ",") {
        result.push(undefined);
        index += 1;
        skipWhitespace();
        continue;
      }
      result.push(readValue());
      skipWhitespace();
      if (source[index] === ",") {
        index += 1;
        skipWhitespace();
      } else if (source[index] !== "]") {
        fail("Expected ',' or ']'");
      }
    }
    index += 1;
    return result;
  };

  const readValue = () => {
    skipWhitespace();
    const char = source[index];
    if (char === undefined) return fail("Unexpected end");
    if (char === "{") return readObject();
    if (char === "[") return readArray();
    if (char === "\"" || char === "'" || char === "`") return readString();
    if (char === "-" || char === "." || (char >= "0" && char <= "9")) return readNumber();

    const identifier = readIdentifier();
    if (identifier === null) return fail(`Unexpected '${char}'`);
    if (KEYWORD_VALUES.has(identifier)) return KEYWORD_VALUES.get(identifier);
    if (identifier === "void") {
      readValue();
      return undefined;
    }
    if (identifier === "new") {
      skipWhitespace();
      if (readIdentifier() !== "Date") fail("Unsupported constructor");
      skipWhitespace();
      if (source[index] !== "(") fail("Expected '('");
      index += 1;
      const arg = readValue();
      skipWhitespace();
      if (source[index] !== ")") fail("Expected ')'");
      index += 1;
      const date = new Date(arg);
      return Number.isNaN(date.getTime()) ? "" : date.toISOString();
    }
    skipWhitespace();
    if (source[index] === "(" || source[index] === ".") fail("Executable expression");
    // A bare identifier references a variable we do not have.
    return undefined;
  };

  const value = readValue();
  return { value, endIndex: index };
}

/**
 * Maps Steam's IPublishedFileService/QueryFiles response for controller
 * layouts to the same shape as the SteamInputDB listing.
 * @param {any} payload
 */
export function mapQueryFilesLayouts(payload) {
  const files = payload?.response?.publishedfiledetails;
  if (!Array.isArray(files)) return [];
  return files
    .filter((file) => file && typeof file === "object" && file.result !== 9 && file.file_url)
    .map((file) => {
      const tags = Array.isArray(file.tags) ? file.tags.map((tag) => String(tag?.tag ?? tag)) : [];
      return {
        title: asString(file.title),
        description: asString(file.file_description),
        file_id: asString(file.publishedfileid),
        file_name: asString(file.filename),
        file_url: typeof file.file_url === "string" ? file.file_url : null,
        controller_type: tags.find((tag) => tag.startsWith("controller_")) ?? "",
        controller_type_nice: tags.includes("controller_neptune") ? "Steam Deck" : "",
        subscriptions: Number(file.lifetime_subscriptions ?? file.subscriptions ?? 0) || 0,
        votes: file.vote_data && typeof file.vote_data === "object" ? file.vote_data : {},
        // Feature tags ("feature_gyro") describe the layout; the rest is bookkeeping.
        tags: tags.filter((tag) => tag.startsWith("feature_")).map((tag) => tag.slice("feature_".length)),
        time_created: file.time_created ? new Date(Number(file.time_created) * 1000).toISOString() : "",
        time_updated: file.time_updated ? new Date(Number(file.time_updated) * 1000).toISOString() : ""
      };
    });
}
