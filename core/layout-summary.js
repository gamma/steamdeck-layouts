// @ts-check
// Human-readable descriptions of a layout: one line per activator, a
// plain-language overview, and a per-control diff between two layouts.

import { describeBindingDsl } from "./binding-dsl.js";
import { ACTIVATOR_TYPES, AXIS_SLOTS, axisBindingHasSlots } from "./layout-model.js";
import { MENU_MODES, MODE_LABELS, getInputLabel } from "./steam-input.js";

const SELF_EVIDENT_MODES = new Set(["trigger", "four_buttons", "switches", "single_button"]);
const TYPE_LABELS = Object.fromEntries(ACTIVATOR_TYPES.map((entry) => [entry.value, entry.label]));

/** @param {any} step @param {Record<string, string>} [presetNames] */
export function describeStep(step, presetNames = {}) {
  if (step?.dsl?.command) return describeBindingDsl(step.dsl, { presetNames });
  return step?.output || "Unmapped";
}

/**
 * One line per activator, e.g. "Up · Long Press: Jump (Space)".
 * @param {any} activator
 * @param {{ presetNames?: Record<string, string>, mode?: string }} [options]
 */
export function describeActivator(activator, options = {}) {
  const qualifiers = [];
  if (activator.modeshift) qualifiers.push("Mode Shift");
  if (activator.input) qualifiers.push(getInputLabel(activator.input, options.mode));
  if (activator.type && activator.type !== "regular_press") qualifiers.push(TYPE_LABELS[activator.type] ?? activator.type);
  const steps = activator.actions.map((step) => {
    const text = describeStep(step, options.presetNames);
    return step.delayMs > 0 ? `${text} (+${step.delayMs}ms)` : text;
  });
  const flags = [];
  if (activator.chord) flags.push(`Chord: ${activator.chord}`);
  if (activator.toggle) flags.push("Toggle");
  if (activator.turbo) flags.push("Turbo");
  const body = [steps.join(" → ") || "Unmapped", ...flags].join(" • ");
  return qualifiers.length ? `${qualifiers.join(" · ")}: ${body}` : body;
}

/** @param {any} axisBinding */
export function describeAxisBinding(axisBinding) {
  if (!axisBindingHasSlots(axisBinding)) return "";
  const parts = [];
  for (const slot of AXIS_SLOTS) {
    if (axisBinding[slot]) parts.push(`${slot[0].toUpperCase()}${slot.slice(1)}: ${axisBinding[slot]}`);
  }
  return parts.join(" • ");
}

/**
 * Lines describing one control; the group mode comes first when it says
 * something (e.g. "Mode: Joystick Mouse").
 * @param {any[]} activators
 * @param {{ mode?: string } | undefined} modeEntry
 * @param {{ presetNames?: Record<string, string> }} [options]
 */
export function describeControl(activators, modeEntry, options = {}) {
  const lines = [];
  const mode = modeEntry?.mode ?? "";
  const list = activators ?? [];
  if (MENU_MODES.has(mode)) {
    // Menu entries read best in their on-screen order.
    const items = list.filter((activator) => /^touch_menu_button_\d+$/.test(activator.input));
    const count = new Set(items.map((activator) => activator.input)).size;
    lines.push(`Mode: ${MODE_LABELS[mode]}${count ? ` (${count} item${count === 1 ? "" : "s"})` : ""}`);
    const order = (activator) => Number(/\d+$/.exec(activator.input)?.[0] ?? -1);
    const sorted = [...list].sort((a, b) => (order(a) < 0 ? 1e6 : order(a)) - (order(b) < 0 ? 1e6 : order(b)));
    for (const activator of sorted) {
      if (activator.actions?.length) lines.push(describeActivator(activator, { ...options, mode }));
    }
    return lines;
  }
  for (const activator of list) {
    if (activator.actions?.length) lines.push(describeActivator(activator, { ...options, mode }));
    const axis = describeAxisBinding(activator.axisBinding);
    if (axis) lines.push(axis);
  }
  // A mode that only says "this is a trigger" is noise when nothing is bound.
  if (mode && MODE_LABELS[mode] && (lines.length || !SELF_EVIDENT_MODES.has(mode))) lines.unshift(`Mode: ${MODE_LABELS[mode]}`);
  return lines;
}

/**
 * Plain-language overview of a preset for the viewer and cheat sheet.
 * @param {{ bindings: Record<string, any[]>, modes?: Record<string, any>, gyro?: { mode: string } | null }} preset
 * @param {{ id: string, name: string }[]} controls
 * @param {{ presetNames?: Record<string, string> }} [options]
 */
export function describeLayoutOverview(preset, controls, options = {}) {
  const sentences = [];
  const mapped = controls.filter((control) => preset.bindings[control.id]?.some((activator) => activator.actions?.length));
  sentences.push(`${mapped.length} of ${controls.length} controls are mapped.`);

  const modeParts = controls
    .map((control) => {
      const mode = preset.modes?.[control.id]?.mode;
      return mode && MODE_LABELS[mode] && !["four_buttons", "switches", "trigger"].includes(mode)
        ? `${control.name}: ${MODE_LABELS[mode]}`
        : null;
    })
    .filter(Boolean);
  if (modeParts.length) sentences.push(`${modeParts.join("; ")}.`);

  if (preset.gyro?.mode) sentences.push(`Gyro: ${MODE_LABELS[preset.gyro.mode] ?? preset.gyro.mode}.`);

  const rear = controls
    .filter((control) => /grip/.test(control.id))
    .map((control) => {
      const first = preset.bindings[control.id]?.find((activator) => activator.actions?.length);
      return first ? `${control.name.replace(" Rear Button", "")} → ${describeStep(first.actions[0], options.presetNames)}` : null;
    })
    .filter(Boolean);
  if (rear.length) sentences.push(`Back buttons: ${rear.join(", ")}.`);

  const modeshifts = controls.filter((control) => preset.bindings[control.id]?.some((activator) => activator.modeshift));
  if (modeshifts.length) sentences.push(`Mode shift on ${modeshifts.map((control) => control.name).join(", ")}.`);
  return sentences.join(" ");
}

/**
 * Compares two presets control by control.
 * @returns {{ controlId: string, name: string, status: "added" | "removed" | "changed", before: string[], after: string[] }[]}
 */
export function diffLayouts(before, after, controls, options = {}) {
  const changes = [];
  for (const control of controls) {
    const linesBefore = describeControl(before.bindings[control.id], before.modes?.[control.id], options);
    const linesAfter = describeControl(after.bindings[control.id], after.modes?.[control.id], options);
    if (linesBefore.join("\n") === linesAfter.join("\n")) continue;
    const status = !linesBefore.length ? "added" : !linesAfter.length ? "removed" : "changed";
    changes.push({ controlId: control.id, name: control.name, status, before: linesBefore, after: linesAfter });
  }
  return changes;
}
