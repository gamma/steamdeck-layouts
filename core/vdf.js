// @ts-check
// Valve KeyValues (VDF) text format: parsing and serialization.
// Objects have no prototype so keys like "__proto__" stay plain data.
// Repeated keys become arrays, which is how Steam Input lists groups,
// presets and activators.

/**
 * @param {string} text
 * @returns {Record<string, any>}
 */
export function parseVdf(text) {
  const tokens = tokenizeVdf(String(text ?? ""));
  let index = 0;

  const parseObject = () => {
    const result = Object.create(null);
    while (index < tokens.length) {
      const token = tokens[index];
      if (token.type === "}") {
        index += 1;
        break;
      }
      if (token.type !== "string") {
        // Stray "{" without a key: skip it and its contents.
        index += 1;
        if (token.type === "{") parseObject();
        continue;
      }
      const key = token.value;
      index += 1;
      const next = tokens[index];
      if (!next) break;
      let value;
      if (next.type === "{") {
        index += 1;
        value = parseObject();
      } else if (next.type === "string") {
        index += 1;
        value = next.value;
      } else {
        // "}" directly after a key: the key has no value.
        continue;
      }
      if (Object.hasOwn(result, key)) {
        result[key] = Array.isArray(result[key]) ? [...result[key], value] : [result[key], value];
      } else {
        result[key] = value;
      }
    }
    return result;
  };

  return parseObject();
}

/** @param {string} text */
function tokenizeVdf(text) {
  /** @type {{ type: "string" | "{" | "}", value: string }[]} */
  const tokens = [];
  let index = text.charCodeAt(0) === 0xfeff ? 1 : 0;

  while (index < text.length) {
    const char = text[index];
    if (char === " " || char === "\t" || char === "\r" || char === "\n") {
      index += 1;
    } else if (char === "/" && text[index + 1] === "/") {
      const end = text.indexOf("\n", index);
      index = end === -1 ? text.length : end;
    } else if (char === "{" || char === "}") {
      tokens.push({ type: char, value: char });
      index += 1;
    } else if (char === "[") {
      // Platform conditionals such as [$WIN32] are ignored.
      const end = text.indexOf("]", index);
      index = end === -1 ? text.length : end + 1;
    } else if (char === "\"") {
      index += 1;
      let value = "";
      while (index < text.length && text[index] !== "\"") {
        if (text[index] === "\\" && index + 1 < text.length) {
          const escaped = text[index + 1];
          value += escaped === "n" ? "\n" : escaped === "t" ? "\t" : escaped;
          index += 2;
        } else {
          value += text[index];
          index += 1;
        }
      }
      index += 1;
      tokens.push({ type: "string", value });
    } else {
      const start = index;
      while (index < text.length && !/[\s{}"]/.test(text[index])) index += 1;
      tokens.push({ type: "string", value: text.slice(start, index) });
    }
  }

  return tokens;
}

/**
 * Serializes a tree; array values are written as repeated keys.
 * @param {Record<string, any>} tree
 */
export function serializeVdf(tree) {
  const lines = [];
  writeEntries(tree, 0, lines);
  return `${lines.join("\n")}\n`;
}

function writeEntries(node, depth, lines) {
  for (const [key, value] of Object.entries(node)) {
    for (const item of Array.isArray(value) ? value : [value]) {
      writeEntry(key, item, depth, lines);
    }
  }
}

function writeEntry(key, value, depth, lines) {
  if (value === undefined || value === null) return;
  const indent = "\t".repeat(depth);
  if (typeof value === "object") {
    lines.push(`${indent}"${escapeVdfString(key)}"`, `${indent}{`);
    writeEntries(value, depth + 1, lines);
    lines.push(`${indent}}`);
  } else {
    lines.push(`${indent}"${escapeVdfString(key)}"\t\t"${escapeVdfString(String(value))}"`);
  }
}

/** @param {string} value */
export function escapeVdfString(value) {
  return value.replaceAll("\\", "\\\\").replaceAll("\"", "\\\"").replaceAll("\n", "\\n").replaceAll("\t", "\\t");
}

/**
 * @template T
 * @param {T | T[] | null | undefined} value
 * @returns {T[]}
 */
export function arrayify(value) {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}
