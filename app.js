import * as THREE from "https://esm.sh/three@0.160.0";
import { OrbitControls } from "https://esm.sh/three@0.160.0/examples/jsm/controls/OrbitControls.js";
import { STLLoader } from "https://esm.sh/three@0.160.0/examples/jsm/loaders/STLLoader.js";

const DEFAULT_CONTROLS = [
  { id: "left_bumper", name: "L1 Bumper", kind: "bumper", pos: [-1.9070061445236206, 1.124805967013041, -0.022185817981759705], size: [0.54, 0.18, 0.28], rotation: [-0.17970247776285814, -0.010401277067988768, 0.057192679649428126], scale: [1, 1, 0.7477379880849421] },
  { id: "right_bumper", name: "R1 Bumper", kind: "bumper", pos: [1.8418513933817544, 1.1354556481043496, -0.038603511949380234], size: [0.54, 0.18, 0.28], rotation: [-0.18, 0, 0], scale: [0.9926492182394554, 0.5072335817822604, 0.6092462576274693] },
  { id: "left_trigger", name: "L2 Trigger", kind: "trigger", pos: [-1.8448127508163452, 1.0392525593439736, -0.16875980297724405], size: [0.46, 0.22, 0.5], rotation: [-0.35, 0, 0], scale: [0.9175983495498393, 0.5701425059009136, 0.5204343747279385] },
  { id: "right_trigger", name: "R2 Trigger", kind: "trigger", pos: [1.7487382491429646, 1.0724905729293823, -0.14798887570699054], size: [0.46, 0.22, 0.5], rotation: [-0.35, 0, 0], scale: [0.7706175670172294, 0.6249397365568353, 0.5326117517528911] },
  { id: "left_stick", name: "Left Stick", kind: "stick", pos: [-1.5278548796971638, 0.8009234468142191, 0.3545029064019521], size: [0.24, 0.13, 24], rotation: [1.5707963267948966, 0, 0], scale: [0.5, 0.5, 0.5] },
  { id: "right_stick", name: "Right Stick", kind: "stick", pos: [1.5005214214324951, 0.7763124505678812, 0.3545029064019521], size: [0.24, 0.13, 24], rotation: [1.5707963267948966, 0, 0], scale: [0.5, 0.5, 0.5] },
  { id: "left_pad", name: "Left Touchpad", kind: "pad", pos: [-1.4848190148671467, 0.24328768750031787, 0.1973915994167328], size: [0.66, 0.5, 0.06], rotation: [0, 0, 0], scale: [0.666792935347466, 0.9095993327254873, 1.0052069336166984] },
  { id: "right_pad", name: "Right Touchpad", kind: "pad", pos: [1.6002639532089233, 0.24328768750031787, 0.1973915994167328], size: [0.66, 0.5, 0.06], rotation: [0, 0, 0], scale: [0.6840672609280403, 0.9602273328163837, 1] },
  { id: "view", name: "View Button", kind: "utility", pos: [-1.6787373622258503, 1.0720743338267007, 0.20313108960787454], size: [0.18, 0.08, 0.07], rotation: [0, 0, 0], scale: [0.7718260318261734, 1, 1] },
  { id: "menu", name: "Menu Button", kind: "utility", pos: [1.6788936456044514, 1.0720743338267007, 0.20313108960787454], size: [0.18, 0.08, 0.07], rotation: [0, 0, 0], scale: [1, 1, 1] },
  { id: "steam", name: "Steam Button", kind: "utility", pos: [-1.4477551380793252, -0.03469822369515896, 0.1915585696697235], size: [0.14, 0.14, 0.06], rotation: [0, 0, 0], scale: [1.678227421016667, 0.6425742679181182, 1.3131953078484062] },
  { id: "quick_access", name: "Quick Access Button", kind: "utility", pos: [1.447754899660746, -0.0643408065661788, 0.1915585696697235], size: [0.16, 0.12, 0.06], rotation: [0, 0, 0], scale: [1.188975197989932, 0.9017574539047117, 1] },
  { id: "dpad_up", name: "D-Pad Up", kind: "dpad", pos: [-1.9162099361419678, 1.008418063322703, 0.22144445280234018], size: [0.18, 0.11, 0.045], rotation: [0, 0, 0], scale: [1, 1, 1] },
  { id: "dpad_down", name: "D-Pad Down", kind: "dpad", pos: [-1.9381882747014363, 0.7662722865740458, 0.22154265642166138], size: [0.18, 0.11, 0.045], rotation: [0, 0, 0], scale: [1, 1, 1] },
  { id: "dpad_left", name: "D-Pad Left", kind: "dpad", pos: [-2.0328590075174966, 0.896206259727478, 0.22153052687644958], size: [0.11, 0.18, 0.045], rotation: [0, 0, 0], scale: [1, 1, 1] },
  { id: "dpad_right", name: "D-Pad Right", kind: "dpad", pos: [-1.7928784688313801, 0.8784178892771403, 0.2213268280029297], size: [0.11, 0.18, 0.045], rotation: [0, 0, 0], scale: [1, 1, 1] },
  { id: "x", name: "X Button", kind: "face", pos: [1.805057962735494, 0.8825451532999674, 0.2214406927426656], size: [0.09, 0.06, 20], rotation: [1.5707963267948966, 0, 0], scale: [1, 1, 1] },
  { id: "y", name: "Y Button", kind: "face", pos: [1.9201560815175374, 0.9941441218058268, 0.2214406927426656], size: [0.09, 0.06, 20], rotation: [1.5707963267948966, 0, 0], scale: [1, 1, 1] },
  { id: "a", name: "A Button", kind: "face", pos: [1.9095153013865152, 0.7573799689610798, 0.2214406927426656], size: [0.09, 0.06, 20], rotation: [1.5707963267948966, 0, 0], scale: [1, 1, 1] },
  { id: "b", name: "B Button", kind: "face", pos: [2.0545754432678223, 0.8904473980267842, 0.20950340231259662], size: [0.09, 0.06, 20], rotation: [1.5707963267948966, 0, 0], scale: [1, 1, 1] },
  { id: "left_grip_4", name: "L4 Rear Button", kind: "rear", pos: [-1.6133379141489663, 0.27285367250442505, -0.1351798375447591], size: [0.34, 0.18, 0.14], rotation: [-0.07308699292290546, -0.46169632762870666, -0.02645219815081445], scale: [1, 1.4964297947289706, 1] },
  { id: "left_grip_5", name: "L5 Rear Button", kind: "rear", pos: [-1.554385224978129, -0.031910067424178123, -0.09912295639514923], size: [0.34, 0.18, 0.14], rotation: [0.08677762251471617, -0.4604422579535512, 0.03279662112019297], scale: [1, 1.423939915867236, 0.45765880054170427] },
  { id: "right_grip_4", name: "R4 Rear Button", kind: "rear", pos: [1.620943268140157, 0.3415716787179311, -0.14454569419225055], size: [0.34, 0.18, 0.14], rotation: [0.1155606541002835, 0.19637704731326103, -0.03940858525112614], scale: [0.6770387748281969, 1.3648758314937044, 0.3609690967760934] },
  { id: "right_grip_5", name: "R5 Rear Button", kind: "rear", pos: [1.6039751768112183, 0.03561945694188277, -0.12487076967954636], size: [0.34, 0.18, 0.14], rotation: [0.14011519040806605, 0.6981317007977318, -0.09062077740806787], scale: [0.8530498643533708, 1.4298278821587411, 0.6161448889316428] },
];

const controls = DEFAULT_CONTROLS.map((control) => ({
  ...control,
  pos: [...control.pos],
  size: [...control.size],
  rotation: control.rotation ? [...control.rotation] : [...getDefaultRotation(control.kind)],
  scale: control.scale ? [...control.scale] : [1, 1, 1]
}));

const state = {
  gameResults: [],
  selectedGame: null,
  communityLayouts: [],
  loadedLayoutMeta: null,
  selectedLayoutDetail: null,
  paintBrushSize: 3,
  paintMode: false,
  selectedControlId: null,
  selectedActivatorIndex: 0,
  draftStepIndex: null,
  activeStepModifiers: [],
  activeChordIds: [],
  bindingInputMode: "keys",
  bindingOverlayVisible: true,
  bindingEditorOpen: false,
  bindingEditorAdvancedOpen: false,
  communityDialogOpen: false,
  bindings: Object.fromEntries(controls.map((c) => [c.id, []]))
};

const MODEL_URL = "./assets/steamdeck_shell.stl";
const DEFAULT_LAYOUT_URL = "./saved-layouts/steamdeck-layout-2026-03-11.json";
const TARGET_MODEL_WIDTH = 4.35;
const FALLBACK_BODY_SIZE = [4.3, 1.8, 1.25];
const DEBUG_KEY_SEQUENCE = ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "A", "S", "D", "F", "G", "H", "J", "K", "L", "Z", "X", "C", "V", "B", "N", "M"];
const ACTIVATOR_TYPES = [
  { value: "regular_press", label: "Regular Press" },
  { value: "double_press", label: "Double Press" },
  { value: "long_press", label: "Long Press" },
  { value: "start_press", label: "Start Press" },
  { value: "release_press", label: "Release Press" },
  { value: "chorded_press", label: "Chorded Press" }
];
const MODIFIER_TOKENS = ["Ctrl", "Shift", "Alt", "Meta"];

const el = {
  gameSearchInput: document.getElementById("gameSearchInput"),
  gameSearchBtn: document.getElementById("gameSearchBtn"),
  layoutSearchInput: document.getElementById("layoutSearchInput"),
  layoutSortSelect: document.getElementById("layoutSortSelect"),
  toggleOverlayBtn: document.getElementById("toggleOverlayBtn"),
  gameResultsList: document.getElementById("gameResultsList"),
  layoutResultsList: document.getElementById("layoutResultsList"),
  layoutStatus: document.getElementById("layoutStatus"),
  openCommunityBtn: document.getElementById("openCommunityBtn"),
  communityDialogBackdrop: document.getElementById("communityDialogBackdrop"),
  communityDialogCloseBtn: document.getElementById("communityDialogCloseBtn"),
  layoutDetailTitle: document.getElementById("layoutDetailTitle"),
  layoutDetailMeta: document.getElementById("layoutDetailMeta"),
  layoutDetailDescription: document.getElementById("layoutDetailDescription"),
  layoutDetailTags: document.getElementById("layoutDetailTags"),
  dialogLoadLayoutBtn: document.getElementById("dialogLoadLayoutBtn"),
  currentCommunitySummary: document.getElementById("currentCommunitySummary"),
  bindingsTable: document.getElementById("bindingsTable"),
  selectionInfo: document.getElementById("selectionInfo"),
  paintRegionBtn: document.getElementById("paintRegionBtn"),
  clearRegionBtn: document.getElementById("clearRegionBtn"),
  paintBrushSize: document.getElementById("paintBrushSize"),
  paintBrushSizeValue: document.getElementById("paintBrushSizeValue"),
  newLayoutBtn: document.getElementById("newLayoutBtn"),
  debugMapBtn: document.getElementById("debugMapBtn"),
  saveLayoutBtn: document.getElementById("saveLayoutBtn"),
  loadLayoutBtn: document.getElementById("loadLayoutBtn"),
  fileInput: document.getElementById("fileInput"),
  rowTemplate: document.getElementById("bindingRowTemplate"),
  gameResultTemplate: document.getElementById("gameResultTemplate"),
  layoutResultTemplate: document.getElementById("layoutResultTemplate"),
  deckContainer: document.getElementById("deckContainer"),
  deckStatus: document.getElementById("deckStatus"),
  bindingLines: document.getElementById("bindingLines"),
  bindingTags: document.getElementById("bindingTags"),
  dropHint: document.getElementById("dropHint"),
  bindingEditorBackdrop: document.getElementById("bindingEditorBackdrop"),
  bindingEditorGrid: document.getElementById("bindingEditorGrid"),
  bindingEditorTitle: document.getElementById("bindingEditorTitle"),
  bindingEditorCloseBtn: document.getElementById("bindingEditorCloseBtn"),
  bindingEditorCloseFooterBtn: document.getElementById("bindingEditorCloseFooterBtn"),
  bindingEditorActivatorList: document.getElementById("bindingEditorActivatorList"),
  bindingEditorAddActivatorBtn: document.getElementById("bindingEditorAddActivatorBtn"),
  bindingEditorDeleteBtn: document.getElementById("bindingEditorDeleteBtn"),
  bindingEditorType: document.getElementById("bindingEditorType"),
  bindingEditorStepInput: document.getElementById("bindingEditorStepInput"),
  bindingEditorStepAdd: document.getElementById("bindingEditorStepAdd"),
  bindingEditorAddStepBtn: document.getElementById("bindingEditorAddStepBtn"),
  bindingEditorStepList: document.getElementById("bindingEditorStepList"),
  bindingEditorModeKeysBtn: document.getElementById("bindingEditorModeKeysBtn"),
  bindingEditorModeMouseBtn: document.getElementById("bindingEditorModeMouseBtn"),
  bindingEditorKeysPanel: document.getElementById("bindingEditorKeysPanel"),
  bindingEditorMousePanel: document.getElementById("bindingEditorMousePanel"),
  bindingEditorPressedMods: document.getElementById("bindingEditorPressedMods"),
  bindingEditorClearInputBtn: document.getElementById("bindingEditorClearInputBtn"),
  mouseLeftBtn: document.getElementById("mouseLeftBtn"),
  mouseRightBtn: document.getElementById("mouseRightBtn"),
  mouseMiddleBtn: document.getElementById("mouseMiddleBtn"),
  mouseWheelUpBtn: document.getElementById("mouseWheelUpBtn"),
  mouseWheelDownBtn: document.getElementById("mouseWheelDownBtn"),
  bindingEditorToggleAdvancedBtn: document.getElementById("bindingEditorToggleAdvancedBtn"),
  bindingEditorAdvancedColumn: document.getElementById("bindingEditorAdvancedColumn"),
  bindingEditorAdvancedBody: document.getElementById("bindingEditorAdvancedBody"),
  bindingEditorChordPicker: document.getElementById("bindingEditorChordPicker"),
  bindingEditorChordChips: document.getElementById("bindingEditorChordChips"),
  bindingEditorChordAdd: document.getElementById("bindingEditorChordAdd"),
  bindingEditorToggle: document.getElementById("bindingEditorToggle"),
  bindingEditorInterruptable: document.getElementById("bindingEditorInterruptable"),
  bindingEditorTurbo: document.getElementById("bindingEditorTurbo"),
  bindingEditorCycle: document.getElementById("bindingEditorCycle"),
  bindingEditorDoubleTap: document.getElementById("bindingEditorDoubleTap"),
  bindingEditorLongPress: document.getElementById("bindingEditorLongPress"),
  bindingEditorStartDelay: document.getElementById("bindingEditorStartDelay"),
  bindingEditorEndDelay: document.getElementById("bindingEditorEndDelay"),
  bindingEditorRepeatRate: document.getElementById("bindingEditorRepeatRate"),
  bindingEditorHaptics: document.getElementById("bindingEditorHaptics"),
  bindingEditorNotes: document.getElementById("bindingEditorNotes")
};

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const overlayCameraPosition = new THREE.Vector3();
const overlayControlPosition = new THREE.Vector3();
const overlayProjectedPoint = new THREE.Vector3();
const overlayProjectedTip = new THREE.Vector3();
const overlayDeckCenter = new THREE.Vector3(0, 0.15, 0);
const overlayCameraFromCenter = new THREE.Vector3();
const overlayControlFromCenter = new THREE.Vector3();
const overlayControlToCamera = new THREE.Vector3();
const overlayFacingNormal = new THREE.Vector3();
const overlayControlNormal = new THREE.Vector3();
const overlayNormalTip = new THREE.Vector3();
const overlayDirectionTip = new THREE.Vector3();
const overlayDirectionAxis = new THREE.Vector3();
const overlayRouteCache = new Map();
const controlSurfaceNormals = new Map();
let orbitControls;
let sceneCamera;
let shellMesh;
let shellGeometry;
let shellFaceOwners = [];
let shellFaceCentroids = [];
let shellFaceNormals = [];
let shellFaceAdjacency = [];
let shellPreviewFaces = new Set();
let pendingPaintRegions = null;
let isPainting = false;
let selectionAnimation = null;

initUI();
initScene();
renderBindings();
updateSelectionInfo();
loadDefaultLayout();
initBindingEditor();

function initUI() {
  el.openCommunityBtn.addEventListener("click", showCommunityDialog);
  el.communityDialogCloseBtn.addEventListener("click", hideCommunityDialog);
  el.communityDialogBackdrop.addEventListener("click", (event) => {
    if (event.target === el.communityDialogBackdrop) hideCommunityDialog();
  });
  el.gameSearchBtn.addEventListener("click", () => searchGames());
  el.gameSearchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") searchGames();
  });
  el.layoutSearchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") loadCommunityLayouts();
  });
  el.toggleOverlayBtn.addEventListener("click", () => {
    state.bindingOverlayVisible = !state.bindingOverlayVisible;
    el.toggleOverlayBtn.classList.toggle("active", state.bindingOverlayVisible);
    renderBindingOverlays();
  });
  el.dialogLoadLayoutBtn.addEventListener("click", () => {
    if (state.selectedLayoutDetail) loadCommunityLayout(state.selectedLayoutDetail);
  });
  el.deckContainer.addEventListener("dragover", (event) => {
    event.preventDefault();
    el.dropHint.classList.add("active");
  });
  el.deckContainer.addEventListener("dragleave", () => {
    el.dropHint.classList.remove("active");
  });
  el.deckContainer.addEventListener("drop", async (event) => {
    event.preventDefault();
    el.dropHint.classList.remove("active");
    const file = event.dataTransfer?.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      applyLayoutData(json, true);
      renderBindings();
      updateSelectionInfo();
      renderBindingOverlays();
      setLayoutStatus("Layout loaded from drop.", false);
    } catch {
      setLayoutStatus("Invalid JSON dropped.", true);
    }
  });

  el.newLayoutBtn.addEventListener("click", () => {
    state.loadedLayoutMeta = null;
    state.bindings = Object.fromEntries(controls.map((c) => [c.id, []]));
    controls.forEach((control) => {
      const defaults = getDefaultControl(control.id);
      control.pos = [...defaults.pos];
      control.rotation = [...getDefaultRotationForControl(control.id, control.kind)];
      control.scale = [...getDefaultScale(control.id)];
    });
    clearAllPaintRegions();
    selectControl(null);
    renderBindings();
  });
  el.debugMapBtn.addEventListener("click", applyDebugBindings);

  el.saveLayoutBtn.addEventListener("click", saveLayoutToStorage);
  el.loadLayoutBtn.addEventListener("click", loadLayoutFromStorage);
  el.fileInput.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    await handleLayoutText(text);
    e.target.value = "";
  });

  el.paintRegionBtn.addEventListener("click", togglePaintMode);
  el.clearRegionBtn.addEventListener("click", clearSelectedPaintRegion);
  el.paintBrushSize.addEventListener("input", () => {
    state.paintBrushSize = Number.parseInt(el.paintBrushSize.value, 10);
    el.paintBrushSizeValue.value = String(state.paintBrushSize);
  });
  el.paintBrushSizeValue.value = String(state.paintBrushSize);
}

function applyLayoutData(json, requireBindings = true) {
  if (requireBindings && (!json.bindings || typeof json.bindings !== "object")) {
    throw new Error("Invalid layout file");
  }

  state.loadedLayoutMeta = json.loadedLayoutMeta ?? null;
  pendingPaintRegions = json.paintRegions && typeof json.paintRegions === "object" ? json.paintRegions : null;
  for (const c of controls) {
    if (json.bindings && typeof json.bindings === "object") {
      state.bindings[c.id] = normalizeBindingValue(json.bindings[c.id]);
    }
    const savedPos = json.controlPositions?.[c.id];
    if (Array.isArray(savedPos) && savedPos.length === 3 && savedPos.every((value) => Number.isFinite(value))) {
      c.pos = [...savedPos];
    }
    const savedRotation = json.controlRotations?.[c.id];
    if (Array.isArray(savedRotation) && savedRotation.length === 3 && savedRotation.every((value) => Number.isFinite(value))) {
      c.rotation = [...savedRotation];
    }
    const savedScale = json.controlScales?.[c.id];
    if (Array.isArray(savedScale) && savedScale.length === 3 && savedScale.every((value) => Number.isFinite(value) && value > 0)) {
      c.scale = [...savedScale];
    }
  }
  applyPendingPaintRegions();
  updateCommunitySummary();
}

async function loadDefaultLayout() {
  try {
    const response = await fetch(DEFAULT_LAYOUT_URL, { cache: "no-store" });
    if (!response.ok) return;
    const json = await response.json();
    applyLayoutData(json, false);
    renderBindings();
    updateSelectionInfo();
  } catch {
    // Keep the app usable even if the default checkpoint is missing.
  }
}

function normalizeBindingValue(value) {
  if (Array.isArray(value) && value.length && typeof value[0] === "object" && value[0] !== null && "type" in value[0]) {
    return value.map((activator, index) => sanitizeActivator(activator, index));
  }
  if (Array.isArray(value)) {
    return value
      .filter((item) => typeof item === "string" && item.trim())
      .map((item, index) => createDefaultActivator(item.trim(), index));
  }
  if (typeof value === "string") {
    return value === "Unmapped" || !value.trim() ? [] : [createDefaultActivator(value.trim(), 0)];
  }
  return [];
}

function createDefaultActivator(binding = "", index = 0) {
  return {
    id: `act_${Date.now()}_${index}_${Math.random().toString(36).slice(2, 7)}`,
    type: "regular_press",
    binding,
    actions: binding ? [{ output: binding, delayMs: 0 }] : [],
    chord: "",
    toggle: false,
    interruptable: true,
    turbo: false,
    cycleBinding: false,
    doubleTapTime: 0.2,
    longPressTime: 0.35,
    fireStartDelay: 0,
    fireEndDelay: 0,
    repeatRate: 0.15,
    haptics: "off",
    notes: ""
  };
}

function sanitizeActivator(value, index = 0) {
  const base = createDefaultActivator("", index);
  const knownTypes = new Set(ACTIVATOR_TYPES.map((item) => item.value));
  const next = {
    ...base,
    ...value
  };
  next.id = typeof next.id === "string" && next.id ? next.id : base.id;
  next.type = knownTypes.has(next.type) ? next.type : base.type;
  next.binding = typeof next.binding === "string" ? next.binding.trim() : "";
  next.actions = normalizeActivatorActions(next.actions);
  if (!next.actions.length && next.binding) {
    next.actions = [{ output: next.binding, delayMs: 0 }];
  }
  if (!next.binding && next.actions.length) {
    next.binding = next.actions[0].output;
  }
  next.chord = typeof next.chord === "string" ? next.chord.trim() : "";
  next.toggle = Boolean(next.toggle);
  next.interruptable = Boolean(next.interruptable);
  next.turbo = Boolean(next.turbo);
  next.cycleBinding = Boolean(next.cycleBinding);
  next.doubleTapTime = clampNumber(next.doubleTapTime, 0, 1, base.doubleTapTime);
  next.longPressTime = clampNumber(next.longPressTime, 0, 1, base.longPressTime);
  next.fireStartDelay = clampNumber(next.fireStartDelay, 0, 1, base.fireStartDelay);
  next.fireEndDelay = clampNumber(next.fireEndDelay, 0, 1, base.fireEndDelay);
  next.repeatRate = clampNumber(next.repeatRate, 0, 1, base.repeatRate);
  next.haptics = ["off", "low", "medium", "high"].includes(next.haptics) ? next.haptics : "off";
  next.notes = typeof next.notes === "string" ? next.notes.trim() : "";
  return next;
}

function normalizeActivatorActions(actions) {
  if (!Array.isArray(actions)) return [];
  return actions
    .map((step) => {
      if (!step || typeof step !== "object") return null;
      const output = typeof step.output === "string" ? step.output.trim() : "";
      if (!output) return null;
      const delayMs = Math.round(clampNumber(step.delayMs, 0, 2000, 0));
      return { output, delayMs };
    })
    .filter(Boolean);
}

function clampNumber(value, min, max, fallback) {
  if (!Number.isFinite(Number(value))) return fallback;
  return Math.min(Math.max(Number(value), min), max);
}

function getControlActivators(controlId) {
  if (state.bindingEditorOpen && state.selectedControlId === controlId) {
    return getControlActivatorsForEditing(controlId);
  }
  const current = normalizeBindingValue(state.bindings[controlId]);
  state.bindings[controlId] = current;
  return current;
}

function getControlActivatorsForEditing(controlId) {
  let current = state.bindings[controlId];
  if (!Array.isArray(current)) {
    current = normalizeBindingValue(current);
    state.bindings[controlId] = current;
  }
  return current;
}

function getBindingSummaryEntries(controlId) {
  return getControlActivators(controlId)
    .filter((activator) => activator.actions.length || activator.binding || activator.chord)
    .map((activator) => formatActivatorSummary(activator));
}

function formatActivatorSummary(activator) {
  const typeLabel = ACTIVATOR_TYPES.find((item) => item.value === activator.type)?.label ?? "Regular Press";
  const parts = [typeLabel];
  if (activator.actions.length) {
    const actionSummary = activator.actions
      .map((step) => {
        const output = step?.output || "Unmapped";
        return step?.delayMs > 0 ? `${output} (+${step.delayMs}ms)` : output;
      })
      .join(" ⟶ ");
    parts.push(actionSummary);
  } else {
    parts.push(activator.binding || "Unmapped");
  }
  if (activator.chord) parts.push(`Chord: ${activator.chord}`);
  if (activator.turbo) parts.push(`Turbo ${(activator.repeatRate * 100).toFixed(0)}%`);
  if (activator.toggle) parts.push("Toggle");
  return parts.join(" • ");
}

function renderBindings() {
  el.bindingsTable.innerHTML = "";
  controls.forEach((control) => {
    const fragment = el.rowTemplate.content.cloneNode(true);
    const tr = fragment.querySelector("tr");
    const nameCell = fragment.querySelector(".control-name");
    const summaryCell = fragment.querySelector(".binding-summary");
    const editBtn = fragment.querySelector(".binding-edit-btn");

    nameCell.textContent = control.name;
    summaryCell.textContent = formatBindingSummary(control.id);

    tr.addEventListener("click", () => {
      selectControl(control.id);
      renderBindings();
    });
    editBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      selectControl(control.id);
      renderBindings();
      showBindingEditor();
    });

    if (state.selectedControlId === control.id) tr.classList.add("selected");
    el.bindingsTable.appendChild(fragment);
  });
}

function updateSelectionInfo() {
  if (!state.selectedControlId) {
    el.selectionInfo.textContent = "No control selected";
    return;
  }
  const control = controls.find((c) => c.id === state.selectedControlId);
  const summary = formatBindingSummary(control.id);
  const layoutLabel = state.loadedLayoutMeta?.title ? ` from ${state.loadedLayoutMeta.title}` : "";
  el.selectionInfo.textContent = `${control.name}${layoutLabel}\n${summary}`;
}

function updateCommunitySummary() {
  if (!state.loadedLayoutMeta) {
    el.currentCommunitySummary.textContent = "No layout loaded yet.";
    return;
  }
  el.currentCommunitySummary.textContent = `${state.loadedLayoutMeta.title} • ${state.loadedLayoutMeta.controller_type_nice || "Community layout"}`;
}

function selectControl(controlId) {
  state.selectedControlId = controlId;
  state.selectedActivatorIndex = 0;
  updateSelectionInfo();
  recolorShellRegions();
  focusSelectedControl();
  if (state.bindingEditorOpen) renderBindingEditor();
}

function showCommunityDialog() {
  state.communityDialogOpen = true;
  el.communityDialogBackdrop.classList.remove("hidden");
}

function hideCommunityDialog() {
  state.communityDialogOpen = false;
  el.communityDialogBackdrop.classList.add("hidden");
}

function initBindingEditor() {
  ACTIVATOR_TYPES.forEach((type) => {
    const option = document.createElement("option");
    option.value = type.value;
    option.textContent = type.label;
    el.bindingEditorType.appendChild(option);
  });
  controls.forEach((control) => {
    const option = document.createElement("option");
    option.value = control.id;
    option.textContent = control.name;
    el.bindingEditorChordAdd.appendChild(option);
  });

  el.bindingEditorBackdrop.addEventListener("click", (event) => {
    if (event.target === el.bindingEditorBackdrop) hideBindingEditor();
  });
  el.bindingEditorCloseBtn.addEventListener("click", hideBindingEditor);
  el.bindingEditorCloseFooterBtn.addEventListener("click", hideBindingEditor);
  el.bindingEditorAddActivatorBtn.addEventListener("click", addActivatorForSelectedControl);
  el.bindingEditorDeleteBtn.addEventListener("click", removeSelectedActivator);
  el.bindingEditorAddStepBtn.addEventListener("click", addActionStepToSelectedActivator);
  el.bindingEditorModeKeysBtn.addEventListener("click", () => setBindingInputMode("keys"));
  el.bindingEditorModeMouseBtn.addEventListener("click", () => setBindingInputMode("mouse"));
  el.bindingEditorClearInputBtn.addEventListener("click", clearSelectedInput);
  el.mouseLeftBtn.addEventListener("click", () => applyMouseToken("Left Mouse"));
  el.mouseRightBtn.addEventListener("click", () => applyMouseToken("Right Mouse"));
  el.mouseMiddleBtn.addEventListener("click", () => applyMouseToken("Middle Mouse"));
  el.mouseWheelUpBtn.addEventListener("click", () => applyMouseToken("Wheel Up"));
  el.mouseWheelDownBtn.addEventListener("click", () => applyMouseToken("Wheel Down"));
  el.bindingEditorToggleAdvancedBtn.addEventListener("click", () => {
    state.bindingEditorAdvancedOpen = !state.bindingEditorAdvancedOpen;
    syncAdvancedVisibility();
  });
  el.bindingEditorChordAdd.addEventListener("change", () => {
    const nextId = el.bindingEditorChordAdd.value;
    if (!nextId) return;
    if (!state.activeChordIds.includes(nextId)) {
      state.activeChordIds.push(nextId);
      persistChordSelectionFromPicker();
    }
    el.bindingEditorChordAdd.value = "";
    renderChordConditionPicker();
  });

  const inputs = [
    el.bindingEditorType,
    el.bindingEditorToggle,
    el.bindingEditorInterruptable,
    el.bindingEditorTurbo,
    el.bindingEditorCycle,
    el.bindingEditorDoubleTap,
    el.bindingEditorLongPress,
    el.bindingEditorStartDelay,
    el.bindingEditorEndDelay,
    el.bindingEditorRepeatRate,
    el.bindingEditorHaptics,
    el.bindingEditorNotes
  ];
  inputs.forEach((input) => {
    const eventName = input.type === "checkbox" ? "change" : "input";
    input.addEventListener(eventName, updateSelectedActivatorFromEditor);
  });
  el.bindingEditorStepInput.addEventListener("keydown", (event) => {
    handleStepInputKeydown(event);
  });
  el.bindingEditorStepInput.addEventListener("input", () => {
    normalizeStepInputAndModifiers(true);
    syncCurrentInputFromEditor();
  });
  syncModifierButtons();
  syncAdvancedVisibility();
  syncInputModeTabs();
}

function buildTokenWithModifiers(token) {
  if (!state.activeStepModifiers.length) return token;
  return `${state.activeStepModifiers.join("+")}+${token}`;
}

function applyMouseToken(token) {
  setBindingInputMode("mouse");
  el.bindingEditorStepInput.value = token;
  normalizeStepInputAndModifiers(true);
  if (!state.bindingEditorOpen || !state.selectedControlId) {
    syncCurrentInputFromEditor();
    el.bindingEditorStepInput.focus();
    return;
  }
  const activators = getControlActivatorsForEditing(state.selectedControlId);
  const active = activators[state.selectedActivatorIndex];
  if (!active) {
    el.bindingEditorStepInput.focus();
    return;
  }
  const composed = composeCurrentInput(token);
  if (!active.actions.length) {
    active.actions = [{ output: composed, delayMs: 0 }];
    state.draftStepIndex = 0;
  } else if (state.draftStepIndex == null || state.draftStepIndex < 0 || state.draftStepIndex >= active.actions.length) {
    active.actions.push({ output: "", delayMs: 0 });
    state.draftStepIndex = active.actions.length - 1;
  }
  active.actions[state.draftStepIndex].output = composed;
  active.binding = active.actions[0]?.output ?? "";
  renderActionStepList(active.actions);
  renderBindings();
  updateSelectionInfo();
  renderBindingOverlays();
  el.bindingEditorStepInput.focus();
}

function handleStepInputKeydown(event) {
  if (event.key === "Tab") {
    event.preventDefault();
  }
  const capture = captureKeypress(event);
  if (!capture) return;
  event.preventDefault();
  setBindingInputMode("keys");
  state.activeStepModifiers = capture.modifiers;
  syncModifierButtons();
  el.bindingEditorStepInput.value = capture.keyToken;
  syncCurrentInputFromEditor();
}

function captureKeypress(event) {
  const key = event.key;
  if (!key || key === "Process") return null;
  const modifiers = [];
  if (event.ctrlKey || key === "Control") modifiers.push("Ctrl");
  if (event.shiftKey || key === "Shift") modifiers.push("Shift");
  if (event.altKey || key === "Alt") modifiers.push("Alt");
  if (event.metaKey || key === "Meta") modifiers.push("Meta");
  if (["Control", "Shift", "Alt", "Meta"].includes(key)) {
    return { modifiers, keyToken: "" };
  }
  return { modifiers, keyToken: normalizeKeyToken(key) };
}

function normalizeKeyToken(key) {
  if (key === " ") return "Space";
  if (key === "Escape") return "Esc";
  if (key === "ArrowUp") return "Up";
  if (key === "ArrowDown") return "Down";
  if (key === "ArrowLeft") return "Left";
  if (key === "ArrowRight") return "Right";
  if (key.length === 1) return key.toUpperCase();
  return key;
}

function setBindingInputMode(mode) {
  if (mode !== "keys" && mode !== "mouse") return;
  state.bindingInputMode = mode;
  syncInputModeTabs();
}

function syncInputModeTabs() {
  const isMouse = state.bindingInputMode === "mouse";
  el.bindingEditorModeKeysBtn.classList.toggle("active", !isMouse);
  el.bindingEditorModeMouseBtn.classList.toggle("active", isMouse);
  el.bindingEditorKeysPanel.classList.toggle("hidden", isMouse);
  el.bindingEditorMousePanel.classList.toggle("hidden", !isMouse);
  focusKeyInputIfVisible();
}

function focusKeyInputIfVisible() {
  if (!state.bindingEditorOpen) return;
  const keysVisible = !el.bindingEditorKeysPanel.classList.contains("hidden");
  if (!keysVisible) return;
  requestAnimationFrame(() => el.bindingEditorStepInput.focus());
}

function clearStepModifiers() {
  state.activeStepModifiers = [];
  syncModifierButtons();
  syncCurrentInputFromEditor();
}

function syncModifierButtons() {
  el.bindingEditorPressedMods.innerHTML = "";
  state.activeStepModifiers.forEach((modifier) => {
    const chip = document.createElement("span");
    chip.className = "pressed-mod-chip";
    chip.textContent = modifier;
    el.bindingEditorPressedMods.appendChild(chip);
  });
  el.bindingEditorPressedMods.classList.toggle("active", state.activeStepModifiers.length > 0);
}

function syncAdvancedVisibility() {
  el.bindingEditorAdvancedColumn.classList.toggle("hidden", !state.bindingEditorAdvancedOpen);
  el.bindingEditorAdvancedBody.classList.toggle("hidden", !state.bindingEditorAdvancedOpen);
  el.bindingEditorGrid.classList.toggle("advanced-open", state.bindingEditorAdvancedOpen);
  el.bindingEditorToggleAdvancedBtn.classList.toggle("active", state.bindingEditorAdvancedOpen);
}

function showBindingEditor() {
  if (!state.selectedControlId) return;
  const control = getControlById(state.selectedControlId);
  el.bindingEditorTitle.textContent = `Edit ${control?.name ?? "Button"}`;
  state.bindingEditorOpen = true;
  state.bindingEditorAdvancedOpen = false;
  state.bindingInputMode = "keys";
  state.activeStepModifiers = [];
  syncModifierButtons();
  syncAdvancedVisibility();
  syncInputModeTabs();
  el.bindingEditorBackdrop.classList.remove("hidden");
  const activators = getControlActivators(state.selectedControlId);
  if (!activators.length) {
    activators.push(createDefaultActivator("", 0));
  }
  state.selectedActivatorIndex = clamp(Math.floor(state.selectedActivatorIndex), 0, activators.length - 1);
  renderBindingEditor();
  focusKeyInputIfVisible();
}

function hideBindingEditor() {
  state.bindingEditorOpen = false;
  el.bindingEditorBackdrop.classList.add("hidden");
}

function renderBindingEditor() {
  if (!state.bindingEditorOpen || !state.selectedControlId) return;
  const activators = getControlActivators(state.selectedControlId);
  if (!activators.length) {
    activators.push(createDefaultActivator("", 0));
  }
  state.selectedActivatorIndex = clamp(Math.floor(state.selectedActivatorIndex), 0, activators.length - 1);
  el.bindingEditorActivatorList.innerHTML = "";
  activators.forEach((activator, index) => {
    const item = document.createElement("li");
    item.className = `editor-list-item${index === state.selectedActivatorIndex ? " active" : ""}`;
    const title = ACTIVATOR_TYPES.find((entry) => entry.value === activator.type)?.label ?? "Regular Press";
    const binding = activator.actions.length ? activator.actions.map((step) => step?.output || "Unmapped").join(" ⟶ ") : (activator.binding || "Unmapped");
    item.innerHTML = `<strong>${escapeHtml(title)}</strong><span>${escapeHtml(binding)}</span>`;
    item.addEventListener("click", () => {
      state.selectedActivatorIndex = index;
      renderBindingEditor();
    });
    el.bindingEditorActivatorList.appendChild(item);
  });

  const active = activators[state.selectedActivatorIndex];
  let draftIndex = null;
  for (let index = active.actions.length - 1; index >= 0; index -= 1) {
    if (!active.actions[index]?.output) {
      draftIndex = index;
      break;
    }
  }
  state.draftStepIndex = draftIndex;
  el.bindingEditorType.value = active.type;
  setChordSelectionFromValue(active.chord);
  el.bindingEditorToggle.checked = active.toggle;
  el.bindingEditorInterruptable.checked = active.interruptable;
  el.bindingEditorTurbo.checked = active.turbo;
  el.bindingEditorCycle.checked = active.cycleBinding;
  el.bindingEditorDoubleTap.value = String(active.doubleTapTime);
  el.bindingEditorLongPress.value = String(active.longPressTime);
  el.bindingEditorStartDelay.value = String(active.fireStartDelay);
  el.bindingEditorEndDelay.value = String(active.fireEndDelay);
  el.bindingEditorRepeatRate.value = String(active.repeatRate);
  el.bindingEditorHaptics.value = active.haptics;
  el.bindingEditorNotes.value = active.notes;
  if (active.actions.length === 0) {
    populateInputFromOutput("");
    syncCurrentInputFromEditor();
  } else {
    el.bindingEditorStepInput.value = "";
    state.activeStepModifiers = [];
    syncModifierButtons();
  }
  renderActionStepList(active.actions);
  focusKeyInputIfVisible();
}

function renderActionStepList(actions) {
  el.bindingEditorStepList.innerHTML = "";
  el.bindingEditorStepAdd.classList.toggle("hidden", actions.length === 0);
  actions.forEach((step, index) => {
    const item = document.createElement("li");
    item.className = `editor-step-item${state.draftStepIndex === index ? " editing" : ""}`;
    const split = splitOutputModifiers(step.output);
    const stepLabel = split.payload || "Unmapped";
    const stepLabelClass = split.payload ? "step-label" : "step-label unmapped";
    item.innerHTML = `
      <div class="step-modifiers">
        ${getStepModifierButtonsMarkup(index, split.modifiers)}
      </div>
      <span class="${stepLabelClass}">${escapeHtml(stepLabel)}</span>
      <label class="step-delay">
        <span class="step-delay-label">Delay</span>
        <input class="step-delay-input" type="number" min="0" max="2000" step="10" value="${step.delayMs}" data-index="${index}" />
        <span>ms</span>
      </label>
      <div class="step-actions">
        <button type="button" data-action="up" data-index="${index}" ${index === 0 ? "disabled" : ""}>↑</button>
        <button type="button" data-action="down" data-index="${index}" ${index === actions.length - 1 ? "disabled" : ""}>↓</button>
        <button type="button" data-action="remove" data-index="${index}">✕</button>
      </div>
    `;
    el.bindingEditorStepList.appendChild(item);
  });
  el.bindingEditorStepList.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.action;
      const index = Number.parseInt(button.dataset.index ?? "-1", 10);
      if (action === "mod") {
        toggleModifierOnActionStep(index, button.dataset.modifier);
        return;
      }
      mutateActionStep(action, index);
    });
  });
  el.bindingEditorStepList.querySelectorAll(".step-delay-input").forEach((input) => {
    input.addEventListener("input", () => {
      const index = Number.parseInt(input.dataset.index ?? "-1", 10);
      const delayMs = Math.round(clampNumber(input.value, 0, 2000, 0));
      updateActionStepDelay(index, delayMs);
    });
  });
}

function addActionStepToSelectedActivator() {
  if (!state.bindingEditorOpen || !state.selectedControlId) return;
  const activators = getControlActivatorsForEditing(state.selectedControlId);
  const active = activators[state.selectedActivatorIndex];
  if (!active) return;
  if (state.draftStepIndex != null && state.draftStepIndex >= 0 && state.draftStepIndex < active.actions.length && !active.actions[state.draftStepIndex]?.output) {
    requestAnimationFrame(() => el.bindingEditorStepInput.focus());
    return;
  }
  active.actions.push({ output: "", delayMs: 0 });
  state.draftStepIndex = active.actions.length - 1;
  active.binding = active.actions[0]?.output ?? "";
  resetDraftStepInput();
  renderActionStepList(active.actions);
  requestAnimationFrame(() => el.bindingEditorStepInput.focus());
}

function mutateActionStep(action, index) {
  if (!state.bindingEditorOpen || !state.selectedControlId) return;
  const activators = getControlActivatorsForEditing(state.selectedControlId);
  const active = activators[state.selectedActivatorIndex];
  if (!active || index < 0 || index >= active.actions.length) return;
  if (action === "remove") {
    active.actions.splice(index, 1);
    if (state.draftStepIndex === index) {
      state.draftStepIndex = null;
      resetDraftStepInput();
    } else if (state.draftStepIndex != null && index < state.draftStepIndex) {
      state.draftStepIndex -= 1;
    }
  } else if (action === "up" && index > 0) {
    [active.actions[index - 1], active.actions[index]] = [active.actions[index], active.actions[index - 1]];
    if (state.draftStepIndex === index) state.draftStepIndex = index - 1;
    else if (state.draftStepIndex === index - 1) state.draftStepIndex = index;
  } else if (action === "down" && index < active.actions.length - 1) {
    [active.actions[index + 1], active.actions[index]] = [active.actions[index], active.actions[index + 1]];
    if (state.draftStepIndex === index) state.draftStepIndex = index + 1;
    else if (state.draftStepIndex === index + 1) state.draftStepIndex = index;
  }
  active.binding = active.actions[0]?.output ?? active.binding;
  renderBindingEditor();
  renderBindings();
  updateSelectionInfo();
  renderBindingOverlays();
}

function updateActionStepDelay(index, delayMs) {
  if (!state.bindingEditorOpen || !state.selectedControlId) return;
  const activators = getControlActivatorsForEditing(state.selectedControlId);
  const active = activators[state.selectedActivatorIndex];
  if (!active || index < 0 || index >= active.actions.length) return;
  active.actions[index].delayMs = delayMs;
  renderBindings();
  updateSelectionInfo();
  renderBindingOverlays();
}

function composeCurrentInput(rawInput) {
  if (!rawInput) return "";
  if (rawInput.includes("+")) return rawInput;
  return buildTokenWithModifiers(rawInput);
}

function splitOutputModifiers(output) {
  const parts = typeof output === "string" ? output.split("+").map((part) => part.trim()).filter(Boolean) : [];
  const modifiers = [];
  const payload = [];
  parts.forEach((part) => {
    if (MODIFIER_TOKENS.includes(part)) {
      if (!modifiers.includes(part)) modifiers.push(part);
    } else {
      payload.push(part);
    }
  });
  return { modifiers, payload: payload.join("+") };
}

function composeOutputWithModifiers(modifiers, payload) {
  const cleanPayload = typeof payload === "string" ? payload.trim() : "";
  if (!cleanPayload) return "";
  const orderedModifiers = MODIFIER_TOKENS.filter((token) => modifiers.includes(token));
  return orderedModifiers.length ? `${orderedModifiers.join("+")}+${cleanPayload}` : cleanPayload;
}

function getStepModifierButtonsMarkup(index, selectedModifiers) {
  const selected = new Set(selectedModifiers);
  return MODIFIER_TOKENS
    .map((modifier) => {
      const activeClass = selected.has(modifier) ? " active" : "";
      return `<button type="button" class="step-mod-btn${activeClass}" data-action="mod" data-index="${index}" data-modifier="${modifier}">${modifier}</button>`;
    })
    .join("");
}

function toggleModifierOnActionStep(index, modifier) {
  if (!state.bindingEditorOpen || !state.selectedControlId) return;
  if (!MODIFIER_TOKENS.includes(modifier)) return;
  const activators = getControlActivatorsForEditing(state.selectedControlId);
  const active = activators[state.selectedActivatorIndex];
  if (!active || index < 0 || index >= active.actions.length) return;
  const step = active.actions[index];
  if (!step) return;
  const split = splitOutputModifiers(step.output);
  if (!split.payload) return;
  const modifiers = [...split.modifiers];
  const modIndex = modifiers.indexOf(modifier);
  if (modIndex >= 0) modifiers.splice(modIndex, 1);
  else modifiers.push(modifier);
  step.output = composeOutputWithModifiers(modifiers, split.payload);
  active.binding = active.actions[0]?.output ?? "";
  renderActionStepList(active.actions);
  renderBindings();
  updateSelectionInfo();
  renderBindingOverlays();
}

function populateInputFromOutput(output) {
  if (!output) {
    el.bindingEditorStepInput.value = "";
    state.activeStepModifiers = [];
    syncModifierButtons();
    return;
  }
  const parts = output.split("+").map((part) => part.trim()).filter(Boolean);
  const modifiers = [];
  const payload = [];
  parts.forEach((part) => {
    if (["Ctrl", "Shift", "Alt", "Meta"].includes(part)) {
      modifiers.push(part);
    } else {
      payload.push(part);
    }
  });
  state.activeStepModifiers = modifiers;
  syncModifierButtons();
  el.bindingEditorStepInput.value = payload.length ? payload.join("+") : output;
}

function normalizeStepInputAndModifiers(enforceSingleToken = false) {
  const raw = el.bindingEditorStepInput.value.trim();
  if (!raw || !raw.includes("+")) return;
  const parts = raw.split("+").map((part) => part.trim()).filter(Boolean);
  const modifiers = [];
  const payload = [];
  parts.forEach((part) => {
    if (["Ctrl", "Shift", "Alt", "Meta"].includes(part)) {
      if (!modifiers.includes(part)) modifiers.push(part);
    } else {
      payload.push(part);
    }
  });
  if (!payload.length) {
    state.activeStepModifiers = modifiers;
    syncModifierButtons();
    el.bindingEditorStepInput.value = "";
    return;
  }
  if (enforceSingleToken && payload.length > 1) {
    payload.splice(0, payload.length - 1);
  }
  state.activeStepModifiers = modifiers;
  syncModifierButtons();
  el.bindingEditorStepInput.value = payload.join("+");
}

function syncCurrentInputFromEditor() {
  const raw = el.bindingEditorStepInput.value.trim();
  const composed = raw ? composeCurrentInput(raw) : "";
  if (!state.bindingEditorOpen || !state.selectedControlId) return;
  const activators = getControlActivatorsForEditing(state.selectedControlId);
  const active = activators[state.selectedActivatorIndex];
  if (!active) return;
  if (active.actions.length === 0) {
    if (composed) {
      active.actions = [{ output: composed, delayMs: 0 }];
      state.draftStepIndex = 0;
      active.binding = composed;
      renderActionStepList(active.actions);
      renderBindings();
      updateSelectionInfo();
      renderBindingOverlays();
    }
    return;
  }
  if (state.draftStepIndex == null || state.draftStepIndex < 0 || state.draftStepIndex >= active.actions.length) {
    state.draftStepIndex = active.actions.length - 1;
  }
  active.actions[state.draftStepIndex].output = composed;
  active.binding = active.actions[0]?.output ?? "";
  renderActionStepList(active.actions);
  renderBindings();
  updateSelectionInfo();
  renderBindingOverlays();
}

function clearSelectedInput() {
  resetDraftStepInput();
  syncCurrentInputFromEditor();
}

function resetDraftStepInput() {
  el.bindingEditorStepInput.value = "";
  state.activeStepModifiers = [];
  syncModifierButtons();
}

function addActivatorForSelectedControl() {
  if (!state.selectedControlId) return;
  const activators = getControlActivators(state.selectedControlId);
  const next = createDefaultActivator("", activators.length);
  activators.push(next);
  state.selectedActivatorIndex = activators.length - 1;
  renderBindingEditor();
  renderBindings();
  updateSelectionInfo();
  renderBindingOverlays();
}

function removeSelectedActivator() {
  if (!state.selectedControlId) return;
  const activators = getControlActivators(state.selectedControlId);
  if (!activators.length) return;
  activators.splice(state.selectedActivatorIndex, 1);
  if (!activators.length) activators.push(createDefaultActivator("", 0));
  state.selectedActivatorIndex = clamp(state.selectedActivatorIndex, 0, activators.length - 1);
  renderBindingEditor();
  renderBindings();
  updateSelectionInfo();
  renderBindingOverlays();
}

function updateSelectedActivatorFromEditor() {
  if (!state.bindingEditorOpen || !state.selectedControlId) return;
  const activators = getControlActivatorsForEditing(state.selectedControlId);
  const active = activators[state.selectedActivatorIndex];
  if (!active) return;
  active.type = el.bindingEditorType.value;
  active.chord = getChordSelectionValue();
  active.toggle = el.bindingEditorToggle.checked;
  active.interruptable = el.bindingEditorInterruptable.checked;
  active.turbo = el.bindingEditorTurbo.checked;
  active.cycleBinding = el.bindingEditorCycle.checked;
  active.doubleTapTime = clampNumber(el.bindingEditorDoubleTap.value, 0, 1, active.doubleTapTime);
  active.longPressTime = clampNumber(el.bindingEditorLongPress.value, 0, 1, active.longPressTime);
  active.fireStartDelay = clampNumber(el.bindingEditorStartDelay.value, 0, 1, active.fireStartDelay);
  active.fireEndDelay = clampNumber(el.bindingEditorEndDelay.value, 0, 1, active.fireEndDelay);
  active.repeatRate = clampNumber(el.bindingEditorRepeatRate.value, 0, 1, active.repeatRate);
  active.haptics = el.bindingEditorHaptics.value;
  active.notes = el.bindingEditorNotes.value.trim();
  active.actions = normalizeActivatorActions(active.actions);
  active.binding = active.actions[0]?.output ?? active.binding;
  renderBindingEditor();
  renderBindings();
  updateSelectionInfo();
  renderBindingOverlays();
}

function parseChordValue(value) {
  if (typeof value !== "string") return [];
  const normalized = value
    .split(/[+,]/)
    .map((token) => token.trim())
    .filter(Boolean);
  const resolved = normalized
    .map((token) => {
      const byId = controls.find((control) => control.id === token);
      if (byId) return byId.id;
      const byName = controls.find((control) => control.name.toLowerCase() === token.toLowerCase());
      return byName?.id ?? null;
    })
    .filter(Boolean);
  return [...new Set(resolved)];
}

function setChordSelectionFromValue(value) {
  state.activeChordIds = parseChordValue(value);
  renderChordConditionPicker();
}

function getChordSelectionValue() {
  const ids = [...state.activeChordIds];
  if (!ids.length) return "";
  return ids
    .map((id) => getControlById(id)?.name || id)
    .join(", ");
}

function renderChordConditionPicker() {
  const selected = state.activeChordIds.filter((id) => Boolean(getControlById(id)));
  state.activeChordIds = [...new Set(selected)];
  el.bindingEditorChordChips.innerHTML = "";
  state.activeChordIds.forEach((id) => {
    const control = getControlById(id);
    if (!control) return;
    const chip = document.createElement("span");
    chip.className = "chord-chip";
    chip.innerHTML = `${escapeHtml(control.name)}<button type="button" data-remove-id="${id}" aria-label="Remove condition">×</button>`;
    el.bindingEditorChordChips.appendChild(chip);
  });
  el.bindingEditorChordChips.querySelectorAll("button[data-remove-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const removeId = button.dataset.removeId;
      state.activeChordIds = state.activeChordIds.filter((id) => id !== removeId);
      persistChordSelectionFromPicker();
      renderChordConditionPicker();
    });
  });
  for (const option of el.bindingEditorChordAdd.options) {
    if (!option.value) continue;
    option.disabled = state.activeChordIds.includes(option.value);
  }
}

function persistChordSelectionFromPicker() {
  if (!state.bindingEditorOpen || !state.selectedControlId) return;
  const activators = getControlActivatorsForEditing(state.selectedControlId);
  const active = activators[state.selectedActivatorIndex];
  if (!active) return;
  active.chord = getChordSelectionValue();
  renderBindings();
  updateSelectionInfo();
  renderBindingOverlays();
}

function formatBindingSummary(controlId) {
  const entries = getBindingSummaryEntries(controlId);
  return entries.length ? entries.join("\n") : "Unmapped";
}

async function searchGames() {
  const query = el.gameSearchInput.value.trim();
  if (!query) {
    setLayoutStatus("Enter a game title to search.");
    return;
  }

  setLayoutStatus(`Searching Steam for "${query}"...`);
  try {
    const response = await fetch(`/api/store-search?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error("Game search failed");
    const payload = await response.json();
    state.gameResults = Array.isArray(payload.items) ? payload.items : [];
    renderGameResults();
    setLayoutStatus(state.gameResults.length ? `Found ${state.gameResults.length} game result(s).` : "No games found.");
  } catch {
    setLayoutStatus("Game search failed. Start the app with the local proxy server.", true);
  }
}

function renderGameResults() {
  el.gameResultsList.innerHTML = "";
  state.gameResults.forEach((game) => {
    const fragment = el.gameResultTemplate.content.cloneNode(true);
    const button = fragment.querySelector(".game-result");
    fragment.querySelector(".result-title").textContent = game.name;
    fragment.querySelector(".result-meta").textContent = `App ${game.id}${game.metascore ? ` • Metascore ${game.metascore}` : ""}`;
    if (state.selectedGame?.id === game.id) button.classList.add("active");
    button.addEventListener("click", () => {
      state.selectedGame = game;
      // Game selection should always fetch all layouts for that app.
      el.layoutSearchInput.value = "";
      renderGameResults();
      void loadCommunityLayouts({ ignoreLayoutSearch: true });
    });
    el.gameResultsList.appendChild(fragment);
  });
}

async function loadCommunityLayouts(options = {}) {
  const { ignoreLayoutSearch = false } = options;
  if (!state.selectedGame?.id) {
    setLayoutStatus("Select a game first.");
    return;
  }

  const params = new URLSearchParams({
    appid: String(state.selectedGame.id),
    sort: el.layoutSortSelect.value,
    controller_type: "controller_neptune"
  });
  const searchText = ignoreLayoutSearch ? "" : el.layoutSearchInput.value.trim();
  if (searchText && searchText !== "*") {
    params.set("searchtext", searchText);
  }

  setLayoutStatus(`Loading community layouts for ${state.selectedGame.name}...`);
  try {
    const response = await fetch(`/api/community-layouts?${params.toString()}`);
    if (!response.ok) throw new Error("Layout search failed");
    const payload = await response.json();
    state.communityLayouts = Array.isArray(payload.layouts) ? payload.layouts : [];
    renderCommunityLayouts();
    setLayoutStatus(
      state.communityLayouts.length
        ? `Loaded ${state.communityLayouts.length} layout(s) for ${state.selectedGame.name}.`
        : `No layouts found for ${state.selectedGame.name}.`
    );
  } catch {
    setLayoutStatus("Community layout loading failed. Start the app with the local proxy server.", true);
  }
}

function renderCommunityLayouts() {
  if (!state.selectedLayoutDetail || !state.communityLayouts.some((layout) => layout.file_id === state.selectedLayoutDetail?.file_id)) {
    state.selectedLayoutDetail = state.communityLayouts[0] ?? null;
  }
  el.layoutResultsList.innerHTML = "";
  state.communityLayouts.forEach((layout) => {
    const fragment = el.layoutResultTemplate.content.cloneNode(true);
    const button = fragment.querySelector(".layout-result");
    fragment.querySelector(".result-title").textContent = layout.title || `Layout ${layout.file_id}`;
    fragment.querySelector(".result-meta").textContent = [
      layout.controller_type_nice ?? "Unknown controller",
      layout.votes?.score != null ? `${Math.round(layout.votes.score * 100)}%` : null,
      layout.subscriptions != null ? `${layout.subscriptions} subs` : null
    ].filter(Boolean).join(" • ");
    fragment.querySelector(".result-description").textContent = layout.description || "No description";
    if (state.selectedLayoutDetail?.file_id === layout.file_id) button.classList.add("active");
    button.disabled = !layout.file_url;
    button.addEventListener("click", () => {
      state.selectedLayoutDetail = layout;
      renderCommunityLayouts();
    });
    el.layoutResultsList.appendChild(fragment);
  });
  renderLayoutDetail();
}

function renderLayoutDetail() {
  const layout = state.selectedLayoutDetail;
  if (!layout) {
    el.layoutDetailTitle.textContent = "Select a layout";
    el.layoutDetailMeta.textContent = "";
    el.layoutDetailDescription.textContent = "";
    el.layoutDetailTags.innerHTML = "";
    el.dialogLoadLayoutBtn.disabled = true;
    return;
  }
  el.layoutDetailTitle.textContent = layout.title || `Layout ${layout.file_id}`;
  const meta = [
    layout.controller_type_nice,
    layout.votes?.score != null ? `${Math.round(layout.votes.score * 100)}%` : null,
    layout.subscriptions != null ? `${layout.subscriptions} subs` : null
  ]
    .filter(Boolean)
    .join(" • ");
  el.layoutDetailMeta.textContent = meta;
  el.layoutDetailDescription.textContent = layout.description || "No description";
  el.layoutDetailTags.innerHTML = "";
  (layout.tags ?? []).slice(0, 6).forEach((tag) => {
    const span = document.createElement("span");
    span.textContent = tag.replaceAll("_", " ");
    el.layoutDetailTags.appendChild(span);
  });
  el.dialogLoadLayoutBtn.disabled = !layout.file_url;
}

async function loadCommunityLayout(layoutMeta) {
  const target = layoutMeta ?? state.selectedLayoutDetail;
  if (!target?.file_url) {
    setLayoutStatus("That layout does not expose a downloadable VDF.", true);
    return;
  }

  setLayoutStatus(`Loading ${target.title}...`);
  try {
    const response = await fetch(`/api/layout-file?url=${encodeURIComponent(target.file_url)}`);
    if (!response.ok) throw new Error("Layout fetch failed");
    const payload = await response.json();
    const parsed = parseVdf(payload.vdf);
    const bindings = extractBindingsFromLayout(parsed);

    state.loadedLayoutMeta = target;
    state.bindings = Object.fromEntries(controls.map((control) => [control.id, bindings[control.id] ?? []]));
    renderCommunityLayouts();
    renderBindings();
    updateSelectionInfo();
    renderBindingOverlays();
    state.selectedLayoutDetail = target;
    renderLayoutDetail();
    setLayoutStatus(`Loaded ${target.title}. ${summarizeLoadedLayout(target)}`);
    updateCommunitySummary();
    hideCommunityDialog();
  } catch {
    setLayoutStatus(`Failed to parse ${target?.title ?? "selected layout"}.`, true);
  }
}

function summarizeLoadedLayout(layoutMeta) {
  const parts = [];
  if (layoutMeta.controller_type_nice) parts.push(layoutMeta.controller_type_nice);
  if (layoutMeta.votes?.score != null) parts.push(`${Math.round(layoutMeta.votes.score * 100)}% approval`);
  if (layoutMeta.tags?.length) parts.push(layoutMeta.tags.slice(0, 3).join(", "));
  return parts.join(" • ");
}

function setLayoutStatus(message, isError = false) {
  el.layoutStatus.textContent = message;
  el.layoutStatus.classList.toggle("error", isError);
}

function applyDebugBindings() {
  controls.forEach((control, index) => {
    const key = DEBUG_KEY_SEQUENCE[index] ?? `F${13 + (index - DEBUG_KEY_SEQUENCE.length)}`;
    state.bindings[control.id] = [createDefaultActivator(`Keyboard: ${key}`, index)];
  });
  renderBindings();
  updateSelectionInfo();
  renderBindingOverlays();
  setLayoutStatus("Debug bindings applied to all controls.", false);
}

function buildLayoutPayload() {
  return {
    version: 1,
    name: "Steam Deck Layout Studio export",
    savedAt: new Date().toISOString(),
    bindings: Object.fromEntries(controls.map((control) => [control.id, getControlActivators(control.id)])),
    loadedLayoutMeta: state.loadedLayoutMeta,
    controlPositions: Object.fromEntries(controls.map((control) => [control.id, control.pos])),
    controlRotations: Object.fromEntries(controls.map((control) => [control.id, control.rotation])),
    controlScales: Object.fromEntries(controls.map((control) => [control.id, control.scale])),
    paintRegions: serializePaintRegions()
  };
}

async function saveLayoutToStorage() {
  const payload = buildLayoutPayload();
  const text = JSON.stringify(payload, null, 2);
  if ("showSaveFilePicker" in window) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: "steamdeck-layout.json",
        types: [
          {
            description: "JSON Files",
            accept: { "application/json": [".json"] }
          }
        ]
      });
      const writable = await handle.createWritable();
      await writable.write(text);
      await writable.close();
      setLayoutStatus("Layout saved via File System Access.", false);
    } catch (error) {
      if (error.name !== "AbortError") setLayoutStatus("Saving layout failed.", true);
    }
  } else {
    const blob = new Blob([text], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "steamdeck-layout.json";
    a.click();
    URL.revokeObjectURL(a.href);
    setLayoutStatus("Layout downloaded locally.", false);
  }
}

async function loadLayoutFromStorage() {
  if ("showOpenFilePicker" in window) {
    try {
      const [handle] = await window.showOpenFilePicker({
        types: [
          {
            description: "JSON Files",
            accept: { "application/json": [".json"] }
          }
        ],
        multiple: false
      });
      if (!handle) return;
      const file = await handle.getFile();
      const text = await file.text();
      await handleLayoutText(text);
      setLayoutStatus("Layout loaded via File System Access.", false);
      return;
    } catch (error) {
      if (error.name === "AbortError") return;
      setLayoutStatus("Loading layout failed.", true);
      return;
    }
  }
  el.fileInput.click();
}

async function handleLayoutText(text) {
  try {
    const json = JSON.parse(text);
    applyLayoutData(json, true);
    renderBindings();
    updateSelectionInfo();
    renderBindingOverlays();
    setLayoutStatus("Layout loaded.", false);
  } catch {
    setLayoutStatus("Invalid layout data.", true);
  }
}

function initScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x070c18);
  scene.fog = new THREE.Fog(0x070c18, 5.5, 11);

  const camera = new THREE.PerspectiveCamera(50, el.deckContainer.clientWidth / el.deckContainer.clientHeight, 0.1, 100);
  camera.position.set(0, 1.2, 5.4);
  sceneCamera = camera;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(el.deckContainer.clientWidth, el.deckContainer.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  el.deckContainer.appendChild(renderer.domElement);

  orbitControls = new OrbitControls(camera, renderer.domElement);
  orbitControls.enableDamping = true;
  orbitControls.target.set(0, 0.15, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 2.15));
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.45);
  keyLight.position.set(4, 6, 5);
  scene.add(keyLight);
  const fillLight = new THREE.DirectionalLight(0xbfd6ff, 0.85);
  fillLight.position.set(-4, 3, 4);
  scene.add(fillLight);
  const frontLight = new THREE.DirectionalLight(0xffffff, 0.75);
  frontLight.position.set(0, 1, 6);
  scene.add(frontLight);
  const rimLight = new THREE.DirectionalLight(0x7aa2ff, 0.6);
  rimLight.position.set(-5, 2, -4);
  scene.add(rimLight);

  const deckRoot = new THREE.Group();
  scene.add(deckRoot);
  loadDeckModel(deckRoot);
  addDecorativeElements(scene);

  const handlePaintPointer = (event, commit = false) => {
    if (!state.paintMode || !state.selectedControlId || !shellMesh) return;
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const shellIntersects = raycaster.intersectObject(shellMesh);
    if (shellIntersects.length) {
      updateShellPreview(shellIntersects[0]);
      if (commit) paintShellRegion(shellIntersects[0]);
    } else if (!commit) {
      shellPreviewFaces.clear();
      recolorShellRegions();
    }
  };

  renderer.domElement.addEventListener("pointerdown", (event) => {
    if (!state.paintMode) return;
    isPainting = true;
    orbitControls.enabled = false;
    handlePaintPointer(event, true);
  });

  renderer.domElement.addEventListener("pointermove", (event) => {
    if (state.paintMode) handlePaintPointer(event, isPainting);
  });

  window.addEventListener("pointerup", () => {
    if (!isPainting) return;
    isPainting = false;
    orbitControls.enabled = !state.paintMode;
  });

  renderer.domElement.addEventListener("click", (event) => {
    if (state.paintMode) return;
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    if (shellMesh) {
      const shellIntersects = raycaster.intersectObject(shellMesh);
      if (shellIntersects.length && shellIntersects[0].faceIndex != null) {
        const owner = shellFaceOwners[shellIntersects[0].faceIndex];
        if (owner) {
          selectControl(owner);
          renderBindings();
        }
      }
    }
  });

  window.addEventListener("resize", () => {
    camera.aspect = el.deckContainer.clientWidth / el.deckContainer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(el.deckContainer.clientWidth, el.deckContainer.clientHeight);
  });

  const animate = () => {
    updateSelectionAnimation();
    orbitControls.update();
    renderBindingOverlays();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };
  animate();
}

function loadDeckModel(deckRoot) {
  const loader = new STLLoader();
  loader.load(
    MODEL_URL,
    (geometry) => {
      geometry.computeVertexNormals();
      geometry.computeBoundingBox();

      const bounds = geometry.boundingBox;
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      bounds.getSize(size);
      bounds.getCenter(center);

      const scale = TARGET_MODEL_WIDTH / size.x;
      geometry.translate(-center.x, -center.y, -center.z);
      geometry.scale(scale, scale, scale);

      geometry.computeBoundingBox();
      const scaledBounds = geometry.boundingBox;
      const scaledSize = new THREE.Vector3();
      scaledBounds.getSize(scaledSize);
      geometry.translate(0, scaledSize.y * 0.18, 0);

      const material = new THREE.MeshStandardMaterial({
        color: 0x2f3747,
        vertexColors: true,
        metalness: 0.28,
        roughness: 0.76
      });
      const colors = new Float32Array(geometry.attributes.position.count * 3);
      for (let i = 0; i < geometry.attributes.position.count; i += 1) {
        colors[i * 3] = 0x2f / 255;
        colors[i * 3 + 1] = 0x37 / 255;
        colors[i * 3 + 2] = 0x47 / 255;
      }
      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      shellGeometry = geometry;
      initializeShellPaintData(geometry);

      const mesh = new THREE.Mesh(geometry, material);
      shellMesh = mesh;
      deckRoot.add(mesh);
      applyPendingPaintRegions();
      setDeckStatus("Steam Deck shell model loaded.");
    },
    undefined,
    () => {
      deckRoot.add(createFallbackDeckBody());
      setDeckStatus("Steam Deck shell model failed to load. Showing fallback body.", true);
    }
  );
}

function createFallbackDeckBody() {
  return new THREE.Mesh(
    new THREE.BoxGeometry(...FALLBACK_BODY_SIZE),
    new THREE.MeshStandardMaterial({ color: 0x202a3f, metalness: 0.25, roughness: 0.7 })
  );
}

function addDecorativeElements(scene) {
  const bezel = new THREE.Mesh(
    new THREE.BoxGeometry(2.28, 1.42, 0.08),
    new THREE.MeshStandardMaterial({ color: 0x111723, metalness: 0.15, roughness: 0.85 })
  );
  bezel.position.set(0, 0.34, 0.145);
  scene.add(bezel);

  const screen = new THREE.Mesh(
    new THREE.BoxGeometry(2.08, 1.22, 0.02),
    new THREE.MeshStandardMaterial({
      color: 0x0a1018,
      emissive: 0x0f1e34,
      emissiveIntensity: 0.18,
      metalness: 0.25,
      roughness: 0.25
    })
  );
  screen.position.set(0, 0.34, 0.185);
  scene.add(screen);
}

function getControlColor(kind) {
  switch (kind) {
    case "face":
      return 0xb7c2d6;
    case "stick":
      return 0x3d4659;
    case "pad":
      return 0x212a3b;
    case "utility":
      return 0x8f9db6;
    case "dpad":
      return 0x909db5;
    case "bumper":
    case "trigger":
    case "rear":
      return 0x2b3446;
    default:
      return 0x62d8ff;
  }
}

function setDeckStatus(message, isError = false) {
  el.deckStatus.textContent = message;
  el.deckStatus.classList.toggle("error", isError);
}

function renderBindingOverlays() {
  if (!sceneCamera || !state.bindingOverlayVisible) {
    el.bindingTags.innerHTML = "";
    el.bindingLines.innerHTML = "";
    return;
  }

  const visibleControls = controls
    .map((control) => {
      const summary = getBindingSummaryEntries(control.id);
      const projected = projectControlPosition(control);
      const normalDir = projectControlNormalDirection(control, projected);
      const shortSummary = summary.length
        ? summary[0].split(",")[0].slice(0, 16)
        : "";
      return { control, summary, projected, shortSummary, normalDir };
    })
    .filter((entry) => entry.summary.length && entry.projected.visible);

  if (!visibleControls.length) {
    el.bindingTags.innerHTML = "";
    el.bindingLines.innerHTML = "";
    return;
  }

  const pivot = computeOverlayPivot(visibleControls);
  const layouts = layoutOverlayAnchors(visibleControls, pivot);

  el.bindingTags.innerHTML = "";
  const lineParts = [];
  let selectedEntry = null;
  for (const entry of layouts) {
    const pointX = entry.projected.x * el.deckContainer.clientWidth;
    const pointY = entry.projected.y * el.deckContainer.clientHeight;
    const selected = state.selectedControlId === entry.control.id;
    if (selected) selectedEntry = entry;
    lineParts.push(
      `<polyline class="binding-line${selected ? " selected" : ""}" points="${pointX},${pointY} ${entry.elbowX},${entry.elbowY} ${entry.anchorX},${entry.anchorY}"></polyline>`,
      `<circle class="binding-bubble${selected ? " selected" : ""}" cx="${entry.anchorX}" cy="${entry.anchorY}" r="${selected ? 5 : 3.6}"></circle>`
    );
  }
  el.bindingLines.innerHTML = lineParts.join("");

  if (selectedEntry) {
    const label = document.createElement("div");
    label.className = "selected-binding-label";
    label.textContent = summarizeOverlayBinding(selectedEntry.control.id);
    let dx = selectedEntry.projected.x - pivot.x;
    let dy = selectedEntry.projected.y - pivot.y;
    const magnitude = Math.hypot(dx, dy) || 1;
    dx /= magnitude;
    dy /= magnitude;
    label.style.left = `${selectedEntry.anchorX + dx * 16}px`;
    label.style.top = `${selectedEntry.anchorY + dy * 16}px`;
    label.style.transform = "translate(-50%, -50%)";
    el.bindingTags.appendChild(label);
  }
}

function summarizeOverlayBinding(controlId) {
  const entries = getBindingSummaryEntries(controlId);
  if (!entries.length) return "Unmapped";
  if (entries.length <= 2) return entries.join(" + ");
  return `${entries.slice(0, 2).join(" + ")} +${entries.length - 2}`;
}

function computeOverlayPivot(entries) {
  if (!entries.length) return { x: 0.5, y: 0.5 };
  const sortedX = entries.map((entry) => entry.projected.x).sort((a, b) => a - b);
  const sortedY = entries.map((entry) => entry.projected.y).sort((a, b) => a - b);
  const mid = Math.floor(entries.length / 2);
  if (entries.length % 2 === 1) {
    return { x: sortedX[mid], y: sortedY[mid] };
  }
  return {
    x: (sortedX[mid - 1] + sortedX[mid]) / 2,
    y: (sortedY[mid - 1] + sortedY[mid]) / 2
  };
}

function layoutOverlayAnchors(entries, pivot) {
  const width = el.deckContainer.clientWidth;
  const height = el.deckContainer.clientHeight;
  const margin = 8;
  const bubbleDiameter = 10;
  const stubWorldLength = 0.12;
  const gapWorldLength = 0.31;
  const placed = entries.map((entry) => {
    const pointX = entry.projected.x * width;
    const pointY = entry.projected.y * height;
    const normalDirX = entry.normalDir?.x ?? 0;
    const normalDirY = entry.normalDir?.y ?? -1;
    const pxPerWorld = entry.normalDir?.pixelScale ?? 180;
    const stubLength = clamp(stubWorldLength * pxPerWorld, 18, 70);
    const gap = clamp(gapWorldLength * pxPerWorld, 24, 150);
    let dx = entry.projected.x - pivot.x;
    let dy = entry.projected.y - pivot.y;
    if (Math.hypot(dx, dy) < 0.0001) {
      dx = entry.projected.x - 0.5;
      dy = entry.projected.y - 0.5;
    }
    const route = getStableOverlayRoute(entry.control.id, dx, dy);
    const primary = route.primary;
    const dir = route.dir;
    const directionalDir = getControlDirectionalOverlay(entry.control);
    const useDirectional = Boolean(directionalDir);

    let bubbleX = pointX;
    let bubbleY = pointY;
    const elbowX = pointX + normalDirX * stubLength;
    const elbowY = pointY + normalDirY * stubLength;

    if (useDirectional) {
      bubbleX = elbowX + directionalDir.x * gap;
      bubbleY = elbowY + directionalDir.y * gap;
    } else if (primary === "x") {
      bubbleX = elbowX + dir * gap;
      bubbleY = pointY + clamp(dy * 18, -10, 10);
    } else {
      bubbleY = elbowY + dir * gap;
      bubbleX = pointX + clamp(dx * 20, -12, 12);
    }

    bubbleX = clamp(bubbleX, margin + bubbleDiameter / 2, width - margin - bubbleDiameter / 2);
    bubbleY = clamp(bubbleY, margin + bubbleDiameter / 2, height - margin - bubbleDiameter / 2);

    return {
      ...entry,
      primary,
      dir,
      tagWidth: bubbleDiameter,
      tagHeight: bubbleDiameter,
      tagX: bubbleX,
      tagY: bubbleY,
      elbowX,
      elbowY,
      anchorX: bubbleX,
      anchorY: bubbleY
    };
  });

  for (let pass = 0; pass < 2; pass += 1) {
    for (let i = 0; i < placed.length; i += 1) {
      for (let j = i + 1; j < placed.length; j += 1) {
        const a = placed[i];
        const b = placed[j];
        const dx = a.tagX - b.tagX;
        const dy = a.tagY - b.tagY;
        const overlapX = (a.tagWidth + b.tagWidth) / 2 + 4 - Math.abs(dx);
        const overlapY = (a.tagHeight + b.tagHeight) / 2 + 4 - Math.abs(dy);
        if (overlapX <= 0 || overlapY <= 0) continue;
        if (Math.abs(dy) <= Math.abs(dx)) {
          const push = overlapY / 2;
          a.tagY += dy >= 0 ? push : -push;
          b.tagY += dy >= 0 ? -push : push;
        } else {
          const push = overlapX / 2;
          a.tagX += dx >= 0 ? push : -push;
          b.tagX += dx >= 0 ? -push : push;
        }
        a.tagX = clamp(a.tagX, margin + a.tagWidth / 2, width - margin - a.tagWidth / 2);
        b.tagX = clamp(b.tagX, margin + b.tagWidth / 2, width - margin - b.tagWidth / 2);
        a.tagY = clamp(a.tagY, margin + a.tagHeight / 2, height - margin - a.tagHeight / 2);
        b.tagY = clamp(b.tagY, margin + b.tagHeight / 2, height - margin - b.tagHeight / 2);
      }
    }
  }

  return placed.map((entry) => {
    const anchorX = entry.tagX;
    const anchorY = entry.tagY;
      return {
        ...entry,
        anchorX,
        anchorY,
        elbowX: entry.elbowX,
        elbowY: entry.elbowY
      };
  });
}

function getStableOverlayRoute(controlId, dx, dy) {
  const AXIS_SWITCH_MARGIN = 0.05;
  const SIGN_SWITCH_DEADZONE = 0.03;

  const nextPrimary = Math.abs(dx) >= Math.abs(dy) ? "x" : "y";
  const nextDir = nextPrimary === "x"
    ? (dx >= 0 ? 1 : -1)
    : (dy >= 0 ? 1 : -1);

  const cached = overlayRouteCache.get(controlId);
  if (!cached) {
    const initial = { primary: nextPrimary, dir: nextDir };
    overlayRouteCache.set(controlId, initial);
    return initial;
  }

  let primary = cached.primary;
  let dir = cached.dir;
  const dominance = Math.abs(Math.abs(dx) - Math.abs(dy));
  if (nextPrimary !== primary && dominance > AXIS_SWITCH_MARGIN) {
    primary = nextPrimary;
    dir = nextDir;
  }

  const currentComponent = primary === "x" ? dx : dy;
  const desiredDir = currentComponent >= 0 ? 1 : -1;
  if (desiredDir !== dir && Math.abs(currentComponent) > SIGN_SWITCH_DEADZONE) {
    dir = desiredDir;
  }

  const stable = { primary, dir };
  overlayRouteCache.set(controlId, stable);
  return stable;
}

function getControlDirectionalOverlay(control) {
  if (control.id === "dpad_up" || control.id === "y") {
    overlayDirectionAxis.set(0, 1, 0);
  } else if (control.id === "dpad_down" || control.id === "a") {
    overlayDirectionAxis.set(0, -1, 0);
  } else if (control.id === "dpad_left" || control.id === "x") {
    overlayDirectionAxis.set(-1, 0, 0);
  } else if (control.id === "dpad_right" || control.id === "b") {
    overlayDirectionAxis.set(1, 0, 0);
  } else {
    return null;
  }

  overlayControlPosition.set(control.pos[0], control.pos[1], control.pos[2]);
  overlayDirectionTip.copy(overlayControlPosition).addScaledVector(overlayDirectionAxis, 0.18);
  overlayProjectedPoint.copy(overlayControlPosition).project(sceneCamera);
  overlayProjectedTip.copy(overlayDirectionTip).project(sceneCamera);
  let dirX = (overlayProjectedTip.x - overlayProjectedPoint.x) * 0.5 * el.deckContainer.clientWidth;
  let dirY = -(overlayProjectedTip.y - overlayProjectedPoint.y) * 0.5 * el.deckContainer.clientHeight;
  const length = Math.hypot(dirX, dirY);
  if (length < 1e-3) return null;
  dirX /= length;
  dirY /= length;
  return { x: dirX, y: dirY };
}

function projectControlPosition(control) {
  overlayControlPosition.set(control.pos[0], control.pos[1], control.pos[2]);
  overlayProjectedPoint.copy(overlayControlPosition).project(sceneCamera);
  const inFrustum = (
    overlayProjectedPoint.x >= -1 &&
    overlayProjectedPoint.x <= 1 &&
    overlayProjectedPoint.y >= -1 &&
    overlayProjectedPoint.y <= 1 &&
    overlayProjectedPoint.z >= -1 &&
    overlayProjectedPoint.z <= 1
  );
  sceneCamera.getWorldPosition(overlayCameraPosition);
  overlayCameraFromCenter.copy(overlayCameraPosition).sub(overlayDeckCenter).normalize();
  overlayControlFromCenter.copy(overlayControlPosition).sub(overlayDeckCenter).normalize();
  const hemisphereScore = overlayCameraFromCenter.dot(overlayControlFromCenter);
  overlayControlToCamera.copy(overlayCameraPosition).sub(overlayControlPosition).normalize();
  overlayFacingNormal.copy(getControlSurfaceNormal(control));
  const facingScore = overlayFacingNormal.dot(overlayControlToCamera);
  return {
    x: (overlayProjectedPoint.x + 1) / 2,
    y: (-overlayProjectedPoint.y + 1) / 2,
    depth: (overlayProjectedPoint.z + 1) / 2,
    visible: inFrustum && hemisphereScore > -0.02 && facingScore > 0.06
  };
}

function projectControlNormalDirection(control, projected) {
  overlayControlPosition.set(control.pos[0], control.pos[1], control.pos[2]);
  overlayControlNormal.copy(getControlSurfaceNormal(control));

  overlayNormalTip.copy(overlayControlPosition).addScaledVector(overlayControlNormal, 0.18);
  overlayProjectedPoint.copy(overlayControlPosition).project(sceneCamera);
  overlayProjectedTip.copy(overlayNormalTip).project(sceneCamera);

  let dirX = (overlayProjectedTip.x - overlayProjectedPoint.x) * 0.5 * el.deckContainer.clientWidth;
  let dirY = -(overlayProjectedTip.y - overlayProjectedPoint.y) * 0.5 * el.deckContainer.clientHeight;
  const length = Math.hypot(dirX, dirY);
  if (length > 1e-3) {
    return { x: dirX / length, y: dirY / length, pixelScale: length / 0.18 };
  }

  const fallbackX = projected.x - 0.5;
  const fallbackY = projected.y - 0.5;
  const fallbackLength = Math.hypot(fallbackX, fallbackY) || 1;
  const fallbackDistance = overlayControlPosition.distanceTo(overlayCameraPosition);
  const fallbackScale = (el.deckContainer.clientHeight / (2 * Math.tan(THREE.MathUtils.degToRad(sceneCamera.fov) / 2))) / Math.max(0.001, fallbackDistance);
  return { x: fallbackX / fallbackLength, y: fallbackY / fallbackLength, pixelScale: fallbackScale };
}

function getControlSurfaceNormal(control) {
  const cached = controlSurfaceNormals.get(control.id);
  if (cached) return applyRearNormalBias(control, cached.clone());
  const fallback = getFallbackRegionNormal(control).clone();
  const controlPoint = new THREE.Vector3(...control.pos);
  const outward = controlPoint.sub(overlayDeckCenter);
  if (outward.lengthSq() > 1e-6 && fallback.dot(outward) < 0) {
    fallback.multiplyScalar(-1);
  }
  return applyRearNormalBias(control, fallback);
}

function applyRearNormalBias(control, normal) {
  if (control.kind !== "rear") return normal;
  const rearDown = new THREE.Vector3(0, -0.45, -1).normalize();
  normal.multiplyScalar(0.35).addScaledVector(rearDown, 0.65).normalize();
  return normal;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function parseVdf(text) {
  const tokens = tokenizeVdf(text);
  let index = 0;

  function parseValue() {
    const token = tokens[index];
    if (!token) return null;
    if (token.type === "{") {
      index += 1;
      return parseObject();
    }
    index += 1;
    return token.value;
  }

  function parseObject() {
    const result = {};
    while (index < tokens.length) {
      const token = tokens[index];
      if (!token) break;
      if (token.type === "}") {
        index += 1;
        break;
      }
      if (token.type !== "string") {
        index += 1;
        continue;
      }
      const key = token.value;
      index += 1;
      const value = parseValue();
      if (Object.hasOwn(result, key)) {
        result[key] = Array.isArray(result[key]) ? [...result[key], value] : [result[key], value];
      } else {
        result[key] = value;
      }
    }
    return result;
  }

  return parseObject();
}

function tokenizeVdf(text) {
  const tokens = [];
  let index = 0;

  while (index < text.length) {
    const char = text[index];
    if (/\s/.test(char)) {
      index += 1;
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "{", value: "{" });
      index += 1;
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "}", value: "}" });
      index += 1;
      continue;
    }
    if (char === "\"") {
      let value = "";
      index += 1;
      while (index < text.length) {
        const current = text[index];
        if (current === "\\" && index + 1 < text.length) {
          value += text[index + 1];
          index += 2;
          continue;
        }
        if (current === "\"") {
          index += 1;
          break;
        }
        value += current;
        index += 1;
      }
      tokens.push({ type: "string", value });
      continue;
    }
    index += 1;
  }

  return tokens;
}

function extractBindingsFromLayout(parsedLayout) {
  const mappings = parsedLayout.controller_mappings ?? parsedLayout;
  const groups = Object.fromEntries(arrayify(mappings.group).map((group) => [group.id, group]));
  const preset = arrayify(mappings.preset)[0];
  const bindings = Object.fromEntries(controls.map((control) => [control.id, []]));
  if (!preset?.group_source_bindings) return bindings;

  for (const [groupId, descriptor] of Object.entries(preset.group_source_bindings)) {
    if (typeof descriptor !== "string") continue;
    const parts = descriptor.trim().split(/\s+/);
    if (parts.at(-1) !== "active") continue;
    const source = parts[0];
    const group = groups[groupId];
    if (!group) continue;
    applyGroupBindings(bindings, source, group);
  }

  for (const controlId of Object.keys(bindings)) {
    bindings[controlId] = dedupeStrings(bindings[controlId]);
  }
  return bindings;
}

function applyGroupBindings(bindings, source, group) {
  const inputs = group.inputs ?? {};
  if (source === "button_diamond") {
    bindInput(bindings, "a", inputs.button_a);
    bindInput(bindings, "b", inputs.button_b);
    bindInput(bindings, "x", inputs.button_x);
    bindInput(bindings, "y", inputs.button_y);
    return;
  }
  if (source === "dpad") {
    bindInput(bindings, "dpad_up", inputs.dpad_north);
    bindInput(bindings, "dpad_down", inputs.dpad_south);
    bindInput(bindings, "dpad_left", inputs.dpad_west);
    bindInput(bindings, "dpad_right", inputs.dpad_east);
    return;
  }
  if (source === "left_trackpad" || source === "right_trackpad") {
    const controlId = source === "left_trackpad" ? "left_pad" : "right_pad";
    bindCompoundInput(bindings, controlId, inputs, {
      click: "Click",
      dpad_north: "North",
      dpad_south: "South",
      dpad_east: "East",
      dpad_west: "West",
      touch: "Touch"
    });
    return;
  }
  if (source === "joystick" || source === "left_joystick") {
    bindCompoundInput(bindings, "left_stick", inputs, { click: "Click" });
    return;
  }
  if (source === "right_joystick") {
    bindCompoundInput(bindings, "right_stick", inputs, { click: "Click" });
    return;
  }
  if (source === "left_trigger") {
    bindCompoundInput(bindings, "left_trigger", inputs, { edge: "Pull", Soft_Pull: "Soft", Full_Pull: "Full" });
    return;
  }
  if (source === "right_trigger") {
    bindCompoundInput(bindings, "right_trigger", inputs, { edge: "Pull", Soft_Pull: "Soft", Full_Pull: "Full" });
    return;
  }
  if (source === "switch") {
    const switchMap = {
      button_escape: "view",
      button_menu: "menu",
      button_steam: "steam",
      button_capture: "quick_access",
      left_bumper: "left_bumper",
      right_bumper: "right_bumper",
      button_back_left: "left_grip_4",
      button_back_right: "right_grip_4",
      button_back_left_upper: "left_grip_4",
      button_back_left_lower: "left_grip_5",
      button_back_right_upper: "right_grip_4",
      button_back_right_lower: "right_grip_5"
    };
    for (const [inputName, controlId] of Object.entries(switchMap)) {
      bindInput(bindings, controlId, inputs[inputName]);
    }
  }
}

function bindInput(bindings, controlId, input) {
  if (!input || !bindings[controlId]) return;
  const summaries = summarizeInputBindings(input);
  bindings[controlId].push(...summaries);
}

function bindCompoundInput(bindings, controlId, inputs, labels) {
  if (!bindings[controlId]) return;
  for (const [inputName, label] of Object.entries(labels)) {
    const summaries = summarizeInputBindings(inputs[inputName]);
    if (!summaries.length) continue;
    bindings[controlId].push(`${label}: ${summaries.join(", ")}`);
  }
}

function summarizeInputBindings(input) {
  if (!input || typeof input !== "object") return [];
  const collected = [];
  collectBindingStrings(input, collected);
  return dedupeStrings(collected.map(formatBindingText).filter(Boolean));
}

function collectBindingStrings(value, output) {
  if (!value) return;
  if (typeof value === "string") {
    output.push(value);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectBindingStrings(item, output));
    return;
  }
  for (const [key, nested] of Object.entries(value)) {
    if (key.startsWith("disabled_")) continue;
    if (key === "binding" && typeof nested === "string") {
      output.push(nested);
    } else {
      collectBindingStrings(nested, output);
    }
  }
}

function formatBindingText(binding) {
  const [commandPart, labelPart] = binding.split(",").map((part) => part.trim());
  if (labelPart) return labelPart;

  const [command, ...rest] = commandPart.split(/\s+/);
  const arg = rest.join(" ").trim();
  if (!command) return "";

  switch (command) {
    case "key_press":
      return `Key ${formatToken(arg)}`;
    case "mouse_button":
      return `Mouse ${formatToken(arg)}`;
    case "xinput_button":
      return `Pad ${formatToken(arg)}`;
    case "mode_shift":
      return `Mode Shift ${formatToken(arg)}`;
    case "controller_action":
      return formatToken(arg);
    default:
      return `${formatToken(command)}${arg ? ` ${formatToken(arg)}` : ""}`.trim();
  }
}

function formatToken(value) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function dedupeStrings(values) {
  return [...new Set(values.filter(Boolean))];
}

function arrayify(value) {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

function getDefaultControl(controlId) {
  return DEFAULT_CONTROLS.find((control) => control.id === controlId);
}

function getDefaultScale(controlId) {
  return getDefaultControl(controlId)?.scale ?? [1, 1, 1];
}

function getDefaultRotationForControl(controlId, kind) {
  return getDefaultControl(controlId)?.rotation ?? getDefaultRotation(kind);
}

function getDefaultRotation(kind) {
  if (kind === "stick" || kind === "face") return [Math.PI / 2, 0, 0];
  if (kind === "trigger") return [-0.35, 0, 0];
  if (kind === "bumper") return [-0.18, 0, 0];
  if (kind === "rear") return [0.6, 0, 0];
  return [0, 0, 0];
}

function focusSelectedControl() {
  if (!sceneCamera || !orbitControls || !state.selectedControlId) {
    selectionAnimation = null;
    return;
  }

  const framing = getControlFraming(state.selectedControlId);
  if (!framing) return;

  selectionAnimation = {
    startTime: performance.now(),
    durationMs: 750,
    startPosition: sceneCamera.position.clone(),
    endPosition: framing.cameraPosition,
    startTarget: orbitControls.target.clone(),
    endTarget: framing.target
  };
}

function updateSelectionAnimation() {
  if (!selectionAnimation || !sceneCamera || !orbitControls) return;

  const elapsed = performance.now() - selectionAnimation.startTime;
  const t = Math.min(1, elapsed / selectionAnimation.durationMs);
  const eased = easeInOutCubic(t);

  sceneCamera.position.lerpVectors(selectionAnimation.startPosition, selectionAnimation.endPosition, eased);
  orbitControls.target.lerpVectors(selectionAnimation.startTarget, selectionAnimation.endTarget, eased);

  if (t >= 1) {
    selectionAnimation = null;
  }
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2;
}

function getControlFraming(controlId) {
  const control = getControlById(controlId);
  if (!control) return null;

  const regionFaces = getPaintedRegionFaces(controlId);
  const stats = regionFaces.length ? getPaintedRegionStats(regionFaces) : getFallbackControlStats(control);
  if (!stats) return null;

  const fitFraction = 0.4;
  const verticalFov = THREE.MathUtils.degToRad(sceneCamera.fov);
  const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * sceneCamera.aspect);
  const fitDistance = Math.max(
    stats.radius / (Math.tan(verticalFov / 2) * fitFraction),
    stats.radius / (Math.tan(horizontalFov / 2) * fitFraction)
  );
  const distance = THREE.MathUtils.clamp(fitDistance * 1.15, 0.85, 4.8);
  const viewDirection = getPreferredViewDirection(control, stats.normal);

  return {
    target: stats.center.clone(),
    cameraPosition: stats.center.clone().add(viewDirection.multiplyScalar(distance))
  };
}

function getPaintedRegionFaces(controlId) {
  const regionFaces = [];
  for (let faceIndex = 0; faceIndex < shellFaceOwners.length; faceIndex += 1) {
    if (shellFaceOwners[faceIndex] === controlId) regionFaces.push(faceIndex);
  }
  return regionFaces;
}

function getPaintedRegionStats(regionFaces) {
  if (!regionFaces.length) return null;

  const center = new THREE.Vector3();
  const normal = new THREE.Vector3();
  for (const faceIndex of regionFaces) {
    center.add(shellFaceCentroids[faceIndex]);
    normal.add(shellFaceNormals[faceIndex]);
  }
  center.divideScalar(regionFaces.length);
  if (normal.lengthSq() < 1e-6) {
    normal.set(0, 0, 1);
  } else {
    normal.normalize();
  }
  const outward = center.clone().sub(overlayDeckCenter);
  if (outward.lengthSq() > 1e-6 && normal.dot(outward) < 0) {
    normal.multiplyScalar(-1);
  }

  let radius = 0.08;
  for (const faceIndex of regionFaces) {
    radius = Math.max(radius, shellFaceCentroids[faceIndex].distanceTo(center));
  }

  return {
    center,
    normal,
    radius: Math.max(radius * 1.2, 0.09)
  };
}

function getFallbackControlStats(control) {
  const scale = control.scale ?? [1, 1, 1];
  const extents = control.size.map((value, index) => Math.abs(value * scale[index]));
  const saneExtents = extents
    .filter((value) => Number.isFinite(value) && value > 0)
    .map((value) => Math.min(value, 0.8));
  const radius = Math.max(0.09, ...(saneExtents.length ? saneExtents : [0.12])) * 0.6;

  return {
    center: new THREE.Vector3(...control.pos),
    normal: getFallbackRegionNormal(control),
    radius
  };
}

function getFallbackRegionNormal(control) {
  if (control.kind === "rear") return new THREE.Vector3(0, 0, -1);
  if (control.kind === "trigger" || control.kind === "bumper") return new THREE.Vector3(0, 0.4, -1).normalize();
  return new THREE.Vector3(0, 0, 1);
}

function getPreferredViewDirection(control, normal) {
  if (control.kind === "rear") {
    // Rear paddles should frame from the back side of the deck, not from the front.
    const side = Math.sign(control.pos[0]) || 1;
    return new THREE.Vector3(side * 0.28, 0.18, -1).normalize();
  }

  const preferred = normal.clone();
  if (preferred.lengthSq() < 1e-6) return getFallbackRegionNormal(control);

  if (control.kind === "trigger" || control.kind === "bumper") {
    preferred.y += 0.55;
  } else {
    preferred.y += 0.12;
    preferred.z += preferred.z >= 0 ? 0.18 : -0.18;
  }

  if (Math.abs(preferred.y) > 0.92) {
    preferred.z += preferred.z >= 0 ? 0.25 : -0.25;
  }

  return preferred.normalize();
}

function togglePaintMode() {
  state.paintMode = !state.paintMode;
  el.paintRegionBtn.classList.toggle("active", state.paintMode);
  el.paintRegionBtn.classList.toggle("warn", state.paintMode);
  orbitControls.enabled = !state.paintMode;
  shellPreviewFaces.clear();
  recolorShellRegions();
  setDeckStatus(
    state.paintMode && state.selectedControlId
      ? "Paint mode active. Click the shell to assign a region to the selected control."
      : "Steam Deck shell model loaded."
  );
}

function clearSelectedPaintRegion() {
  if (!state.selectedControlId || !shellGeometry) return;
  let changed = false;
  for (let i = 0; i < shellFaceOwners.length; i += 1) {
    if (shellFaceOwners[i] === state.selectedControlId) {
      shellFaceOwners[i] = null;
      changed = true;
    }
  }
  if (changed) {
    controlSurfaceNormals.delete(state.selectedControlId);
    recolorShellRegions();
  }
}

function clearAllPaintRegions() {
  if (!shellGeometry) {
    pendingPaintRegions = null;
    return;
  }
  shellFaceOwners.fill(null);
  controlSurfaceNormals.clear();
  shellPreviewFaces.clear();
  recolorShellRegions();
}

function updateShellPreview(intersection) {
  if (!shellGeometry || intersection.faceIndex == null) return;
  shellPreviewFaces = collectShellFaces(intersection.faceIndex, intersection.point);
  recolorShellRegions();
}

function paintShellRegion(intersection) {
  if (!shellGeometry || intersection.faceIndex == null) return;
  const regionFaces = collectShellFaces(intersection.faceIndex, intersection.point);
  for (const faceIndex of regionFaces) {
    shellFaceOwners[faceIndex] = state.selectedControlId;
  }
  shellPreviewFaces = new Set(regionFaces);
  recolorShellRegions();
  updateControlFromPaintedRegion(state.selectedControlId);
}

function collectShellFaces(seedFaceIndex, hitPoint) {
  if (!shellFaceCentroids.length) return new Set();

  const maxSteps = Math.max(1, state.paintBrushSize);
  const maxDistance = 0.04 + state.paintBrushSize * 0.03;
  const visited = new Set([seedFaceIndex]);
  const result = new Set();
  const queue = [{ faceIndex: seedFaceIndex, depth: 0 }];

  while (queue.length) {
    const { faceIndex, depth } = queue.shift();
    const centroid = shellFaceCentroids[faceIndex];
    if (centroid.distanceTo(hitPoint) <= maxDistance) {
      result.add(faceIndex);
    }
    if (depth >= maxSteps) continue;

    for (const neighbor of shellFaceAdjacency[faceIndex] ?? []) {
      if (visited.has(neighbor)) continue;
      visited.add(neighbor);
      if (shellFaceCentroids[neighbor].distanceTo(hitPoint) <= maxDistance * 1.35) {
        queue.push({ faceIndex: neighbor, depth: depth + 1 });
      }
    }
  }

  return result;
}

function recolorShellRegions() {
  if (!shellGeometry) return;
  const colorAttr = shellGeometry.getAttribute("color");
  const baseColor = new THREE.Color(0x2f3747);
  const paintedColor = new THREE.Color(0xff4d4d);
  const selectedColor = new THREE.Color(state.paintMode ? 0xff9999 : 0xff7373);
  const previewColor = new THREE.Color(0xffa366);

  for (let faceIndex = 0; faceIndex < shellFaceOwners.length; faceIndex += 1) {
    const owner = shellFaceOwners[faceIndex];
    const color = shellPreviewFaces.has(faceIndex)
      ? previewColor
      : owner && owner === state.selectedControlId
        ? selectedColor
      : owner
        ? paintedColor
        : baseColor;
    for (let vertexOffset = 0; vertexOffset < 3; vertexOffset += 1) {
      const vertexIndex = faceIndex * 3 + vertexOffset;
      colorAttr.setXYZ(vertexIndex, color.r, color.g, color.b);
    }
  }

  colorAttr.needsUpdate = true;
}

function updateControlFromPaintedRegion(controlId) {
  const control = getControlById(controlId);
  if (!control || !shellGeometry) return;
  const regionFaces = getPaintedRegionFaces(controlId);
  if (!regionFaces.length) {
    controlSurfaceNormals.delete(controlId);
    return;
  }
  const regionStats = getPaintedRegionStats(regionFaces);
  if (regionStats) controlSurfaceNormals.set(controlId, regionStats.normal.clone());
  const anchor = getStableRegionAnchor(regionFaces);
  control.pos = [anchor.x, anchor.y, anchor.z];
  recolorShellRegions();
  updateSelectionInfo();
}

function getStableRegionAnchor(regionFaces) {
  const average = new THREE.Vector3();
  for (const faceIndex of regionFaces) {
    average.add(shellFaceCentroids[faceIndex]);
  }
  average.divideScalar(regionFaces.length);

  let bestFace = regionFaces[0];
  let bestDistance = shellFaceCentroids[bestFace].distanceToSquared(average);
  for (const faceIndex of regionFaces) {
    const distance = shellFaceCentroids[faceIndex].distanceToSquared(average);
    if (distance < bestDistance) {
      bestFace = faceIndex;
      bestDistance = distance;
    }
  }

  return shellFaceCentroids[bestFace].clone();
}

function initializeShellPaintData(geometry) {
  const position = geometry.attributes.position;
  const faceCount = position.count / 3;
  shellFaceOwners = new Array(faceCount).fill(null);
  shellFaceCentroids = new Array(faceCount);
  shellFaceNormals = new Array(faceCount);
  shellFaceAdjacency = Array.from({ length: faceCount }, () => new Set());

  const vertexToFaces = new Map();
  for (let faceIndex = 0; faceIndex < faceCount; faceIndex += 1) {
    shellFaceCentroids[faceIndex] = getFaceCentroid(position, faceIndex);
    shellFaceNormals[faceIndex] = getFaceNormal(position, faceIndex);
    for (let vertexOffset = 0; vertexOffset < 3; vertexOffset += 1) {
      const vertexIndex = faceIndex * 3 + vertexOffset;
      const key = getVertexKey(position, vertexIndex);
      if (!vertexToFaces.has(key)) vertexToFaces.set(key, []);
      vertexToFaces.get(key).push(faceIndex);
    }
  }

  for (const faces of vertexToFaces.values()) {
    for (const faceA of faces) {
      for (const faceB of faces) {
        if (faceA !== faceB) shellFaceAdjacency[faceA].add(faceB);
      }
    }
  }
}

function getFaceCentroid(positionAttr, faceIndex) {
  const centroid = new THREE.Vector3();
  for (let vertexOffset = 0; vertexOffset < 3; vertexOffset += 1) {
    const vertexIndex = faceIndex * 3 + vertexOffset;
    centroid.x += positionAttr.getX(vertexIndex);
    centroid.y += positionAttr.getY(vertexIndex);
    centroid.z += positionAttr.getZ(vertexIndex);
  }
  return centroid.multiplyScalar(1 / 3);
}

function getFaceNormal(positionAttr, faceIndex) {
  const a = new THREE.Vector3(
    positionAttr.getX(faceIndex * 3),
    positionAttr.getY(faceIndex * 3),
    positionAttr.getZ(faceIndex * 3)
  );
  const b = new THREE.Vector3(
    positionAttr.getX(faceIndex * 3 + 1),
    positionAttr.getY(faceIndex * 3 + 1),
    positionAttr.getZ(faceIndex * 3 + 1)
  );
  const c = new THREE.Vector3(
    positionAttr.getX(faceIndex * 3 + 2),
    positionAttr.getY(faceIndex * 3 + 2),
    positionAttr.getZ(faceIndex * 3 + 2)
  );

  return c.sub(b).cross(a.sub(b)).normalize();
}

function getVertexKey(positionAttr, vertexIndex) {
  return [
    positionAttr.getX(vertexIndex).toFixed(5),
    positionAttr.getY(vertexIndex).toFixed(5),
    positionAttr.getZ(vertexIndex).toFixed(5)
  ].join(",");
}

function serializePaintRegions() {
  if (!shellFaceOwners.length) return {};
  const regions = {};
  for (let faceIndex = 0; faceIndex < shellFaceOwners.length; faceIndex += 1) {
    const owner = shellFaceOwners[faceIndex];
    if (!owner) continue;
    if (!regions[owner]) regions[owner] = [];
    regions[owner].push(faceIndex);
  }
  return regions;
}

function applyPendingPaintRegions() {
  if (!shellGeometry || !pendingPaintRegions) return;
  shellFaceOwners.fill(null);
  for (const [controlId, faces] of Object.entries(pendingPaintRegions)) {
    if (!Array.isArray(faces)) continue;
    for (const faceIndex of faces) {
      if (Number.isInteger(faceIndex) && faceIndex >= 0 && faceIndex < shellFaceOwners.length) {
        shellFaceOwners[faceIndex] = controlId;
      }
    }
    updateControlFromPaintedRegion(controlId);
  }
  shellPreviewFaces.clear();
  recolorShellRegions();
  pendingPaintRegions = null;
}

function getControlById(controlId) {
  return controls.find((control) => control.id === controlId);
}
