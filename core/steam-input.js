// @ts-check
// Steam Input controller configuration (controller_mappings VDF) for the
// Steam Deck: reading into per-control activators and writing back.
// Names follow Valve's own Steam Deck templates (controller_base/templates).

import { arrayify } from "./vdf.js";
import { parseBindingDsl, bindingDslToOutput, serializeBindingDsl, outputToBindingDsl } from "./binding-dsl.js";
import { createDefaultActivator, sanitizeActivator, ACTIVATOR_SETTING_DEFAULTS } from "./layout-model.js";

/** Group modes as named in Steam's configurator. */
export const MODE_LABELS = {
  absolute_mouse: "Mouse",
  dpad: "Directional Pad",
  four_buttons: "Button Pad",
  joystick_move: "Joystick",
  joystick_mouse: "Joystick Mouse",
  joystick_camera: "Joystick Camera",
  mouse_joystick: "Mouse Joystick",
  mouse_region: "Mouse Region",
  flickstick: "Flick Stick",
  scrollwheel: "Scroll Wheel",
  single_button: "Single Button",
  radial_menu: "Radial Menu",
  touch_menu: "Touch Menu",
  hotbar: "Hotbar",
  "2dscroll": "Directional Swipe",
  trigger: "Trigger",
  switches: "Switches",
  gyro_to_mouse: "Gyro To Mouse",
  gyro_to_joystick: "Gyro To Joystick",
  gyro_to_joystick_camera: "Gyro To Joystick Camera",
  disabled: "None"
};

/** Sub-input labels for sticks, pads and triggers. */
export const INPUT_LABELS = {
  click: "Click",
  touch: "Touch",
  edge: "Pull",
  dpad_north: "Up",
  dpad_south: "Down",
  dpad_west: "Left",
  dpad_east: "Right",
  scroll_clockwise: "Scroll CW",
  scroll_counterclockwise: "Scroll CCW"
};

const ACTIVATOR_KEY_TO_TYPE = {
  full_press: "regular_press",
  soft_press: "soft_press",
  double_press: "double_press",
  long_press: "long_press",
  start_press: "start_press",
  release: "release_press",
  release_press: "release_press",
  chord: "chorded_press",
  chorded_press: "chorded_press"
};

const TYPE_TO_ACTIVATOR_KEY = {
  regular_press: "Full_Press",
  soft_press: "Soft_Press",
  double_press: "Double_Press",
  long_press: "Long_Press",
  start_press: "Start_Press",
  release_press: "release",
  chorded_press: "chord"
};

/**
 * Where each Steam Deck control lives in the VDF: its source, and for
 * controls inside a shared group the input name.
 * L4/R4 are the upper rear buttons ("_upper"), L5/R5 the lower ones; this
 * follows the Deck templates, where the legacy grip names cover the lower pair.
 */
export const CONTROL_SOURCES = {
  a: { source: "button_diamond", input: "button_a" },
  b: { source: "button_diamond", input: "button_b" },
  x: { source: "button_diamond", input: "button_x" },
  y: { source: "button_diamond", input: "button_y" },
  dpad_up: { source: "dpad", input: "dpad_north" },
  dpad_down: { source: "dpad", input: "dpad_south" },
  dpad_left: { source: "dpad", input: "dpad_west" },
  dpad_right: { source: "dpad", input: "dpad_east" },
  left_stick: { source: "joystick" },
  right_stick: { source: "right_joystick" },
  left_pad: { source: "left_trackpad" },
  right_pad: { source: "right_trackpad" },
  left_trigger: { source: "left_trigger" },
  right_trigger: { source: "right_trigger" },
  left_bumper: { source: "switch", input: "left_bumper" },
  right_bumper: { source: "switch", input: "right_bumper" },
  view: { source: "switch", input: "button_escape" },
  menu: { source: "switch", input: "button_menu" },
  quick_access: { source: "switch", input: "button_capture" },
  left_grip_4: { source: "switch", input: "button_back_left_upper" },
  left_grip_5: { source: "switch", input: "button_back_left" },
  right_grip_4: { source: "switch", input: "button_back_right_upper" },
  right_grip_5: { source: "switch", input: "button_back_right" }
};

const SOURCE_ALIASES = { left_joystick: "joystick" };
const INPUT_ALIASES = { button_back_left_lower: "button_back_left", button_back_right_lower: "button_back_right" };

/** Default group mode per source when exporting a control without one. */
export const DEFAULT_SOURCE_MODES = {
  button_diamond: "four_buttons",
  dpad: "dpad",
  joystick: "joystick_move",
  right_joystick: "joystick_move",
  left_trackpad: "dpad",
  right_trackpad: "absolute_mouse",
  left_trigger: "trigger",
  right_trigger: "trigger",
  switch: "switches",
  gyro: "gyro_to_mouse"
};

/** Controls that own a whole source group (sticks, pads, triggers). */
export const CONTROL_FOR_SOURCE = Object.fromEntries(
  Object.entries(CONTROL_SOURCES)
    .filter(([, entry]) => !entry.input)
    .map(([controlId, entry]) => [entry.source, controlId])
);

/**
 * @typedef {{ source: string, mode: string, modeshift: boolean, settings: Record<string, string>, extra: Record<string, any> }} SourceGroup
 * @typedef {{ id: string, name: string, title: string, kind: "set" | "layer", parentName: string,
 *   bindings: Record<string, any[]>, modes: Record<string, { mode: string, settings: Record<string, string> }>,
 *   gyro: { mode: string } | null }} Preset
 * @typedef {{ title: string, description: string, controllerType: string, presets: Preset[] }} LayoutDocument
 */

/**
 * Reads a parsed controller_mappings VDF into presets (action sets and
 * layers) with activators per Steam Deck control.
 * @param {Record<string, any>} parsed
 * @param {string[]} controlIds
 * @returns {LayoutDocument}
 */
export function readControllerConfig(parsed, controlIds) {
  const mappings = parsed?.controller_mappings ?? parsed ?? {};
  const groups = new Map(arrayify(mappings.group).filter(isObject).map((group) => [String(group.id), group]));
  const localization = pickLocalization(mappings.localization);
  const sets = isObject(mappings.actions) ? mappings.actions : {};
  const layers = isObject(mappings.action_layers) ? mappings.action_layers : {};
  const presetNodes = arrayify(mappings.preset).filter(isObject);

  const presetNames = Object.fromEntries(presetNodes.map((preset) => [String(preset.id), describePresetTitle(preset, sets, layers, localization)]));
  const context = { presetNames };

  const presets = presetNodes.map((presetNode, index) => {
    const name = String(presetNode.name ?? `Preset_${index}`);
    const layerInfo = isObject(layers[name]) ? layers[name] : null;
    /** @type {Preset} */
    const preset = {
      id: String(presetNode.id ?? index),
      name,
      title: presetNames[String(presetNode.id)] ?? name,
      kind: layerInfo ? "layer" : "set",
      parentName: layerInfo ? String(layerInfo.parent_set_name ?? "") : "",
      bindings: {},
      modes: {},
      gyro: null
    };

    const sourceBindings = isObject(presetNode.group_source_bindings) ? presetNode.group_source_bindings : {};
    for (const [groupId, descriptorValue] of Object.entries(sourceBindings)) {
      for (const descriptor of arrayify(descriptorValue)) {
        if (typeof descriptor !== "string") continue;
        const [rawSource = "", state = "", ...flags] = descriptor.trim().split(/\s+/);
        if (state !== "active") continue;
        const group = groups.get(String(groupId));
        if (!group) continue;
        const source = SOURCE_ALIASES[rawSource] ?? rawSource;
        applyGroup(preset, source, group, flags.includes("modeshift"), controlIds, context);
      }
    }
    return preset;
  });

  return {
    title: resolveLocalized(mappings.title, localization) || String(mappings.game ?? ""),
    description: resolveLocalized(mappings.description, localization),
    controllerType: String(mappings.controller_type ?? ""),
    presets
  };
}

function applyGroup(preset, source, group, modeshift, controlIds, context) {
  const mode = String(group.mode ?? "");
  const inputs = isObject(group.inputs) ? group.inputs : {};
  const settings = stringRecord(group.settings);

  if (source === "gyro") {
    if (!modeshift) preset.gyro = { mode };
    return;
  }

  const ownerControl = CONTROL_FOR_SOURCE[source];
  if (ownerControl) {
    if (!controlIds.includes(ownerControl)) return;
    if (!modeshift) preset.modes[ownerControl] = { mode, settings };
    for (const [inputName, inputNode] of Object.entries(inputs)) {
      addActivators(preset, ownerControl, readInputActivators(inputNode, { input: inputName, modeshift }, context));
    }
    return;
  }

  for (const [controlId, entry] of Object.entries(CONTROL_SOURCES)) {
    if (entry.source !== source || !entry.input || !controlIds.includes(controlId)) continue;
    const inputNode = inputs[entry.input] ?? Object.entries(inputs).find(([name]) => INPUT_ALIASES[name] === entry.input)?.[1];
    if (!inputNode) continue;
    addActivators(preset, controlId, readInputActivators(inputNode, { input: "", modeshift }, context));
  }
}

function addActivators(preset, controlId, activators) {
  if (activators.length) (preset.bindings[controlId] ??= []).push(...activators);
}

function readInputActivators(inputNode, { input, modeshift }, context) {
  if (!isObject(inputNode) || !isObject(inputNode.activators)) return [];
  const result = [];
  for (const [key, value] of Object.entries(inputNode.activators)) {
    for (const node of arrayify(value)) {
      if (!isObject(node)) continue;
      const bindingStrings = arrayify(node.bindings?.binding).filter((entry) => typeof entry === "string" && entry.trim());
      const actions = bindingStrings
        .map((binding) => {
          const dsl = parseBindingDsl(binding);
          return dsl.command ? { output: bindingDslToOutput(dsl, context), delayMs: 0, dsl } : null;
        })
        .filter(Boolean);
      if (!actions.length) continue;
      const settings = stringRecord(node.settings);
      const activator = createDefaultActivator();
      activator.type = ACTIVATOR_KEY_TO_TYPE[key.toLowerCase().replace(/_\d+$/, "")] ?? "regular_press";
      activator.actions = actions;
      activator.input = input;
      activator.modeshift = modeshift;
      Object.assign(activator, settingsToActivatorFields(settings));
      activator.vdfSettings = settings;
      result.push(sanitizeActivator(activator));
    }
  }
  return result;
}

/** @param {Record<string, string>} settings */
function settingsToActivatorFields(settings) {
  const number = (key, fallback) => (settings[key] != null && Number.isFinite(Number(settings[key])) ? Number(settings[key]) : fallback);
  return {
    toggle: settings.toggle === "1",
    interruptable: settings.interruptable !== "0",
    turbo: settings.hold_repeats === "1",
    repeatRate: number("repeat_rate", ACTIVATOR_SETTING_DEFAULTS.repeatRate),
    longPressTime: number("long_press_time", ACTIVATOR_SETTING_DEFAULTS.longPressTime),
    doubleTapTime: number("double_tap_time", ACTIVATOR_SETTING_DEFAULTS.doubleTapTime),
    fireStartDelay: number("delay_start", ACTIVATOR_SETTING_DEFAULTS.fireStartDelay),
    fireEndDelay: number("delay_end", ACTIVATOR_SETTING_DEFAULTS.fireEndDelay),
    haptics: ["off", "low", "medium", "high"][number("haptic_intensity", 0)] ?? "off"
  };
}

function activatorFieldsToSettings(activator) {
  const settings = { ...(activator.vdfSettings ?? {}) };
  const set = (key, value, defaultValue) => {
    if (value === defaultValue && settings[key] == null) return;
    settings[key] = String(value);
  };
  set("toggle", activator.toggle ? 1 : 0, 0);
  set("interruptable", activator.interruptable ? 1 : 0, 1);
  set("hold_repeats", activator.turbo ? 1 : 0, 0);
  set("repeat_rate", Math.round(activator.repeatRate), ACTIVATOR_SETTING_DEFAULTS.repeatRate);
  set("long_press_time", Math.round(activator.longPressTime), ACTIVATOR_SETTING_DEFAULTS.longPressTime);
  set("double_tap_time", Math.round(activator.doubleTapTime), ACTIVATOR_SETTING_DEFAULTS.doubleTapTime);
  set("delay_start", Math.round(activator.fireStartDelay), ACTIVATOR_SETTING_DEFAULTS.fireStartDelay);
  set("delay_end", Math.round(activator.fireEndDelay), ACTIVATOR_SETTING_DEFAULTS.fireEndDelay);
  set("haptic_intensity", Math.max(0, ["off", "low", "medium", "high"].indexOf(activator.haptics)), 0);
  return settings;
}

/**
 * Effective bindings of a preset: a layer inherits every control it does
 * not override from its parent action set.
 * @param {Preset[]} presets
 * @param {Preset} preset
 */
export function getEffectiveBindings(presets, preset) {
  if (preset.kind !== "layer") return preset.bindings;
  const parent = presets.find((candidate) => candidate.name === preset.parentName && candidate.kind === "set");
  return parent ? { ...parent.bindings, ...preset.bindings } : preset.bindings;
}

/**
 * Builds a controller_mappings tree from presets.
 * @param {{ title: string, description?: string, presets: Preset[] }} layout
 */
export function buildControllerConfig(layout) {
  let nextGroupId = 0;
  const groups = [];
  const presetNodes = [];
  const actions = {};
  const actionLayers = {};

  layout.presets.forEach((preset, presetIndex) => {
    const sourceBindings = {};
    const addGroup = (source, mode, inputs, settings, modeshift = false) => {
      const id = String(nextGroupId++);
      const group = { id, mode, inputs };
      if (settings && Object.keys(settings).length) group.settings = settings;
      groups.push(group);
      sourceBindings[id] = `${source} active${modeshift ? " modeshift" : ""}`;
    };

    const sharedInputs = {};
    for (const [controlId, entry] of Object.entries(CONTROL_SOURCES)) {
      const activators = Array.isArray(preset.bindings[controlId]) ? preset.bindings[controlId] : [];
      if (entry.input) {
        const active = activators.filter((activator) => !activator.modeshift);
        if (!active.length) continue;
        (sharedInputs[entry.source] ??= {})[entry.input] = buildInputNode(active);
        continue;
      }
      const modeEntry = preset.modes?.[controlId];
      for (const modeshift of [false, true]) {
        const subset = activators.filter((activator) => Boolean(activator.modeshift) === modeshift);
        if (!subset.length && (modeshift || !modeEntry)) continue;
        const inputs = {};
        for (const activator of subset) {
          const input = activator.input || defaultInputForSource(entry.source);
          (inputs[input] ??= []).push(activator);
        }
        const inputNodes = Object.fromEntries(Object.entries(inputs).map(([name, list]) => [name, buildInputNode(list)]));
        const mode = modeEntry?.mode || DEFAULT_SOURCE_MODES[entry.source];
        addGroup(entry.source, mode, inputNodes, modeshift ? undefined : modeEntry?.settings, modeshift);
      }
    }
    for (const [source, inputs] of Object.entries(sharedInputs)) {
      addGroup(source, DEFAULT_SOURCE_MODES[source], inputs);
    }
    if (preset.gyro?.mode) addGroup("gyro", preset.gyro.mode, {});

    const name = preset.name || (presetIndex === 0 ? "Default" : `Preset_${1000000 + presetIndex}`);
    if (preset.kind === "layer") {
      actionLayers[name] = { title: preset.title || name, legacy_set: "1", set_layer: "1", parent_set_name: preset.parentName || "Default" };
    } else {
      actions[name] = { title: preset.title || name, legacy_set: "1" };
    }
    presetNodes.push({ id: String(presetIndex), name, group_source_bindings: sourceBindings });
  });

  return {
    controller_mappings: {
      version: "3",
      revision: "1",
      title: layout.title || "Steam Deck Layout Studio export",
      description: layout.description ?? "",
      creator: "",
      controller_type: "controller_neptune",
      actions,
      action_layers: actionLayers,
      group: groups,
      preset: presetNodes,
      settings: {}
    }
  };
}

function defaultInputForSource(source) {
  return source.endsWith("trigger") ? "edge" : "click";
}

function buildInputNode(activators) {
  const nodes = {};
  for (const activator of activators) {
    const bindings = activator.actions
      .map((step) => serializeBindingDsl(step.dsl ?? outputToBindingDsl(step.output)))
      .filter(Boolean);
    if (!bindings.length) continue;
    const key = TYPE_TO_ACTIVATOR_KEY[activator.type] ?? "Full_Press";
    const node = { bindings: { binding: bindings } };
    const settings = activatorFieldsToSettings(activator);
    if (Object.keys(settings).length) node.settings = settings;
    (nodes[key] ??= []).push(node);
  }
  return { activators: nodes };
}

function describePresetTitle(preset, sets, layers, localization) {
  const name = String(preset.name ?? "");
  const info = isObject(sets[name]) ? sets[name] : isObject(layers[name]) ? layers[name] : null;
  const title = resolveLocalized(info?.title, localization);
  if (title) return title;
  return name === "Default" ? "Default" : name;
}

function pickLocalization(node) {
  if (!isObject(node)) return {};
  const english = node.english ?? Object.values(node).find(isObject);
  return isObject(english) ? english : {};
}

function resolveLocalized(value, localization) {
  if (typeof value !== "string") return "";
  if (!value.startsWith("#")) return value;
  const key = value.slice(1);
  const match = Object.entries(localization).find(([candidate]) => candidate.toLowerCase() === key.toLowerCase());
  return typeof match?.[1] === "string" ? match[1] : "";
}

function stringRecord(node) {
  if (!isObject(node)) return {};
  return Object.fromEntries(Object.entries(node).filter(([, value]) => typeof value === "string"));
}

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
