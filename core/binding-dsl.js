// @ts-check
// Steam Input binding strings, e.g. "key_press SPACE, Jump, , ".
// The first field is the command with its arguments; later fields are the
// label, icon and colors shown in Steam's UI.

/**
 * @typedef {{ command: string, commandRaw: string, argsRaw: string, argTokens: string[],
 *   label: string, icon: string, colors: string, extra: string[], raw: string }} BindingDsl
 */

/** @param {string} command @param {string} [argsRaw] @returns {BindingDsl} */
function makeDsl(command, argsRaw = "") {
  return {
    command,
    commandRaw: command,
    argsRaw,
    argTokens: argsRaw ? argsRaw.split(/\s+/).filter(Boolean) : [],
    label: "",
    icon: "",
    colors: "",
    extra: [],
    raw: ""
  };
}

/** @param {string} binding @returns {BindingDsl} */
export function parseBindingDsl(binding) {
  const parts = splitBindingFields(String(binding ?? "")).map((part) => part.trim());
  const [head = "", ...meta] = parts;
  const [command = "", ...argTokens] = head.split(/\s+/).filter(Boolean);
  return {
    raw: String(binding ?? ""),
    command: command.toLowerCase(),
    commandRaw: command,
    argsRaw: argTokens.join(" ").trim(),
    argTokens,
    label: meta[0] ?? "",
    icon: meta[1] ?? "",
    colors: meta[2] ?? "",
    extra: meta.slice(3)
  };
}

/** @param {string} text */
function splitBindingFields(text) {
  const parts = [];
  let current = "";
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === "," && text[index - 1] !== "\\") {
      parts.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  parts.push(current);
  return parts;
}

/** @param {any} value @returns {BindingDsl | null} */
export function sanitizeBindingDsl(value) {
  if (!value || typeof value !== "object") return null;
  const text = (entry) => (typeof entry === "string" ? entry.trim() : "");
  const commandRaw = text(value.commandRaw);
  const command = text(value.command).toLowerCase() || commandRaw.toLowerCase();
  if (!command) return null;
  const argsRaw = text(value.argsRaw);
  const list = (entries) => (Array.isArray(entries) ? entries.map(text).filter(Boolean) : null);
  return {
    command,
    commandRaw: commandRaw || command,
    argsRaw,
    argTokens: list(value.argTokens) ?? (argsRaw ? argsRaw.split(/\s+/).filter(Boolean) : []),
    label: text(value.label),
    icon: text(value.icon),
    colors: text(value.colors),
    extra: list(value.extra) ?? [],
    // Kept verbatim so unchanged bindings export byte-identical.
    raw: typeof value.raw === "string" ? value.raw : ""
  };
}

/** @param {any} dsl */
export function serializeBindingDsl(dsl) {
  const normalized = sanitizeBindingDsl(dsl);
  if (!normalized) return "";
  if (normalized.raw && normalized.command === normalized.commandRaw.toLowerCase()) {
    return normalized.raw;
  }
  const head = [normalized.commandRaw || normalized.command, normalized.argsRaw].filter(Boolean).join(" ").trim();
  const fields = [normalized.label, normalized.icon, normalized.colors, ...normalized.extra];
  return `${head}, ${fields.join(", ")}`;
}

/**
 * Editor-facing output text for a binding ("Ctrl+S", "Left Mouse", ...).
 * @param {BindingDsl} dsl
 * @param {{ presetNames?: Record<string, string> }} [context]
 */
export function bindingDslToOutput(dsl, context = {}) {
  const { command, argsRaw, argTokens } = dsl;
  switch (command) {
    case "key_press":
      return formatKeyShortcut(argsRaw);
    case "mouse_button":
      return `${formatToken(argsRaw)} Mouse`;
    case "mouse_move":
      return "Mouse Move";
    case "mouse_wheel":
      return formatToken(argsRaw).replace("Scroll ", "Wheel ");
    case "xinput_button":
      return `Pad ${formatToken(argsRaw)}`;
    case "mode_shift":
      if (argTokens.length >= 2) return `Mode Shift ${formatToken(argTokens[0])} -> Group ${argTokens[1]}`;
      return `Mode Shift ${formatToken(argsRaw)}`;
    case "game_action":
      return argTokens.length >= 2 ? formatToken(argTokens.slice(1).join(" ")) : formatToken(argsRaw);
    case "controller_action":
      return formatControllerAction(argTokens, context);
    default:
      return `${formatToken(dsl.commandRaw || command)}${argsRaw ? ` ${formatToken(argsRaw)}` : ""}`.trim();
  }
}

/** Output text plus Steam's own label when the layout author set one. */
export function describeBindingDsl(dsl, context = {}) {
  const output = bindingDslToOutput(dsl, context);
  const label = dsl.label && !dsl.label.startsWith("#") ? dsl.label : "";
  if (!label || label.toLowerCase() === output.toLowerCase()) return output;
  return output ? `${label} (${output})` : label;
}

const LAYER_COMMANDS = {
  add_layer: "Add Layer",
  hold_layer: "Hold Layer",
  remove_layer: "Remove Layer",
  change_preset: "Switch Action Set"
};

function formatControllerAction(argTokens, context) {
  if (!argTokens.length) return "Controller Action";
  const [first, second] = argTokens;
  const name = first.toLowerCase();
  if (name === "empty_sub_command" || name === "empty_binding") return "No Action";
  if (LAYER_COMMANDS[name]) {
    const target = second ? context.presetNames?.[second] ?? second : "";
    return target ? `${LAYER_COMMANDS[name]}: ${target}` : LAYER_COMMANDS[name];
  }
  return formatToken(argTokens.join(" "));
}

const PREFIX_TO_INPUT_HINT = /^(Click|North|South|East|West|Touch|Pull|Soft|Full):\s+(.+)$/;

/** Removes the "North: " style prefix that older drafts stored in outputs. */
export function stripLegacyDisplayPrefix(output) {
  const match = String(output).match(PREFIX_TO_INPUT_HINT);
  return match ? { prefix: match[1], output: match[2] } : { prefix: "", output: String(output) };
}

/** @param {string} output @returns {BindingDsl} */
export function outputToBindingDsl(output) {
  const text = stripLegacyDisplayPrefix(String(output ?? "").trim()).output;
  if (!text || text === "No Action") return makeDsl("controller_action", "empty_sub_command");
  if (text === "Wheel Up") return makeDsl("mouse_wheel", "SCROLL_UP");
  if (text === "Wheel Down") return makeDsl("mouse_wheel", "SCROLL_DOWN");
  if (/^(Left|Right|Middle) Mouse$/.test(text)) return makeDsl("mouse_button", text.replace(" Mouse", "").toUpperCase());
  if (text === "Mouse Move") return makeDsl("mouse_move", "MOVE");
  if (text.startsWith("Pad ")) return makeDsl("xinput_button", text.slice(4).trim().replaceAll(" ", "_"));
  if (text.startsWith("Mode Shift ")) {
    const match = text.match(/^Mode Shift\s+(.+?)\s*->\s*Group\s+(\d+)$/i);
    const source = (match?.[1] ?? text.slice("Mode Shift ".length)).trim().replaceAll(" ", "_").toLowerCase();
    return makeDsl("mode_shift", match?.[2] ? `${source} ${match[2]}` : source);
  }
  const keys = text
    .split("+")
    .map((token) => mapOutputKeyToVdfKey(token.trim()))
    .filter(Boolean)
    .join("+");
  return makeDsl("key_press", keys || mapOutputKeyToVdfKey(text));
}

const OUTPUT_TO_VDF_KEY = {
  UP: "UP_ARROW",
  DOWN: "DOWN_ARROW",
  LEFT: "LEFT_ARROW",
  RIGHT: "RIGHT_ARROW",
  ESC: "ESCAPE",
  CTRL: "LEFT_CONTROL",
  CONTROL: "LEFT_CONTROL",
  ALT: "LEFT_ALT",
  SHIFT: "LEFT_SHIFT",
  META: "LEFT_WINDOWS"
};

function mapOutputKeyToVdfKey(token) {
  const normalized = token.toUpperCase().replaceAll(" ", "_");
  const keypad = normalized.match(/^NUM(\d)$/);
  if (keypad) return `KEYPAD_${keypad[1]}`;
  return OUTPUT_TO_VDF_KEY[normalized] ?? normalized;
}

const VDF_KEY_TO_OUTPUT = {
  UP_ARROW: "Up",
  DOWN_ARROW: "Down",
  LEFT_ARROW: "Left",
  RIGHT_ARROW: "Right",
  LEFT_CONTROL: "Ctrl",
  RIGHT_CONTROL: "Ctrl",
  LEFT_ALT: "Alt",
  RIGHT_ALT: "Alt",
  LEFT_SHIFT: "Shift",
  RIGHT_SHIFT: "Shift",
  LEFT_WINDOWS: "Meta",
  RIGHT_WINDOWS: "Meta",
  ESCAPE: "Esc"
};

/** @param {string} arg */
export function formatKeyShortcut(arg) {
  if (!arg) return "";
  return arg
    .split("+")
    .map((token) => {
      const normalized = token.trim().toUpperCase();
      const keypad = normalized.match(/^KEYPAD_(\d)$/);
      return formatToken(keypad ? `Num${keypad[1]}` : VDF_KEY_TO_OUTPUT[normalized] ?? token.trim());
    })
    .filter(Boolean)
    .join("+");
}

/** @param {string} value */
export function formatToken(value) {
  return String(value ?? "")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
