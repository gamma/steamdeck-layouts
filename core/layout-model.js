// @ts-check
// The editor's binding model. Every control holds a list of activators; an
// activator's actions are the single source of truth for what it outputs.
// Data is sanitized once when it enters the app (file, draft, community
// layout); render code only reads it.

import { sanitizeBindingDsl, stripLegacyDisplayPrefix } from "./binding-dsl.js";

export const ACTIVATOR_TYPES = [
  { value: "regular_press", label: "Full Press" },
  { value: "soft_press", label: "Soft Press" },
  { value: "double_press", label: "Double Press" },
  { value: "long_press", label: "Long Press" },
  { value: "start_press", label: "Start Press" },
  { value: "release_press", label: "Release Press" },
  { value: "chorded_press", label: "Chorded Press" }
];

export const AXIS_CONTROL_MODES = [
  { value: "mouse_move", label: "Mouse Move" },
  { value: "digital_directions", label: "Digital Directions" },
  { value: "hybrid", label: "Hybrid" }
];

export const AXIS_SLOTS = ["click", "move", "up", "down", "left", "right"];

/** Timings are milliseconds, as in Steam's VDF settings. */
export const ACTIVATOR_SETTING_DEFAULTS = {
  doubleTapTime: 250,
  longPressTime: 300,
  fireStartDelay: 0,
  fireEndDelay: 0,
  repeatRate: 99
};

const KNOWN_TYPES = new Set(ACTIVATOR_TYPES.map((item) => item.value));
const LEGACY_PREFIX_INPUTS = { Click: "click", North: "dpad_north", South: "dpad_south", East: "dpad_east", West: "dpad_west", Touch: "touch", Pull: "edge" };

let activatorCounter = 0;

export function createActivatorId() {
  activatorCounter += 1;
  return `act_${Date.now().toString(36)}_${activatorCounter}`;
}

/** @param {string} [output] */
export function createDefaultActivator(output = "") {
  return {
    id: createActivatorId(),
    type: "regular_press",
    actions: output ? [{ output, delayMs: 0 }] : [],
    input: "",
    modeshift: false,
    axisBinding: null,
    chord: "",
    toggle: false,
    interruptable: true,
    turbo: false,
    cycleBinding: false,
    ...ACTIVATOR_SETTING_DEFAULTS,
    haptics: "off",
    notes: "",
    vdfSettings: {}
  };
}

/**
 * Accepts the current activator list format as well as legacy strings and
 * string lists. Invalid entries are dropped instead of failing the load.
 * @param {any} value
 * @returns {any[]}
 */
export function normalizeBindingValue(value) {
  if (typeof value === "string") {
    const text = value.trim();
    return !text || text === "Unmapped" ? [] : [createDefaultActivator(text)];
  }
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      if (typeof entry === "string") {
        const text = entry.trim();
        return text && text !== "Unmapped" ? createDefaultActivator(text) : null;
      }
      return entry && typeof entry === "object" ? sanitizeActivator(entry) : null;
    })
    .filter(Boolean);
}

/** @param {Record<string, any>} value */
export function sanitizeActivator(value) {
  const base = createDefaultActivator();
  const next = { ...base };
  next.id = typeof value.id === "string" && value.id ? value.id : base.id;
  next.type = KNOWN_TYPES.has(value.type) ? value.type : base.type;
  next.input = typeof value.input === "string" ? value.input.trim() : "";
  next.modeshift = Boolean(value.modeshift);
  next.actions = normalizeActivatorActions(value.actions);

  // Drafts before the actions list kept the output in "binding" only.
  const legacyBinding = typeof value.binding === "string" ? value.binding.trim() : "";
  if (!Array.isArray(value.actions) && legacyBinding && legacyBinding !== "Unmapped") {
    next.actions = normalizeActivatorActions([{ output: legacyBinding, delayMs: 0 }]);
  }
  // Older imports prefixed sub-inputs into the output ("North: W").
  next.actions = next.actions.map((step) => {
    const { prefix, output } = stripLegacyDisplayPrefix(step.output);
    if (prefix && !next.input && LEGACY_PREFIX_INPUTS[prefix]) next.input = LEGACY_PREFIX_INPUTS[prefix];
    return prefix ? { ...step, output } : step;
  });

  next.axisBinding = value.axisBinding ? sanitizeAxisBinding(value.axisBinding) : null;
  next.chord = typeof value.chord === "string" ? value.chord.trim() : "";
  next.toggle = Boolean(value.toggle);
  next.interruptable = value.interruptable === undefined ? true : Boolean(value.interruptable);
  next.turbo = Boolean(value.turbo);
  next.cycleBinding = Boolean(value.cycleBinding);
  for (const [key, fallback] of Object.entries(ACTIVATOR_SETTING_DEFAULTS)) {
    next[key] = sanitizeMilliseconds(value[key], fallback);
  }
  next.haptics = ["off", "low", "medium", "high"].includes(value.haptics) ? value.haptics : "off";
  next.notes = typeof value.notes === "string" ? value.notes.trim() : "";
  next.vdfSettings = value.vdfSettings && typeof value.vdfSettings === "object"
    ? Object.fromEntries(Object.entries(value.vdfSettings).filter(([, entry]) => typeof entry === "string"))
    : {};
  return next;
}

/** Earlier drafts stored timings as fractions of a second. */
function sanitizeMilliseconds(value, fallback) {
  if (!Number.isFinite(Number(value))) return fallback;
  const number = Number(value);
  const ms = number > 0 && number <= 1 ? number * 1000 : number;
  return clampNumber(Math.round(ms), 0, 10000, fallback);
}

export function sanitizeAxisBinding(value) {
  const base = { mode: "mouse_move", click: "", move: "", up: "", down: "", left: "", right: "", sensitivity: 1, deadzone: 0.15 };
  if (!value || typeof value !== "object") return base;
  const result = { ...base };
  result.mode = AXIS_CONTROL_MODES.some((entry) => entry.value === value.mode) ? value.mode : base.mode;
  for (const slot of AXIS_SLOTS) {
    result[slot] = typeof value[slot] === "string" ? value[slot].trim() : "";
  }
  result.sensitivity = clampNumber(value.sensitivity, 0.1, 3, base.sensitivity);
  result.deadzone = clampNumber(value.deadzone, 0, 1, base.deadzone);
  return result;
}

export function normalizeActivatorActions(actions) {
  if (!Array.isArray(actions)) return [];
  return actions
    .map((step) => {
      if (!step || typeof step !== "object") return null;
      const output = typeof step.output === "string" ? step.output.trim() : "";
      if (!output || output === "Unmapped") return null;
      const delayMs = Math.round(clampNumber(step.delayMs, 0, 2000, 0));
      const dsl = sanitizeBindingDsl(step.dsl);
      return dsl ? { output, delayMs, dsl } : { output, delayMs };
    })
    .filter(Boolean);
}

export function activatorHasAction(activator) {
  return Boolean(activator?.actions?.some((step) => step.output));
}

export function axisBindingHasSlots(axisBinding) {
  return Boolean(axisBinding) && AXIS_SLOTS.some((slot) => axisBinding[slot]);
}

export function clampNumber(value, min, max, fallback) {
  if (value === null || value === "" || !Number.isFinite(Number(value))) return fallback;
  return Math.min(Math.max(Number(value), min), max);
}
