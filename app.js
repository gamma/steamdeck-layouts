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
  deckToolsOpen: false,
  themeMode: "auto",
  bindingEditorOpen: false,
  bindingEditorAdvancedOpen: false,
  bindingEditorAxisSlot: "click",
  layoutPersistenceReady: false,
  communityDialogOpen: false,
  bindings: Object.fromEntries(controls.map((c) => [c.id, []]))
};

const MODEL_URL = "./assets/steamdeck_shell.stl";
const DEFAULT_LAYOUT_URL = "./saved-layouts/steamdeck-layout-2026-03-11.json";
const TARGET_MODEL_WIDTH = 4.35;
const FALLBACK_BODY_SIZE = [4.3, 1.8, 1.25];
const DEBUG_KEY_SEQUENCE = ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "A", "S", "D", "F", "G", "H", "J", "K", "L", "Z", "X", "C", "V", "B", "N", "M"];
const CRITICAL_CONTROL_IDS = ["left_stick", "right_stick", "a", "b", "x", "y", "left_trigger", "right_trigger", "left_bumper", "right_bumper", "menu", "view"];
const AXIS_CONTROL_MODES = [
  { value: "mouse_move", label: "Mouse Move" },
  { value: "digital_directions", label: "Digital Directions" },
  { value: "hybrid", label: "Hybrid" }
];
const AXIS_CONTROL_SLOTS = [
  { value: "click", label: "Click" },
  { value: "move", label: "Move" },
  { value: "up", label: "Up" },
  { value: "down", label: "Down" },
  { value: "left", label: "Left" },
  { value: "right", label: "Right" }
];
const ACTIVATOR_TYPES = [
  { value: "regular_press", label: "Full Press" },
  { value: "double_press", label: "Double Press" },
  { value: "long_press", label: "Long Press" },
  { value: "start_press", label: "Start Press" },
  { value: "release_press", label: "Release Press" },
  { value: "chorded_press", label: "Chorded Press" }
];
const MODIFIER_TOKENS = ["Ctrl", "Shift", "Alt", "Meta"];
const THEME_STORAGE_KEY = "steamdeck-layout-theme";
const DRAFT_STORAGE_KEY = "steamdeck-layout-draft";
const themeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

const el = {
  gameSearchInput: document.getElementById("gameSearchInput"),
  gameSearchBtn: document.getElementById("gameSearchBtn"),
  layoutSearchInput: document.getElementById("layoutSearchInput"),
  layoutSortSelect: document.getElementById("layoutSortSelect"),
  toggleOverlayBtn: document.getElementById("toggleOverlayBtn"),
  deckToolsMenu: document.getElementById("deckToolsMenu"),
  deckToolsToggleBtn: document.getElementById("deckToolsToggleBtn"),
  deckToolsPanel: document.getElementById("deckToolsPanel"),
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
  validationBadge: document.getElementById("validationBadge"),
  validationSummary: document.getElementById("validationSummary"),
  validationList: document.getElementById("validationList"),
  paintRegionBtn: document.getElementById("paintRegionBtn"),
  clearRegionBtn: document.getElementById("clearRegionBtn"),
  paintBrushSize: document.getElementById("paintBrushSize"),
  paintBrushSizeValue: document.getElementById("paintBrushSizeValue"),
  newLayoutBtn: document.getElementById("newLayoutBtn"),
  debugMapBtn: document.getElementById("debugMapBtn"),
  saveLayoutBtn: document.getElementById("saveLayoutBtn"),
  exportVdfBtn: document.getElementById("exportVdfBtn"),
  loadLayoutBtn: document.getElementById("loadLayoutBtn"),
  themeAutoBtn: document.getElementById("themeAutoBtn"),
  themeLightBtn: document.getElementById("themeLightBtn"),
  themeDarkBtn: document.getElementById("themeDarkBtn"),
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
  bindingEditorAxisPanel: document.getElementById("bindingEditorAxisPanel"),
  bindingEditorAxisMode: document.getElementById("bindingEditorAxisMode"),
  bindingEditorAxisSlot: document.getElementById("bindingEditorAxisSlot"),
  bindingEditorAxisMousePresetBtn: document.getElementById("bindingEditorAxisMousePresetBtn"),
  bindingEditorAxisWasdPresetBtn: document.getElementById("bindingEditorAxisWasdPresetBtn"),
  bindingEditorAxisArrowsPresetBtn: document.getElementById("bindingEditorAxisArrowsPresetBtn"),
  bindingEditorAxisSummary: document.getElementById("bindingEditorAxisSummary"),
  bindingEditorAxisSensitivity: document.getElementById("bindingEditorAxisSensitivity"),
  bindingEditorAxisDeadzone: document.getElementById("bindingEditorAxisDeadzone"),
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
let sceneRef = null;
let shellMaterialRef = null;
let fallbackMaterialRef = null;
let bezelMaterialRef = null;
let screenMaterialRef = null;
let screenArtworkMaterialRef = null;
let lightRefs = null;

initTheme();
initUI();
initScene();
initBindingEditor();
void bootstrapApp();

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
  el.deckToolsToggleBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    state.deckToolsOpen = !state.deckToolsOpen;
    syncDeckToolsVisibility();
  });
  el.deckToolsPanel.addEventListener("click", (event) => {
    event.stopPropagation();
  });
  document.addEventListener("click", (event) => {
    if (!state.deckToolsOpen) return;
    if (el.deckToolsMenu.contains(event.target)) return;
    state.deckToolsOpen = false;
    syncDeckToolsVisibility();
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
  el.exportVdfBtn.addEventListener("click", exportCurrentLayoutVdf);
  el.loadLayoutBtn.addEventListener("click", loadLayoutFromStorage);
  el.themeAutoBtn.addEventListener("click", () => setThemeMode("auto"));
  el.themeLightBtn.addEventListener("click", () => setThemeMode("light"));
  el.themeDarkBtn.addEventListener("click", () => setThemeMode("dark"));
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
  syncDeckToolsVisibility();
}

async function bootstrapApp() {
  const restored = restorePersistedLayoutState();
  if (!restored) {
    await loadDefaultLayout();
  }
  state.layoutPersistenceReady = true;
  schedulePersistCurrentLayoutState();
}

function initTheme() {
  const storedMode = readThemeMode();
  applyThemeMode(storedMode, false);

  const handleThemeChange = () => {
    if (state.themeMode === "auto") {
      applyThemeMode("auto", false);
    }
  };

  if (typeof themeMediaQuery.addEventListener === "function") {
    themeMediaQuery.addEventListener("change", handleThemeChange);
  } else if (typeof themeMediaQuery.addListener === "function") {
    themeMediaQuery.addListener(handleThemeChange);
  }
}

function readThemeMode() {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "light" || stored === "dark" || stored === "auto" ? stored : "auto";
  } catch {
    return "auto";
  }
}

function getResolvedTheme(mode) {
  if (mode === "light" || mode === "dark") return mode;
  return themeMediaQuery.matches ? "dark" : "light";
}

function syncThemeControls() {
  const buttons = [
    [el.themeAutoBtn, "auto"],
    [el.themeLightBtn, "light"],
    [el.themeDarkBtn, "dark"]
  ];
  for (const [button, mode] of buttons) {
    if (!button) continue;
    const active = state.themeMode === mode;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  }
}

function applyThemeMode(mode, persist = true) {
  state.themeMode = mode;
  if (persist) {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      // Ignore storage failures.
    }
  }
  const resolvedTheme = getResolvedTheme(mode);
  document.documentElement.dataset.theme = resolvedTheme;
  document.documentElement.dataset.themeMode = mode;
  syncThemeControls();
  updateDeckSceneTheme();
}

function setThemeMode(mode) {
  applyThemeMode(mode, true);
}

function readCssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function updateDeckSceneTheme() {
  if (!sceneRef) return;
  const bg = readCssVar("--deck-bg") || "#070c18";
  sceneRef.background = null;
  sceneRef.fog = new THREE.Fog(bg, 5.5, 11);
  updateDeckVisualTheme();
}

function isLightTheme() {
  return document.documentElement.dataset.theme === "light";
}

function updateDeckVisualTheme() {
  const lightTheme = isLightTheme();
  if (shellMaterialRef) {
    shellMaterialRef.color.set(lightTheme ? 0x7f8ba3 : 0x2f3747);
    shellMaterialRef.metalness = lightTheme ? 0.12 : 0.28;
    shellMaterialRef.roughness = lightTheme ? 0.56 : 0.76;
    shellMaterialRef.needsUpdate = true;
  }
  if (fallbackMaterialRef) {
    fallbackMaterialRef.color.set(lightTheme ? 0x8a93a8 : 0x202a3f);
    fallbackMaterialRef.metalness = lightTheme ? 0.12 : 0.25;
    fallbackMaterialRef.roughness = lightTheme ? 0.54 : 0.7;
    fallbackMaterialRef.needsUpdate = true;
  }
  if (bezelMaterialRef) {
    bezelMaterialRef.color.set(lightTheme ? 0xd3d9e5 : 0x111723);
    bezelMaterialRef.metalness = lightTheme ? 0.08 : 0.15;
    bezelMaterialRef.roughness = lightTheme ? 0.62 : 0.85;
    bezelMaterialRef.needsUpdate = true;
  }
  if (screenMaterialRef) {
    screenMaterialRef.color.set(lightTheme ? 0xffffff : 0xeaf3ff);
    screenMaterialRef.opacity = lightTheme ? 0.22 : 0.28;
    screenMaterialRef.roughness = lightTheme ? 0.08 : 0.12;
    screenMaterialRef.clearcoat = 1;
    screenMaterialRef.clearcoatRoughness = lightTheme ? 0.06 : 0.1;
    screenMaterialRef.reflectivity = lightTheme ? 0.62 : 0.52;
    screenMaterialRef.needsUpdate = true;
  }
  if (screenArtworkMaterialRef) {
    screenArtworkMaterialRef.color.set(lightTheme ? 0xf1f7ff : 0xffffff);
    screenArtworkMaterialRef.needsUpdate = true;
  }
  if (lightRefs) {
    const { ambient, key, fill, front, rim } = lightRefs;
    ambient.intensity = lightTheme ? 2.75 : 2.15;
    key.intensity = lightTheme ? 1.85 : 1.45;
    key.color.set(lightTheme ? 0xffffff : 0xffffff);
    fill.intensity = lightTheme ? 1.1 : 0.85;
    fill.color.set(lightTheme ? 0xe4eefc : 0xbfd6ff);
    front.intensity = lightTheme ? 0.95 : 0.75;
    rim.intensity = lightTheme ? 0.45 : 0.6;
    rim.color.set(lightTheme ? 0x8fb0e8 : 0x7aa2ff);
  }
  recolorShellRegions();
}

function syncDeckToolsVisibility() {
  el.deckToolsPanel.classList.toggle("hidden", !state.deckToolsOpen);
  el.deckToolsToggleBtn.classList.toggle("active", state.deckToolsOpen || state.paintMode);
  el.deckToolsToggleBtn.classList.toggle("warn", state.paintMode);
  el.deckToolsToggleBtn.setAttribute("aria-expanded", String(state.deckToolsOpen));
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
  schedulePersistCurrentLayoutState();
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

function restorePersistedLayoutState() {
  try {
    const stored = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!stored) return false;
    const payload = JSON.parse(stored);
    const layoutPayload = payload?.payload ?? payload;
    if (!layoutPayload || typeof layoutPayload !== "object") return false;
    if (typeof payload?.ui?.themeMode === "string") {
      applyThemeMode(payload.ui.themeMode, false);
    }
    applyLayoutData(layoutPayload, false);
    if (typeof payload?.ui?.selectedControlId === "string" && getControlById(payload.ui.selectedControlId)) {
      state.selectedControlId = payload.ui.selectedControlId;
      state.selectedActivatorIndex = clampNumber(payload.ui.selectedActivatorIndex, 0, 99, 0);
    }
    renderBindings();
    updateSelectionInfo();
    renderBindingOverlays();
    setLayoutStatus("Restored local draft from browser storage.", false);
    return true;
  } catch {
    return false;
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
    axisBinding: null,
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
  next.axisBinding = value.axisBinding ? sanitizeAxisBinding(value.axisBinding) : null;
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

function sanitizeAxisBinding(value) {
  const base = {
    mode: "mouse_move",
    click: "",
    move: "",
    up: "",
    down: "",
    left: "",
    right: "",
    sensitivity: 1,
    deadzone: 0.15
  };
  if (!value || typeof value !== "object") return base;
  return {
    mode: AXIS_CONTROL_MODES.some((entry) => entry.value === value.mode) ? value.mode : base.mode,
    click: typeof value.click === "string" ? value.click.trim() : "",
    move: typeof value.move === "string" ? value.move.trim() : "",
    up: typeof value.up === "string" ? value.up.trim() : "",
    down: typeof value.down === "string" ? value.down.trim() : "",
    left: typeof value.left === "string" ? value.left.trim() : "",
    right: typeof value.right === "string" ? value.right.trim() : "",
    sensitivity: clampNumber(value.sensitivity, 0.1, 3, base.sensitivity),
    deadzone: clampNumber(value.deadzone, 0, 1, base.deadzone)
  };
}

function normalizeActivatorActions(actions) {
  if (!Array.isArray(actions)) return [];
  return actions
    .map((step) => {
      if (!step || typeof step !== "object") return null;
      const output = typeof step.output === "string" ? step.output.trim() : "";
      if (!output) return null;
      const delayMs = Math.round(clampNumber(step.delayMs, 0, 2000, 0));
      const dsl = step.dsl && typeof step.dsl === "object" ? sanitizeBindingDsl(step.dsl) : null;
      return dsl ? { output, delayMs, dsl } : { output, delayMs };
    })
    .filter(Boolean);
}

function sanitizeBindingDsl(value) {
  const commandRaw = typeof value.commandRaw === "string" && value.commandRaw.trim() ? value.commandRaw.trim() : "";
  const command = typeof value.command === "string" && value.command.trim() ? value.command.trim().toLowerCase() : commandRaw.toLowerCase();
  const argsRaw = typeof value.argsRaw === "string" ? value.argsRaw.trim() : "";
  const label = typeof value.label === "string" ? value.label.trim() : "";
  const icon = typeof value.icon === "string" ? value.icon.trim() : "";
  const colors = typeof value.colors === "string" ? value.colors.trim() : "";
  const extra = Array.isArray(value.extra)
    ? value.extra.map((entry) => (typeof entry === "string" ? entry.trim() : "")).filter(Boolean)
    : [];
  const raw = typeof value.raw === "string" ? value.raw.trim() : "";
  const argTokens = Array.isArray(value.argTokens)
    ? value.argTokens.map((entry) => (typeof entry === "string" ? entry.trim() : "")).filter(Boolean)
    : (argsRaw ? argsRaw.split(/\s+/).filter(Boolean) : []);
  if (!command) return null;
  return {
    command,
    commandRaw: commandRaw || command,
    argsRaw,
    argTokens,
    label,
    icon,
    colors,
    extra,
    raw
  };
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

function getSelectedControl() {
  return state.selectedControlId ? getControlById(state.selectedControlId) : null;
}

function isAxisControl(controlId) {
  const control = getControlById(controlId);
  return control?.kind === "stick" || control?.kind === "pad";
}

function getAxisBindingForEditing(activator) {
  if (!activator) return null;
  if (!activator.axisBinding) activator.axisBinding = sanitizeAxisBinding(null);
  return activator.axisBinding;
}

function seedAxisBindingFromLegacyActions(active) {
  const axisBinding = getAxisBindingForEditing(active);
  if (!axisBinding) return null;
  if (activatorHasConfiguredAxisBinding(active)) return axisBinding;
  const legacy = active.actions.find((step) => typeof step?.output === "string" && step.output.trim())?.output ?? active.binding;
  if (!legacy) return axisBinding;
  if (/mouse move/i.test(legacy)) axisBinding.move = legacy;
  else if (/^(left mouse|right mouse|middle mouse)$/i.test(legacy)) axisBinding.click = legacy;
  else if (/^(w|a|s|d|up|down|left|right)$/i.test(legacy)) {
    axisBinding.mode = "digital_directions";
    axisBinding.up = legacy;
  } else {
    axisBinding.click = legacy;
  }
  return axisBinding;
}

function getAxisSlotValue(axisBinding, slot) {
  if (!axisBinding) return "";
  return typeof axisBinding[slot] === "string" ? axisBinding[slot].trim() : "";
}

function setAxisSlotValue(axisBinding, slot, value) {
  if (!axisBinding || !slot) return;
  axisBinding[slot] = typeof value === "string" ? value.trim() : "";
}

function formatAxisBindingSummary(axisBinding) {
  if (!axisBinding) return "Unmapped";
  const parts = [AXIS_CONTROL_MODES.find((entry) => entry.value === axisBinding.mode)?.label ?? "Mouse Move"];
  const click = getAxisSlotValue(axisBinding, "click");
  const move = getAxisSlotValue(axisBinding, "move");
  const directions = ["up", "down", "left", "right"]
    .map((slot) => getAxisSlotValue(axisBinding, slot))
    .filter(Boolean);
  if (!click && !move && !directions.length) return "Unmapped";
  if (click) parts.push(`Click: ${click}`);
  if (move) parts.push(`Move: ${move}`);
  if (directions.length) parts.push(`Dirs: ${directions.join("/")}`);
  parts.push(`Deadzone ${axisBinding.deadzone.toFixed(2)}`);
  return parts.join(" • ");
}

function summarizeAxisBindingForActivator(axisBinding) {
  return formatAxisBindingSummary(axisBinding);
}

function renderAxisBindingSummary(axisBinding = null) {
  if (!el.bindingEditorAxisSummary) return;
  el.bindingEditorAxisSummary.innerHTML = "";
  const binding = axisBinding ?? (state.bindingEditorOpen && state.selectedControlId
    ? getAxisBindingForEditing(getControlActivatorsForEditing(state.selectedControlId)[state.selectedActivatorIndex])
    : null);
  if (!binding) {
    const empty = document.createElement("span");
    empty.className = "axis-summary-chip empty";
    empty.textContent = "No axis binding";
    el.bindingEditorAxisSummary.appendChild(empty);
    return;
  }
  const chips = [];
  chips.push(binding.mode === "mouse_move" ? "Mouse Move enabled" : binding.mode === "digital_directions" ? "Digital directions enabled" : "Hybrid enabled");
  const slots = [
    ["click", "Click"],
    ["move", "Move"],
    ["up", "Up"],
    ["down", "Down"],
    ["left", "Left"],
    ["right", "Right"]
  ];
  slots.forEach(([slot, label]) => {
    const value = getAxisSlotValue(binding, slot);
    chips.push(value ? `${label}: ${value}` : `${label}: off`);
  });
  chips.forEach((text) => {
    const chip = document.createElement("span");
    chip.className = "axis-summary-chip";
    chip.textContent = text;
    el.bindingEditorAxisSummary.appendChild(chip);
  });
}

function syncAxisPresetButtons(axisBinding = null) {
  const binding = axisBinding ?? null;
  const mode = binding?.mode ?? el.bindingEditorAxisMode.value;
  el.bindingEditorAxisMousePresetBtn.classList.toggle("active", mode === "mouse_move");
  el.bindingEditorAxisWasdPresetBtn.classList.toggle("active", mode === "digital_directions" && [
    getAxisSlotValue(binding, "up"),
    getAxisSlotValue(binding, "down"),
    getAxisSlotValue(binding, "left"),
    getAxisSlotValue(binding, "right")
  ].every((value) => value === "W" || value === "A" || value === "S" || value === "D"));
  el.bindingEditorAxisArrowsPresetBtn.classList.toggle("active", mode === "digital_directions" && [
    getAxisSlotValue(binding, "up"),
    getAxisSlotValue(binding, "down"),
    getAxisSlotValue(binding, "left"),
    getAxisSlotValue(binding, "right")
  ].every((value) => value === "Up" || value === "Down" || value === "Left" || value === "Right"));
}

function getBindingSummaryEntries(controlId) {
  const control = getControlById(controlId);
  if (control?.kind === "stick" || control?.kind === "pad") {
    const axisEntries = getControlActivators(controlId)
      .filter((activator) => activatorHasConfiguredAxisBinding(activator))
      .map((activator) => formatAxisBindingSummary(activator.axisBinding));
    if (axisEntries.length) return axisEntries;
  }
  return getControlActivators(controlId)
    .filter((activator) => activator.actions.length || activator.binding || activator.chord)
    .map((activator) => formatActivatorSummary(activator));
}

function formatActivatorSummary(activator) {
  const typeLabel = ACTIVATOR_TYPES.find((item) => item.value === activator.type)?.label ?? "Full Press";
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

    tr.dataset.controlId = control.id;
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
  renderValidationSummary();
  scheduleScrollSelectedBindingRow();
  schedulePersistCurrentLayoutState();
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
  scheduleScrollSelectedBindingRow();
  if (state.bindingEditorOpen) renderBindingEditor();
}

function scheduleScrollSelectedBindingRow() {
  if (!state.selectedControlId) return;
  if (scheduleScrollSelectedBindingRow.rafId) {
    cancelAnimationFrame(scheduleScrollSelectedBindingRow.rafId);
  }
  scheduleScrollSelectedBindingRow.rafId = requestAnimationFrame(() => {
    scheduleScrollSelectedBindingRow.rafId = 0;
    const row = el.bindingsTable.querySelector(`tr[data-control-id="${CSS.escape(state.selectedControlId)}"]`);
    row?.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
  });
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
  el.bindingEditorAxisSlot.addEventListener("change", () => {
    state.bindingEditorAxisSlot = el.bindingEditorAxisSlot.value;
    syncAxisBindingEditor();
  });
  el.bindingEditorAxisMode.addEventListener("change", () => {
    updateAxisBindingFromEditor();
  });
  el.bindingEditorAxisSensitivity.addEventListener("input", () => {
    updateAxisBindingFromEditor();
  });
  el.bindingEditorAxisDeadzone.addEventListener("input", () => {
    updateAxisBindingFromEditor();
  });
  el.bindingEditorAxisMousePresetBtn.addEventListener("click", () => applyAxisPreset("mouse_move"));
  el.bindingEditorAxisWasdPresetBtn.addEventListener("click", () => applyAxisPreset("wasd"));
  el.bindingEditorAxisArrowsPresetBtn.addEventListener("click", () => applyAxisPreset("arrows"));
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
  if (isAxisControl(state.selectedControlId)) {
    syncCurrentInputFromEditor();
    el.bindingEditorStepInput.focus();
    return;
  }
  const composed = composeCurrentInput(token);
  if (!active.actions.length) {
    active.actions = [{ output: composed, delayMs: 0 }];
    state.draftStepIndex = 0;
  } else if (state.draftStepIndex == null || state.draftStepIndex < 0 || state.draftStepIndex >= active.actions.length) {
    active.actions.push({ output: "", delayMs: 0, dsl: null });
    state.draftStepIndex = active.actions.length - 1;
  }
  active.actions[state.draftStepIndex].output = composed;
  active.actions[state.draftStepIndex].dsl = null;
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
  const axisVisible = !el.bindingEditorAxisPanel.classList.contains("hidden");
  if (axisVisible) {
    requestAnimationFrame(() => el.bindingEditorStepInput.focus());
  } else {
    focusKeyInputIfVisible();
  }
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
  const control = getSelectedControl();
  const kindLabel = control?.kind === "stick" ? "Stick" : control?.kind === "pad" ? "Touchpad" : "Button";
  el.bindingEditorTitle.textContent = `Edit ${control?.name ?? kindLabel}`;
  state.bindingEditorOpen = true;
  state.bindingEditorAdvancedOpen = false;
  state.bindingEditorAxisSlot = "click";
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
  const control = getSelectedControl();
  const activators = getControlActivators(state.selectedControlId);
  if (!activators.length) {
    activators.push(createDefaultActivator("", 0));
  }
  state.selectedActivatorIndex = clamp(Math.floor(state.selectedActivatorIndex), 0, activators.length - 1);
  el.bindingEditorActivatorList.innerHTML = "";
  activators.forEach((activator, index) => {
    const item = document.createElement("li");
    item.className = `editor-list-item${index === state.selectedActivatorIndex ? " active" : ""}`;
    const title = ACTIVATOR_TYPES.find((entry) => entry.value === activator.type)?.label ?? "Full Press";
    const binding = activator.actions.length ? activator.actions.map((step) => step?.output || "Unmapped").join(" ⟶ ") : (activator.binding || "Unmapped");
    item.innerHTML = `<strong>${escapeHtml(title)}</strong><span>${escapeHtml(binding)}</span>`;
    item.addEventListener("click", () => {
      state.selectedActivatorIndex = index;
      renderBindingEditor();
    });
    el.bindingEditorActivatorList.appendChild(item);
  });

  const active = activators[state.selectedActivatorIndex];
  const axisControl = control?.kind === "stick" || control?.kind === "pad";
  const axisBinding = axisControl ? seedAxisBindingFromLegacyActions(active) : null;
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
  el.bindingEditorAxisPanel.classList.toggle("hidden", !axisControl);
  el.bindingEditorStepList.classList.toggle("hidden", axisControl);
  el.bindingEditorStepAdd.classList.toggle("hidden", axisControl || active.actions.length === 0);
  el.bindingEditorStepInput.placeholder = axisControl ? "Type binding for selected slot…" : "Press a key…";
  el.bindingEditorAxisMode.value = axisBinding?.mode ?? "mouse_move";
  el.bindingEditorAxisSensitivity.value = String(axisBinding?.sensitivity ?? 1);
  el.bindingEditorAxisDeadzone.value = String(axisBinding?.deadzone ?? 0.15);
  el.bindingEditorAxisSlot.value = state.bindingEditorAxisSlot;
  if (axisControl) {
    syncAxisBindingEditor();
    syncCurrentInputFromEditor();
  } else if (active.actions.length === 0) {
    populateInputFromOutput("");
    syncCurrentInputFromEditor();
  } else {
    el.bindingEditorStepInput.value = "";
    state.activeStepModifiers = [];
    syncModifierButtons();
  }
  renderActionStepList(axisControl ? [] : active.actions);
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
  active.actions.push({ output: "", delayMs: 0, dsl: null });
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
  step.dsl = null;
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

function populateInputFromAxisSlot(axisBinding, slot) {
  const value = getAxisSlotValue(axisBinding, slot);
  populateInputFromOutput(value);
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
  if (isAxisControl(state.selectedControlId)) {
    const axisBinding = getAxisBindingForEditing(active);
    if (!axisBinding) return;
    setAxisSlotValue(axisBinding, state.bindingEditorAxisSlot, composed);
    active.binding = summarizeAxisBindingForActivator(axisBinding);
    renderAxisBindingSummary();
    renderBindings();
    updateSelectionInfo();
    renderBindingOverlays();
    return;
  }
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
  active.actions[state.draftStepIndex].dsl = null;
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

function syncAxisBindingEditor() {
  if (!state.bindingEditorOpen || !state.selectedControlId) return;
  const activators = getControlActivatorsForEditing(state.selectedControlId);
  const active = activators[state.selectedActivatorIndex];
  if (!active) return;
  const axisBinding = getAxisBindingForEditing(active);
  if (!axisBinding) return;
  const slot = state.bindingEditorAxisSlot || "click";
  populateInputFromAxisSlot(axisBinding, slot);
  el.bindingEditorAxisMode.value = axisBinding.mode;
  el.bindingEditorAxisSensitivity.value = String(axisBinding.sensitivity);
  el.bindingEditorAxisDeadzone.value = String(axisBinding.deadzone);
  syncAxisPresetButtons(axisBinding);
  renderAxisBindingSummary(axisBinding);
}

function updateAxisBindingFromEditor() {
  if (!state.bindingEditorOpen || !state.selectedControlId) return;
  const activators = getControlActivatorsForEditing(state.selectedControlId);
  const active = activators[state.selectedActivatorIndex];
  if (!active) return;
  const axisBinding = getAxisBindingForEditing(active);
  if (!axisBinding) return;
  axisBinding.mode = el.bindingEditorAxisMode.value;
  axisBinding.sensitivity = clampNumber(el.bindingEditorAxisSensitivity.value, 0.1, 3, axisBinding.sensitivity);
  axisBinding.deadzone = clampNumber(el.bindingEditorAxisDeadzone.value, 0, 1, axisBinding.deadzone);
  active.binding = summarizeAxisBindingForActivator(axisBinding);
  syncAxisPresetButtons(axisBinding);
  renderAxisBindingSummary(axisBinding);
  renderBindings();
  updateSelectionInfo();
  renderBindingOverlays();
}

function applyAxisPreset(preset) {
  if (!state.bindingEditorOpen || !state.selectedControlId) return;
  const activators = getControlActivatorsForEditing(state.selectedControlId);
  const active = activators[state.selectedActivatorIndex];
  if (!active) return;
  const axisBinding = getAxisBindingForEditing(active);
  if (!axisBinding) return;
  if (preset === "mouse_move") {
    axisBinding.mode = "mouse_move";
    axisBinding.move = "Mouse Move";
    if (!axisBinding.click) axisBinding.click = "Left Mouse";
  } else if (preset === "wasd") {
    axisBinding.mode = "digital_directions";
    axisBinding.up = "W";
    axisBinding.down = "S";
    axisBinding.left = "A";
    axisBinding.right = "D";
  } else if (preset === "arrows") {
    axisBinding.mode = "digital_directions";
    axisBinding.up = "Up";
    axisBinding.down = "Down";
    axisBinding.left = "Left";
    axisBinding.right = "Right";
  }
  active.binding = summarizeAxisBindingForActivator(axisBinding);
  syncAxisBindingEditor();
  syncAxisPresetButtons(axisBinding);
  renderAxisBindingSummary(axisBinding);
  renderBindings();
  updateSelectionInfo();
  renderBindingOverlays();
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
  if (isAxisControl(state.selectedControlId)) {
    const axisBinding = getAxisBindingForEditing(active);
    if (!axisBinding) return;
    axisBinding.mode = el.bindingEditorAxisMode.value;
    axisBinding.sensitivity = clampNumber(el.bindingEditorAxisSensitivity.value, 0.1, 3, axisBinding.sensitivity);
    axisBinding.deadzone = clampNumber(el.bindingEditorAxisDeadzone.value, 0, 1, axisBinding.deadzone);
    active.binding = summarizeAxisBindingForActivator(axisBinding);
    syncAxisPresetButtons(axisBinding);
    renderAxisBindingSummary(axisBinding);
    renderBindings();
    updateSelectionInfo();
    renderBindingOverlays();
    return;
  }
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
    const downloadButton = fragment.querySelector(".layout-download-btn");
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
    downloadButton.disabled = !layout.file_url;
    downloadButton.addEventListener("click", (event) => {
      event.stopPropagation();
      void downloadCommunityLayout(layout);
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
    const mappedControlCount = Object.values(bindings).filter((entries) => Array.isArray(entries) && entries.length > 0).length;
    const mappingSummary = mappedControlCount
      ? `${mappedControlCount}/${controls.length} controls mapped.`
      : "No recognizable control mappings found in this file.";

    state.loadedLayoutMeta = target;
    state.bindings = Object.fromEntries(controls.map((control) => [control.id, bindings[control.id] ?? []]));
    renderCommunityLayouts();
    renderBindings();
    updateSelectionInfo();
    renderBindingOverlays();
    state.selectedLayoutDetail = target;
    renderLayoutDetail();
    setLayoutStatus(`Loaded ${target.title}. ${summarizeLoadedLayout(target)}${mappingSummary ? ` • ${mappingSummary}` : ""}`, mappedControlCount === 0);
    updateCommunitySummary();
    hideCommunityDialog();
  } catch {
    setLayoutStatus(`Failed to parse ${target?.title ?? "selected layout"}.`, true);
  }
}

async function downloadCommunityLayout(layoutMeta) {
  const target = layoutMeta ?? state.selectedLayoutDetail;
  if (!target?.file_url) {
    setLayoutStatus("That layout does not expose a downloadable VDF.", true);
    return;
  }

  setLayoutStatus(`Downloading ${target.title || `Layout ${target.file_id}`}...`);
  try {
    const response = await fetch(`/api/layout-file?url=${encodeURIComponent(target.file_url)}`);
    if (!response.ok) throw new Error("Layout fetch failed");
    const payload = await response.json();
    const filename = getCommunityLayoutFileName(target);
    const blob = new Blob([payload.vdf ?? ""], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
    setLayoutStatus(`Downloaded ${filename}.`, false);
  } catch {
    setLayoutStatus(`Failed to download ${target?.title ?? "selected layout"}.`, true);
  }
}

function getCommunityLayoutFileName(layoutMeta) {
  const appSegment = state.selectedGame?.id ? `app${state.selectedGame.id}` : "app";
  const fallback = layoutMeta?.file_id != null ? `layout-${layoutMeta.file_id}` : "layout";
  const title = layoutMeta?.title || layoutMeta?.file_name || fallback;
  const titleSegment = sanitizeFilenameSegment(title) || fallback;
  return `steamdeck-${appSegment}-${titleSegment}.vdf`;
}

function sanitizeFilenameSegment(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
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

function renderValidationSummary() {
  const report = getValidationReport();
  const mappedCount = controls.filter((control) => controlHasConfiguredBinding(control.id)).length;

  el.validationBadge.textContent = report.warnings.length ? `${report.warnings.length} warning${report.warnings.length === 1 ? "" : "s"}` : "Ready";
  el.validationBadge.classList.toggle("ok", report.warnings.length === 0);
  el.validationBadge.classList.toggle("warn", report.warnings.length > 0);
  el.validationSummary.textContent = `${mappedCount}/${controls.length} controls mapped • ${report.criticalMappedCount}/${CRITICAL_CONTROL_IDS.length} critical controls covered`;

  el.validationList.innerHTML = "";
  if (!report.warnings.length) {
    const item = document.createElement("li");
    item.className = "validation-empty";
    item.textContent = "No blocking warnings detected. Local export is ready.";
    el.validationList.appendChild(item);
    return;
  }

  report.warnings.forEach((warning) => {
    const item = document.createElement("li");
    item.className = "validation-item";

    const main = document.createElement("div");
    main.className = "validation-item-main";

    const copy = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = warning.title;
    copy.appendChild(title);

    if (warning.detail) {
      const detail = document.createElement("p");
      detail.textContent = warning.detail;
      copy.appendChild(detail);
    }
    main.appendChild(copy);

    if (warning.controlId) {
      const reviewBtn = document.createElement("button");
      reviewBtn.type = "button";
      reviewBtn.textContent = "Review";
      reviewBtn.addEventListener("click", () => {
        selectControl(warning.controlId);
        renderBindings();
        showBindingEditor();
      });
      main.appendChild(reviewBtn);
    }

    item.appendChild(main);
    el.validationList.appendChild(item);
  });
}

function getValidationReport() {
  const warnings = [];

  const missingCriticalControls = CRITICAL_CONTROL_IDS.filter((controlId) => !controlHasConfiguredBinding(controlId));
  missingCriticalControls.forEach((controlId) => {
    const control = getControlById(controlId);
    warnings.push({
      controlId,
      title: `${control?.name ?? controlId} is unmapped`,
      detail: "Critical controls should have at least one action before export."
    });
  });

  findDuplicateCriticalBindings().forEach((entry) => {
    const names = entry.controlIds
      .map((controlId) => getControlById(controlId)?.name ?? controlId)
      .join(", ");
    warnings.push({
      controlId: entry.controlIds[0] ?? null,
      title: `Duplicate critical binding: ${entry.binding}`,
      detail: `Shared by ${names}. Confirm this overlap is intentional.`
    });
  });

  controls.forEach((control) => {
    const activators = getControlActivators(control.id);
    activators.forEach((activator, index) => {
      if (activatorHasPartialConfigWithoutAction(activator, activators.length)) {
        warnings.push({
          controlId: control.id,
          title: `${control.name} has an empty activator`,
          detail: `Activator ${index + 1} contains options but no action output.`
        });
      }
    });
  });

  return {
    warnings,
    criticalMappedCount: CRITICAL_CONTROL_IDS.filter((controlId) => controlHasConfiguredBinding(controlId)).length
  };
}

function controlHasConfiguredBinding(controlId) {
  const control = getControlById(controlId);
  if (control?.kind === "stick" || control?.kind === "pad") {
    return getControlActivators(controlId).some((activator) => activatorHasConfiguredAxisBinding(activator) || activatorHasConfiguredAction(activator));
  }
  return getControlActivators(controlId).some((activator) => activatorHasConfiguredAction(activator));
}

function activatorHasConfiguredAction(activator) {
  if (!activator || typeof activator !== "object") return false;
  if (activator.actions?.some((step) => typeof step?.output === "string" && step.output.trim())) return true;
  return Boolean(typeof activator.binding === "string" && activator.binding.trim());
}

function activatorHasConfiguredAxisBinding(activator) {
  if (!activator || typeof activator !== "object") return false;
  const axisBinding = activator.axisBinding;
  if (!axisBinding || typeof axisBinding !== "object") return false;
  return ["click", "move", "up", "down", "left", "right"].some((slot) => getAxisSlotValue(axisBinding, slot));
}

function activatorHasPartialConfigWithoutAction(activator, activatorCount = 1) {
  if (!activator || activatorHasConfiguredAction(activator)) return false;
  if (activatorCount > 1) return true;
  return Boolean(
    activator.chord ||
    activator.toggle ||
    activator.turbo ||
    activator.cycleBinding ||
    activator.notes ||
    activator.haptics !== "off" ||
    activator.type !== "regular_press" ||
    activator.doubleTapTime !== 0.2 ||
    activator.longPressTime !== 0.35 ||
    activator.fireStartDelay !== 0 ||
    activator.fireEndDelay !== 0 ||
    activator.repeatRate !== 0.15 ||
    activator.interruptable !== true
  );
}

function findDuplicateCriticalBindings() {
  const bindingsByKey = new Map();
  CRITICAL_CONTROL_IDS.forEach((controlId) => {
    const primaryBinding = getPrimaryBindingSignature(controlId);
    if (!primaryBinding) return;
    const current = bindingsByKey.get(primaryBinding.key) ?? { binding: primaryBinding.label, controlIds: [] };
    current.controlIds.push(controlId);
    bindingsByKey.set(primaryBinding.key, current);
  });
  return Array.from(bindingsByKey.values()).filter((entry) => entry.controlIds.length > 1);
}

function getPrimaryBindingSignature(controlId) {
  const control = getControlById(controlId);
  const activators = getControlActivators(controlId);
  for (const activator of activators) {
    const raw = (control?.kind === "stick" || control?.kind === "pad")
      ? (activatorHasConfiguredAxisBinding(activator)
        ? summarizeAxisBindingForActivator(activator.axisBinding)
        : activator.actions?.find((step) => typeof step?.output === "string" && step.output.trim())?.output ?? activator.binding)
      : activator.actions?.find((step) => typeof step?.output === "string" && step.output.trim())?.output ?? activator.binding;
    if (!raw || typeof raw !== "string" || !raw.trim()) continue;
    const label = raw.trim();
    return {
      key: label.toLowerCase(),
      label
    };
  }
  return null;
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
    vdfBindings: buildVdfBindingsPayload(),
    loadedLayoutMeta: state.loadedLayoutMeta,
    controlPositions: Object.fromEntries(controls.map((control) => [control.id, control.pos])),
    controlRotations: Object.fromEntries(controls.map((control) => [control.id, control.rotation])),
    controlScales: Object.fromEntries(controls.map((control) => [control.id, control.scale])),
    paintRegions: serializePaintRegions()
  };
}

function schedulePersistCurrentLayoutState() {
  if (!state.layoutPersistenceReady) return;
  if (schedulePersistCurrentLayoutState.timer) {
    clearTimeout(schedulePersistCurrentLayoutState.timer);
  }
  schedulePersistCurrentLayoutState.timer = setTimeout(() => {
    schedulePersistCurrentLayoutState.timer = null;
    persistCurrentLayoutState();
  }, 250);
}

function persistCurrentLayoutState() {
  if (!state.layoutPersistenceReady) return;
  try {
    const payload = {
      version: 1,
      savedAt: new Date().toISOString(),
      payload: buildLayoutPayload(),
      ui: {
        selectedControlId: state.selectedControlId,
        selectedActivatorIndex: state.selectedActivatorIndex,
        themeMode: state.themeMode
      }
    };
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore browser storage failures.
  }
}

async function saveLayoutToStorage() {
  const payload = buildLayoutPayload();
  persistCurrentLayoutState();
  const text = JSON.stringify(payload, null, 2);
  const validation = getValidationReport();
  const savedMessageSuffix = validation.warnings.length
    ? ` ${validation.warnings.length} validation warning${validation.warnings.length === 1 ? "" : "s"} remain.`
    : " Export readiness looks good.";
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
      setLayoutStatus(`Layout saved via File System Access.${savedMessageSuffix}`, false);
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
    setLayoutStatus(`Layout downloaded locally.${savedMessageSuffix}`, false);
  }
}

function buildVdfExportText() {
  const layout = buildVdfLayoutObject();
  return serializeVdfTree(layout);
}

function buildVdfLayoutObject() {
  return {
    controller_mappings: {
      version: "1",
      preset: {
        group_source_bindings: Object.fromEntries(
          controls
            .map((control) => {
              const descriptor = getVdfSourceDescriptorForControl(control);
              return descriptor ? [control.id, `${descriptor.source} active`] : null;
            })
            .filter(Boolean)
        )
      },
      group: controls.map((control) => buildVdfGroupForControl(control))
    }
  };
}

function buildVdfGroupForControl(control) {
  const descriptor = getVdfSourceDescriptorForControl(control);
  const activators = getControlActivators(control.id);
  if (!descriptor) {
    return {
      id: control.id,
      inputs: {}
    };
  }

  const inputName = descriptor.inputName;
  const inputNode = buildVdfInputNodeSet(activators);
  const inputs = inputName ? { [inputName]: inputNode } : {};

  const group = {
    id: control.id,
    source: descriptor.source,
    inputs
  };
  const firstAxisBinding = activators.find((activator) => activator.axisBinding)?.axisBinding;
  if (firstAxisBinding) group.axisBinding = { ...firstAxisBinding };
  return group;
}

function buildVdfInputNodeSet(activators) {
  const node = { activators: {} };
  activators.forEach((activator, index) => {
    const bindingStrings = activator.actions
      .map((step) => {
        const dsl = step.dsl && typeof step.dsl === "object" ? step.dsl : modelOutputToBindingDsl(step.output);
        return serializeBindingDsl(dsl);
      })
      .filter(Boolean);
    if (!bindingStrings.length && activator.axisBinding) {
      bindingStrings.push(...axisBindingToBindingStrings(activator.axisBinding));
    }
    node.activators[`${mapInternalTypeToVdfActivatorKey(activator.type)}_${index}`] = {
      bindings: {
        binding: bindingStrings
      }
    };
    if (activator.axisBinding) {
      node.activators[`${mapInternalTypeToVdfActivatorKey(activator.type)}_${index}`].axisBinding = { ...activator.axisBinding };
    }
  });
  return node;
}

function axisBindingToBindingStrings(axisBinding) {
  if (!axisBinding || typeof axisBinding !== "object") return [];
  const values = [];
  const slotMap = [
    ["click", axisBinding.click],
    ["move", axisBinding.move],
    ["up", axisBinding.up],
    ["down", axisBinding.down],
    ["left", axisBinding.left],
    ["right", axisBinding.right]
  ];
  for (const [slot, output] of slotMap) {
    if (!output) continue;
    if (slot === "move") {
      values.push(serializeBindingDsl(modelOutputToBindingDsl(output === "Mouse Move" ? output : "Mouse Move")));
    } else {
      values.push(serializeBindingDsl(modelOutputToBindingDsl(output)));
    }
  }
  return values;
}

function getVdfSourceDescriptorForControl(control) {
  switch (control.kind) {
    case "face": {
      const map = { a: "button_a", b: "button_b", x: "button_x", y: "button_y" };
      const inputName = map[control.id];
      return inputName ? { source: "button_diamond", inputName } : null;
    }
    case "dpad": {
      const map = {
        dpad_up: "dpad_north",
        dpad_down: "dpad_south",
        dpad_left: "dpad_west",
        dpad_right: "dpad_east"
      };
      const inputName = map[control.id];
      return inputName ? { source: "dpad", inputName } : null;
    }
    case "stick": {
      const source = control.id === "right_stick" ? "right_joystick" : "joystick";
      return { source, inputName: "click" };
    }
    case "pad": {
      const source = control.id === "left_pad" ? "left_trackpad" : "right_trackpad";
      return { source, inputName: "click" };
    }
    case "trigger":
      return { source: control.id === "left_trigger" ? "left_trigger" : "right_trigger", inputName: "edge" };
    case "bumper": {
      const map = { left_bumper: "left_bumper", right_bumper: "right_bumper" };
      const inputName = map[control.id];
      return inputName ? { source: "switch", inputName } : null;
    }
    case "utility": {
      const map = {
        view: "button_escape",
        menu: "button_menu",
        steam: "button_steam",
        quick_access: "button_capture"
      };
      const inputName = map[control.id];
      return inputName ? { source: "switch", inputName } : null;
    }
    case "rear": {
      const map = {
        left_grip_4: "button_back_left_upper",
        left_grip_5: "button_back_left_lower",
        right_grip_4: "button_back_right_upper",
        right_grip_5: "button_back_right_lower"
      };
      const inputName = map[control.id];
      return inputName ? { source: "switch", inputName } : null;
    }
    default:
      return null;
  }
}

function serializeVdfTree(value) {
  return serializeVdfNode(value, 0);
}

function serializeVdfNode(value, depth, key = null) {
  const indent = "  ".repeat(depth);
  if (Array.isArray(value)) {
    return value.map((item) => serializeVdfNode(item, depth, key)).filter(Boolean).join("\n");
  }
  if (value && typeof value === "object") {
    if (key == null) {
      return Object.entries(value)
        .map(([childKey, childValue]) => serializeVdfNode(childValue, depth, childKey))
        .filter(Boolean)
        .join("\n");
    }
    const entries = Object.entries(value)
      .map(([childKey, childValue]) => serializeVdfNode(childValue, depth + 1, childKey))
      .filter(Boolean)
      .join("\n");
    return `${indent}"${escapeVdfString(key)}"\n${indent}{\n${entries}\n${indent}}`;
  }
  if (key == null) return "";
  return `${indent}"${escapeVdfString(key)}" "${escapeVdfString(value == null ? "" : String(value))}"`;
}

function escapeVdfString(value) {
  return String(value).replaceAll("\\", "\\\\").replaceAll("\"", "\\\"");
}

function exportCurrentLayoutVdf() {
  const text = buildVdfExportText();
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "steamdeck-layout.vdf";
  a.click();
  URL.revokeObjectURL(a.href);
  setLayoutStatus("Exported current layout as VDF.", false);
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
  sceneRef = scene;

  const camera = new THREE.PerspectiveCamera(50, el.deckContainer.clientWidth / el.deckContainer.clientHeight, 0.1, 100);
  camera.position.set(0, 1.2, 5.4);
  sceneCamera = camera;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(el.deckContainer.clientWidth, el.deckContainer.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  el.deckContainer.appendChild(renderer.domElement);
  updateDeckSceneTheme();

  orbitControls = new OrbitControls(camera, renderer.domElement);
  orbitControls.enableDamping = true;
  orbitControls.target.set(0, 0.15, 0);

  const ambientLight = new THREE.AmbientLight(0xffffff, 2.15);
  scene.add(ambientLight);
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
  lightRefs = { ambient: ambientLight, key: keyLight, fill: fillLight, front: frontLight, rim: rimLight };

  const deckRoot = new THREE.Group();
  scene.add(deckRoot);
  loadDeckModel(deckRoot);
  addDecorativeElements(scene);
  updateDeckVisualTheme();

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
    if (isPainting) {
      isPainting = false;
      orbitControls.enabled = !state.paintMode;
    }
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
        color: 0xffffff,
        vertexColors: true,
        metalness: isLightTheme() ? 0.12 : 0.28,
        roughness: isLightTheme() ? 0.56 : 0.76
      });
      shellMaterialRef = material;
      const colors = new Float32Array(geometry.attributes.position.count * 3);
      for (let i = 0; i < geometry.attributes.position.count; i += 1) {
        const base = isLightTheme() ? [0x7f, 0x8b, 0xa3] : [0x2f, 0x37, 0x47];
        colors[i * 3] = base[0] / 255;
        colors[i * 3 + 1] = base[1] / 255;
        colors[i * 3 + 2] = base[2] / 255;
      }
      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      shellGeometry = geometry;
      initializeShellPaintData(geometry);

      const mesh = new THREE.Mesh(geometry, material);
      shellMesh = mesh;
      deckRoot.add(mesh);
      updateDeckVisualTheme();
      applyPendingPaintRegions();
      setDeckStatus("Steam Deck shell model loaded.");
    },
    undefined,
    () => {
      deckRoot.add(createFallbackDeckBody());
      updateDeckVisualTheme();
      setDeckStatus("Steam Deck shell model failed to load. Showing fallback body.", true);
    }
  );
}

function createFallbackDeckBody() {
  const material = new THREE.MeshStandardMaterial({
    color: isLightTheme() ? 0x8a93a8 : 0x202a3f,
    metalness: isLightTheme() ? 0.12 : 0.25,
    roughness: isLightTheme() ? 0.54 : 0.7
  });
  fallbackMaterialRef = material;
  return new THREE.Mesh(
    new THREE.BoxGeometry(...FALLBACK_BODY_SIZE),
    material
  );
}

function addDecorativeElements(scene) {
  bezelMaterialRef = new THREE.MeshStandardMaterial({
    color: isLightTheme() ? 0xd3d9e5 : 0x111723,
    metalness: isLightTheme() ? 0.08 : 0.15,
    roughness: isLightTheme() ? 0.62 : 0.85
  });
  const bezel = new THREE.Mesh(
    new THREE.BoxGeometry(2.28, 1.42, 0.08),
    bezelMaterialRef
  );
  bezel.position.set(0, 0.34, 0.145);
  scene.add(bezel);

  const screenGroup = new THREE.Group();
  screenGroup.position.set(0, 0.34, 0.185);
  scene.add(screenGroup);

  const textureLoader = new THREE.TextureLoader();
  const artworkTexture = textureLoader.load("./assets/app-background.png", () => {
    updateDeckVisualTheme();
  });
  artworkTexture.colorSpace = THREE.SRGBColorSpace;
  artworkTexture.anisotropy = 8;

  screenArtworkMaterialRef = new THREE.MeshBasicMaterial({
    map: artworkTexture,
    color: 0xffffff
  });
  const artwork = new THREE.Mesh(new THREE.PlaneGeometry(2.08, 1.22), screenArtworkMaterialRef);
  artwork.position.z = -0.003;
  screenGroup.add(artwork);

  screenMaterialRef = new THREE.MeshPhysicalMaterial({
    color: isLightTheme() ? 0xffffff : 0xeaf3ff,
    transparent: true,
    opacity: isLightTheme() ? 0.22 : 0.28,
    roughness: isLightTheme() ? 0.08 : 0.12,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: isLightTheme() ? 0.06 : 0.1,
    reflectivity: isLightTheme() ? 0.62 : 0.52,
    side: THREE.DoubleSide
  });
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(2.08, 1.22), screenMaterialRef);
  glass.position.z = 0.01;
  screenGroup.add(glass);
}

function getControlColor(kind) {
  switch (kind) {
    case "face":
      return 0xff5b5b;
    case "stick":
      return 0xd44747;
    case "pad":
      return 0xc93a3a;
    case "utility":
      return 0xe15d5d;
    case "dpad":
      return 0xe84c4c;
    case "bumper":
    case "trigger":
    case "rear":
      return 0xb83232;
    default:
      return 0xff6666;
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
    .filter((entry) => entry.projected.visible && entry.summary.length);

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
    bindings[controlId] = dedupeActivators(bindings[controlId]);
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
  const activators = mapInputToActivators(input);
  bindings[controlId].push(...activators);
}

function bindCompoundInput(bindings, controlId, inputs, labels) {
  if (!bindings[controlId]) return;
  for (const [inputName, label] of Object.entries(labels)) {
    const activators = mapInputToActivators(inputs[inputName], { displayPrefix: label });
    if (!activators.length) continue;
    bindings[controlId].push(...activators);
  }
}

function mapInputToActivators(input, options = {}) {
  if (!input || typeof input !== "object") return [];
  const { displayPrefix = "" } = options;
  const activatorEntries = [];
  if (input.activators && typeof input.activators === "object") {
    activatorEntries.push(...Object.entries(input.activators));
  } else {
    activatorEntries.push(["Full_Press", input]);
  }

  const mapped = [];
  activatorEntries.forEach(([vdfActivatorKey, activatorNode], index) => {
    const bindingStrings = extractBindingStringsFromActivatorNode(activatorNode);
    if (!bindingStrings.length) return;
    const internalType = mapVdfActivatorKeyToInternalType(vdfActivatorKey);
    const actions = bindingStrings
      .map((binding) => {
        if (typeof binding !== "string" || !binding.trim()) return null;
        const dsl = parseBindingDSL(binding);
        if (!dsl.command) return null;
        const outputCore = bindingDslToModelOutput(dsl);
        const output = displayPrefix ? `${displayPrefix}: ${outputCore}` : outputCore;
        return { output, delayMs: 0, dsl };
      })
      .filter(Boolean);
    if (!actions.length) return;
    const next = createDefaultActivator("", index);
    next.type = internalType;
    next.actions = actions;
    next.binding = actions[0]?.output ?? "";
    next.axisBinding = extractAxisBindingFromActivatorNode(activatorNode);
    mapped.push(sanitizeActivator(next, index));
  });

  return mapped;
}

function extractBindingStringsFromActivatorNode(node) {
  if (!node || typeof node !== "object") return [];
  const values = arrayify(node.bindings?.binding);
  return values.filter((entry) => typeof entry === "string" && entry.trim());
}

function extractAxisBindingFromActivatorNode(node) {
  if (!node || typeof node !== "object" || !node.axisBinding || typeof node.axisBinding !== "object") return null;
  return sanitizeAxisBinding(node.axisBinding);
}

function mapVdfActivatorKeyToInternalType(key) {
  const normalized = String(key ?? "").trim().replace(/_\d+$/, "");
  switch (normalized) {
    case "Double_Press":
      return "double_press";
    case "Long_Press":
      return "long_press";
    case "Start_Press":
      return "start_press";
    case "Release_Press":
      return "release_press";
    case "Chorded_Press":
      return "chorded_press";
    case "Soft_Pull":
    case "edge":
    case "Full_Press":
    default:
      return "regular_press";
  }
}

function mapInternalTypeToVdfActivatorKey(type) {
  switch (type) {
    case "double_press":
      return "Double_Press";
    case "long_press":
      return "Long_Press";
    case "start_press":
      return "Start_Press";
    case "release_press":
      return "Release_Press";
    case "chorded_press":
      return "Chorded_Press";
    case "regular_press":
    default:
      return "Full_Press";
  }
}

function formatBindingText(binding) {
  const parsed = parseBindingDSL(binding);
  if (!parsed.command) return "";

  const base = bindingDslToModelOutput(parsed);
  if (!base) return "";
  const meta = formatBindingMeta(parsed);
  return meta ? `${base} - ${meta}` : base;
}

function parseBindingDSL(binding) {
  const parts = splitBindingFields(binding).map((part) => part.trim());
  const [head = "", ...meta] = parts;
  const [command = "", ...argTokens] = head.split(/\s+/).filter(Boolean);
  const argsRaw = argTokens.join(" ").trim();
  return {
    raw: binding,
    command: command.toLowerCase(),
    commandRaw: command,
    argsRaw,
    argTokens,
    label: meta[0] ?? "",
    icon: meta[1] ?? "",
    colors: meta[2] ?? "",
    extra: meta.slice(3)
  };
}

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

function bindingDslToModelOutput(parsed) {
  const { command, argsRaw, argTokens } = parsed;
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
    case "controller_action":
      return formatControllerAction(argsRaw, argTokens);
    default:
      return `${formatToken(parsed.commandRaw || command)}${argsRaw ? ` ${formatToken(argsRaw)}` : ""}`.trim();
  }
}

function formatControllerAction(argsRaw, argTokens) {
  if (!argsRaw) return "Controller Action";
  const normalized = argsRaw.toLowerCase();
  if (normalized === "empty_sub_command" || normalized === "empty_binding") return "No Action";
  if (normalized.startsWith("hold_layer")) {
    const layer = argTokens[1] ? ` ${argTokens[1]}` : "";
    return `Hold Layer${layer}`;
  }
  if (normalized.startsWith("switch_layer")) {
    const layer = argTokens[1] ? ` ${argTokens[1]}` : "";
    return `Switch Layer${layer}`;
  }
  return formatToken(argsRaw);
}

function modelOutputToBindingDsl(output) {
  const text = String(output ?? "").trim();
  if (!text) {
    return {
      command: "controller_action",
      commandRaw: "controller_action",
      argsRaw: "empty_sub_command",
      argTokens: ["empty_sub_command"],
      label: "",
      icon: "",
      colors: "",
      extra: [],
      raw: ""
    };
  }

  const stripped = stripDisplayPrefix(text);
  if (stripped === "No Action") {
    return {
      command: "controller_action",
      commandRaw: "controller_action",
      argsRaw: "empty_sub_command",
      argTokens: ["empty_sub_command"],
      label: "",
      icon: "",
      colors: "",
      extra: [],
      raw: ""
    };
  }
  if (stripped === "Wheel Up") {
    return {
      command: "mouse_wheel",
      commandRaw: "mouse_wheel",
      argsRaw: "SCROLL_UP",
      argTokens: ["SCROLL_UP"],
      label: "",
      icon: "",
      colors: "",
      extra: [],
      raw: ""
    };
  }
  if (stripped === "Wheel Down") {
    return {
      command: "mouse_wheel",
      commandRaw: "mouse_wheel",
      argsRaw: "SCROLL_DOWN",
      argTokens: ["SCROLL_DOWN"],
      label: "",
      icon: "",
      colors: "",
      extra: [],
      raw: ""
    };
  }
  if (stripped === "Left Mouse" || stripped === "Right Mouse" || stripped === "Middle Mouse") {
    const button = stripped.replace(" Mouse", "").toUpperCase();
    return {
      command: "mouse_button",
      commandRaw: "mouse_button",
      argsRaw: button,
      argTokens: [button],
      label: "",
      icon: "",
      colors: "",
      extra: [],
      raw: ""
    };
  }
  if (stripped === "Mouse Move") {
    return {
      command: "mouse_move",
      commandRaw: "mouse_move",
      argsRaw: "MOVE",
      argTokens: ["MOVE"],
      label: "",
      icon: "",
      colors: "",
      extra: [],
      raw: ""
    };
  }
  if (stripped.startsWith("Pad ")) {
    const token = stripped.slice(4).trim().replaceAll(" ", "_");
    return {
      command: "xinput_button",
      commandRaw: "xinput_button",
      argsRaw: token,
      argTokens: [token],
      label: "",
      icon: "",
      colors: "",
      extra: [],
      raw: ""
    };
  }
  if (stripped.startsWith("Mode Shift ")) {
    const match = stripped.match(/^Mode Shift\s+(.+?)\s*->\s*Group\s+(\d+)$/i);
    const source = match?.[1]?.trim().replaceAll(" ", "_").toLowerCase() || stripped.slice("Mode Shift ".length).trim().replaceAll(" ", "_").toLowerCase();
    const groupId = match?.[2] ?? "";
    const argsRaw = groupId ? `${source} ${groupId}` : source;
    return {
      command: "mode_shift",
      commandRaw: "mode_shift",
      argsRaw,
      argTokens: argsRaw ? argsRaw.split(/\s+/).filter(Boolean) : [],
      label: "",
      icon: "",
      colors: "",
      extra: [],
      raw: ""
    };
  }

  const keyArgs = stripped
    .split("+")
    .map((token) => mapModelKeyTokenToVdfToken(token.trim()))
    .filter(Boolean)
    .join("+");
  return {
    command: "key_press",
    commandRaw: "key_press",
    argsRaw: keyArgs || mapModelKeyTokenToVdfToken(stripped),
    argTokens: (keyArgs || mapModelKeyTokenToVdfToken(stripped)).split(/\s+/).filter(Boolean),
    label: "",
    icon: "",
    colors: "",
    extra: [],
    raw: ""
  };
}

function stripDisplayPrefix(output) {
  const match = output.match(/^(Click|North|South|East|West|Touch|Pull|Soft|Full):\s+(.+)$/);
  return match ? match[2] : output;
}

function mapModelKeyTokenToVdfToken(token) {
  const normalized = token.toUpperCase().replaceAll(" ", "_");
  const map = {
    UP: "UP_ARROW",
    DOWN: "DOWN_ARROW",
    LEFT: "LEFT_ARROW",
    RIGHT: "RIGHT_ARROW",
    ESC: "ESCAPE",
    CTRL: "LEFT_CONTROL",
    CONTROL: "LEFT_CONTROL",
    ALT: "LEFT_ALT",
    SHIFT: "LEFT_SHIFT",
    PAGE_DOWN: "PAGE_DOWN",
    PAGE_UP: "PAGE_UP",
    NUM0: "KEYPAD_0",
    NUM1: "KEYPAD_1",
    NUM2: "KEYPAD_2",
    NUM3: "KEYPAD_3",
    NUM4: "KEYPAD_4",
    NUM5: "KEYPAD_5",
    NUM6: "KEYPAD_6",
    NUM7: "KEYPAD_7",
    NUM8: "KEYPAD_8",
    NUM9: "KEYPAD_9"
  };
  return map[normalized] ?? normalized;
}

function serializeBindingDsl(parsed) {
  const normalized = sanitizeBindingDsl(parsed);
  if (!normalized) return "";
  if (normalized.raw && normalized.raw.includes(",") && normalized.command === normalized.commandRaw.toLowerCase()) {
    return normalized.raw;
  }
  const head = [normalized.commandRaw || normalized.command, normalized.argsRaw].filter(Boolean).join(" ").trim();
  const fields = [normalized.label || "", normalized.icon || "", normalized.colors || "", ...normalized.extra];
  return `${head}, ${fields.join(", ")}`;
}

function buildVdfBindingsPayload() {
  return Object.fromEntries(
    controls.map((control) => [control.id, activatorsToVdfBindings(getControlActivators(control.id))])
  );
}

function activatorsToVdfBindings(activators) {
  return activators.map((activator) => ({
    activator: mapInternalTypeToVdfActivatorKey(activator.type),
    bindings: activator.actions
      .map((step) => {
        const dsl = step.dsl && typeof step.dsl === "object" ? step.dsl : modelOutputToBindingDsl(step.output);
        return serializeBindingDsl(dsl);
      })
      .filter(Boolean),
    axisBinding: activator.axisBinding ? { ...activator.axisBinding } : null
  }));
}

function dedupeActivators(activators) {
  const seen = new Set();
  return activators.filter((activator) => {
    const signature = JSON.stringify({
      type: activator.type,
      actions: activator.actions.map((step) => step.dsl?.raw || step.output),
      axisBinding: activator.axisBinding ?? null
    });
    if (seen.has(signature)) return false;
    seen.add(signature);
    return true;
  });
}

function formatBindingMeta(parsed) {
  const parts = [];
  if (parsed.label) {
    if (parsed.label.startsWith("#")) {
      parts.push(`Label ${parsed.label} (localized)`);
    } else {
      parts.push(parsed.label);
    }
  }
  if (parsed.icon) parts.push(`Icon ${parsed.icon}`);
  if (parsed.colors) parts.push(`Colors ${parsed.colors}`);
  parsed.extra.filter(Boolean).forEach((extra) => parts.push(extra));
  return parts.join(" | ");
}

function formatKeyShortcut(arg) {
  if (!arg) return "";
  return arg
    .split("+")
    .map((token) => formatToken(mapVdfKeyTokenToModelToken(token.trim())))
    .filter(Boolean)
    .join("+");
}

function mapVdfKeyTokenToModelToken(token) {
  const normalized = token.toUpperCase();
  const map = {
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
    ESCAPE: "Esc",
    KEYPAD_0: "Num0",
    KEYPAD_1: "Num1",
    KEYPAD_2: "Num2",
    KEYPAD_3: "Num3",
    KEYPAD_4: "Num4",
    KEYPAD_5: "Num5",
    KEYPAD_6: "Num6",
    KEYPAD_7: "Num7",
    KEYPAD_8: "Num8",
    KEYPAD_9: "Num9"
  };
  return map[normalized] ?? token;
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
  if (state.paintMode) state.deckToolsOpen = true;
  syncDeckToolsVisibility();
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
  const lightTheme = isLightTheme();
  const baseColor = new THREE.Color(lightTheme ? 0x7f8ba3 : 0x2f3747);
  const selectedColor = new THREE.Color(lightTheme ? 0xc02424 : state.paintMode ? 0xff9999 : 0xff7373);
  const previewColor = new THREE.Color(lightTheme ? 0xff7d4a : 0xffa366);

  for (let faceIndex = 0; faceIndex < shellFaceOwners.length; faceIndex += 1) {
    const owner = shellFaceOwners[faceIndex];
    const ownerControl = owner ? getControlById(owner) : null;
    const paintedColor = new THREE.Color(getControlColor(ownerControl?.kind));
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
