import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseVdf, serializeVdf } from "../core/vdf.js";
import { readControllerConfig, buildControllerConfig, getEffectiveBindings } from "../core/steam-input.js";
import { describeActivator, describeControl, describeLayoutOverview, diffLayouts } from "../core/layout-summary.js";
import { normalizeBindingValue, sanitizeActivator } from "../core/layout-model.js";
import { parseBindingDsl, bindingDslToOutput, describeBindingDsl, outputToBindingDsl, serializeBindingDsl } from "../core/binding-dsl.js";

const CONTROL_IDS = [
  "left_bumper", "right_bumper", "left_trigger", "right_trigger", "left_stick", "right_stick", "left_pad", "right_pad",
  "view", "menu", "steam", "quick_access", "dpad_up", "dpad_down", "dpad_left", "dpad_right", "x", "y", "a", "b",
  "left_grip_4", "left_grip_5", "right_grip_4", "right_grip_5"
];
const CONTROLS = CONTROL_IDS.map((id) => ({ id, name: id }));
const fixture = readFileSync(new URL("./fixtures/neptune-layers.vdf", import.meta.url), "utf8");

test("parses KeyValues with comments, bare tokens, escapes and repeated keys", () => {
  const tree = parseVdf("﻿\"root\"\n{\n  // comment with \" and {\n  bare value\n  \"esc\" \"a\\\"b\\nc\"\n  \"k\" \"1\"\n  \"k\" \"2\"\n  \"__proto__\" \"x\"\n}");
  assert.equal(tree.root.bare, "value");
  assert.equal(tree.root.esc, "a\"b\nc");
  assert.deepEqual(tree.root.k, ["1", "2"]);
  assert.equal(tree.root.__proto__, "x");
  assert.equal(Object.getPrototypeOf(tree.root), null);
});

test("serializes and re-parses to the same tree", () => {
  const tree = { a: { b: "1", list: ["x", "y"], nested: { q: "with \"quotes\"" } } };
  assert.deepEqual(JSON.parse(JSON.stringify(parseVdf(serializeVdf(tree)))), tree);
});

test("reads action sets, layers, modes and sub-inputs", () => {
  const doc = readControllerConfig(parseVdf(fixture), CONTROL_IDS);
  assert.equal(doc.title, "Gyro Shooter");
  assert.deepEqual(doc.presets.map((preset) => [preset.title, preset.kind, preset.parentName]), [
    ["On Foot", "set", ""],
    ["Aiming", "layer", "Default"]
  ]);

  const [base, layer] = doc.presets;
  assert.deepEqual(base.bindings.a.map((activator) => [activator.type, activator.actions[0].output]), [
    ["regular_press", "Space"],
    ["long_press", "Ctrl"]
  ]);
  assert.equal(base.bindings.a[0].haptics, "medium");
  assert.equal(base.bindings.a[1].longPressTime, 400);
  assert.equal(base.bindings.b[0].type, "release_press");
  assert.deepEqual(base.bindings.left_stick.map((activator) => [activator.input, activator.actions[0].output]), [
    ["dpad_north", "W"],
    ["dpad_south", "S"],
    ["click", "Shift"]
  ]);
  assert.deepEqual(base.modes.left_stick, { mode: "dpad", settings: {} });
  assert.equal(base.modes.right_pad.settings.sensitivity, "145");
  assert.equal(base.bindings.left_grip_4[0].actions[0].output, "R");
  assert.equal(base.bindings.left_grip_5[0].actions[0].output, "V");
  assert.equal(base.bindings.right_trigger[1].input, "edge");
  assert.equal(base.bindings.right_trigger[1].actions[0].output, "Hold Layer: Aiming");
  assert.equal(base.bindings.left_trigger[0].input, "switch_click", "switch-group trigger buttons are kept");
  assert.equal(base.modes.left_pad.mode, "radial_menu");
  assert.deepEqual(base.gyro, { mode: "gyro_to_mouse" });
  assert.equal(base.modes.right_stick.mode, "joystick_camera");
  assert.equal(base.bindings.right_stick[0].modeshift, true);

  const effective = getEffectiveBindings(doc.presets, layer);
  assert.equal(effective.a[0].actions[0].output, "E");
  assert.equal(effective.left_stick, base.bindings.left_stick);
});

test("describes activators with Steam labels and qualifiers", () => {
  const doc = readControllerConfig(parseVdf(fixture), CONTROL_IDS);
  const [base] = doc.presets;
  assert.equal(describeActivator(base.bindings.a[0]), "Jump (Space)");
  assert.equal(describeActivator(base.bindings.a[1]), "Long Press: Ctrl");
  assert.equal(describeActivator(base.bindings.left_stick[0]), "Up: W");
  assert.equal(describeActivator(base.bindings.right_stick[0]), "Mode Shift · Up: 1");
  assert.deepEqual(describeControl(base.bindings.right_trigger, base.modes.right_trigger, { presetNames: { 1: "Aiming" } }), [
    "Mode: Trigger",
    "Full Pull: Left Mouse",
    "Soft Pull: Aim (Hold Layer: Aiming)"
  ]);
  assert.equal(describeActivator(base.bindings.left_trigger[0]), "Digital: Gamepad LT");
  assert.deepEqual(describeControl(base.bindings.left_pad, base.modes.left_pad), [
    "Mode: Radial Menu (2 items)",
    "Center: Medkit (1)",
    "Item 1: Grenade (2)"
  ]);
  assert.deepEqual(describeControl(base.bindings.right_pad, base.modes.right_pad), ["Mode: Mouse", "Click · Soft Press: Left Mouse"]);
  const overview = describeLayoutOverview(base, CONTROLS);
  assert.match(overview, /Gyro: Gyro To Mouse\./);
  assert.match(overview, /left_grip_4 → Reload \(R\)/);
});

test("exports a Steam-shaped config that reads back identically", () => {
  const doc = readControllerConfig(parseVdf(fixture), CONTROL_IDS);
  const exported = serializeVdf(buildControllerConfig(doc));
  const tree = parseVdf(exported);
  const groups = [tree.controller_mappings.group].flat();
  assert.ok(groups.every((group) => /^\d+$/.test(group.id)), "group ids are numeric");
  const diamond = groups.filter((group) => group.mode === "four_buttons");
  assert.equal(diamond.length, 2, "one button pad group per preset");
  assert.ok(diamond[0].inputs.button_a.activators.Full_Press);
  assert.equal(tree.controller_mappings.action_layers.Preset_1000001.parent_set_name, "Default");

  const roundTrip = readControllerConfig(tree, CONTROL_IDS);
  const strip = (preset) => JSON.parse(JSON.stringify({ ...preset, bindings: Object.fromEntries(Object.entries(preset.bindings).map(([key, list]) => [key, list.map(({ id, ...rest }) => rest)])) }));
  assert.deepEqual(roundTrip.presets.map(strip), doc.presets.map(strip));
});

test("diffs two presets per control", () => {
  const doc = readControllerConfig(parseVdf(fixture), CONTROL_IDS);
  const [base, layer] = doc.presets;
  const changes = diffLayouts(base, { ...layer, bindings: getEffectiveBindings(doc.presets, layer), modes: base.modes }, CONTROLS);
  assert.deepEqual(changes.map((change) => [change.controlId, change.status]), [["a", "changed"]]);
  assert.deepEqual(changes[0].after, ["Interact (E)"]);
});

test("sanitizes drafts without resurrecting removed bindings", () => {
  const [emptied] = normalizeBindingValue([{ type: "regular_press", binding: "E", actions: [] }]);
  assert.deepEqual(emptied.actions, [], "an emptied actions list stays empty");
  const [legacy] = normalizeBindingValue([{ type: "regular_press", binding: "E" }]);
  assert.equal(legacy.actions[0].output, "E", "drafts from before actions[] migrate");
  assert.deepEqual(normalizeBindingValue(["Unmapped", null, 5, { type: "x", actions: [{ output: "Unmapped" }] }]).map((a) => a.actions), [[]]);
  const prefixed = sanitizeActivator({ actions: [{ output: "North: W" }] });
  assert.equal(prefixed.input, "dpad_north");
  assert.equal(prefixed.actions[0].output, "W");
  assert.equal(sanitizeActivator({ longPressTime: 0.35 }).longPressTime, 350, "seconds migrate to ms");
});

test("binding strings round-trip between Steam and editor text", () => {
  assert.equal(bindingDslToOutput(parseBindingDsl("key_press LEFT_CONTROL+S")), "Ctrl+S");
  assert.equal(bindingDslToOutput(parseBindingDsl("mouse_button LEFT")), "Left Mouse");
  assert.equal(bindingDslToOutput(parseBindingDsl("game_action Default jump")), "Jump");
  assert.equal(describeBindingDsl(parseBindingDsl("key_press R, #Reload, , ")), "R");
  assert.equal(serializeBindingDsl(outputToBindingDsl("Ctrl+Up")), "key_press LEFT_CONTROL+UP_ARROW, , , ");
  assert.equal(serializeBindingDsl(outputToBindingDsl("Left Mouse")), "mouse_button LEFT, , , ");
  assert.equal(serializeBindingDsl(parseBindingDsl("key_press SPACE, Jump, , ")), "key_press SPACE, Jump, , ");
});
