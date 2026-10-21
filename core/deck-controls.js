// @ts-check
// The Steam Deck's physical controls, shared by the web app and the Decky
// plugin. The web app adds 3D positions on top of these.

export const DECK_CONTROLS = [
  { id: "left_bumper", name: "L1 Bumper", kind: "bumper" },
  { id: "right_bumper", name: "R1 Bumper", kind: "bumper" },
  { id: "left_trigger", name: "L2 Trigger", kind: "trigger" },
  { id: "right_trigger", name: "R2 Trigger", kind: "trigger" },
  { id: "left_stick", name: "Left Stick", kind: "stick" },
  { id: "right_stick", name: "Right Stick", kind: "stick" },
  { id: "left_pad", name: "Left Touchpad", kind: "pad" },
  { id: "right_pad", name: "Right Touchpad", kind: "pad" },
  { id: "view", name: "View Button", kind: "utility" },
  { id: "menu", name: "Menu Button", kind: "utility" },
  { id: "steam", name: "Steam Button", kind: "utility" },
  { id: "quick_access", name: "Quick Access Button", kind: "utility" },
  { id: "dpad_up", name: "D-Pad Up", kind: "dpad" },
  { id: "dpad_down", name: "D-Pad Down", kind: "dpad" },
  { id: "dpad_left", name: "D-Pad Left", kind: "dpad" },
  { id: "dpad_right", name: "D-Pad Right", kind: "dpad" },
  { id: "x", name: "X Button", kind: "face" },
  { id: "y", name: "Y Button", kind: "face" },
  { id: "a", name: "A Button", kind: "face" },
  { id: "b", name: "B Button", kind: "face" },
  { id: "left_grip_4", name: "L4 Rear Button", kind: "rear" },
  { id: "left_grip_5", name: "L5 Rear Button", kind: "rear" },
  { id: "right_grip_4", name: "R4 Rear Button", kind: "rear" },
  { id: "right_grip_5", name: "R5 Rear Button", kind: "rear" }
];

const CONTROLS_BY_ID = new Map(DECK_CONTROLS.map((control) => [control.id, control]));

/** @param {string} id */
export function getDeckControl(id) {
  return CONTROLS_BY_ID.get(id);
}

/** Groups for cheat sheets, in reading order. */
export const CHEAT_SHEET_SECTIONS = [
  { title: "Left side", ids: ["left_bumper", "left_trigger", "left_stick", "left_pad", "dpad_up", "dpad_down", "dpad_left", "dpad_right", "view"] },
  { title: "Right side", ids: ["right_bumper", "right_trigger", "right_stick", "right_pad", "a", "b", "x", "y", "menu", "quick_access"] },
  { title: "Back buttons", ids: ["left_grip_4", "left_grip_5", "right_grip_4", "right_grip_5"] }
];
