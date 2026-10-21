import * as THREE from "https://esm.sh/three@0.160.0";
import { OrbitControls } from "https://esm.sh/three@0.160.0/examples/jsm/controls/OrbitControls.js";
import { STLLoader } from "https://esm.sh/three@0.160.0/examples/jsm/loaders/STLLoader.js";
import { REMOTE_API_BASE, LOCAL_API_BASE } from "./config.js";
import { extractSteamInputDbLayouts, mapQueryFilesLayouts, mapStoreSearchItems } from "./core/community.js";
import { parseVdf, serializeVdf } from "./core/vdf.js";
import { readControllerConfig, buildControllerConfig, getEffectiveBindings } from "./core/steam-input.js";
import {
  ACTIVATOR_TYPES,
  AXIS_CONTROL_MODES,
  activatorHasAction,
  axisBindingHasSlots,
  clampNumber,
  createDefaultActivator,
  normalizeActivatorActions,
  normalizeBindingValue,
  sanitizeAxisBinding
} from "./core/layout-model.js";
import { describeActivator, describeControl, describeLayoutOverview, describeStep, diffLayouts } from "./core/layout-summary.js";
import { CHEAT_SHEET_SECTIONS, getDeckControl } from "./core/deck-controls.js";

// Positions on the 3D shell; names and kinds come from core/deck-controls.js.
const CONTROL_GEOMETRY = [
  { id: "left_bumper", pos: [-1.9070061445236206, 1.124805967013041, -0.022185817981759705], size: [0.54, 0.18, 0.28], rotation: [-0.17970247776285814, -0.010401277067988768, 0.057192679649428126], scale: [1, 1, 0.7477379880849421] },
  { id: "right_bumper", pos: [1.8418513933817544, 1.1354556481043496, -0.038603511949380234], size: [0.54, 0.18, 0.28], rotation: [-0.18, 0, 0], scale: [0.9926492182394554, 0.5072335817822604, 0.6092462576274693] },
  { id: "left_trigger", pos: [-1.8448127508163452, 1.0392525593439736, -0.16875980297724405], size: [0.46, 0.22, 0.5], rotation: [-0.35, 0, 0], scale: [0.9175983495498393, 0.5701425059009136, 0.5204343747279385] },
  { id: "right_trigger", pos: [1.7487382491429646, 1.0724905729293823, -0.14798887570699054], size: [0.46, 0.22, 0.5], rotation: [-0.35, 0, 0], scale: [0.7706175670172294, 0.6249397365568353, 0.5326117517528911] },
  { id: "left_stick", pos: [-1.5278548796971638, 0.8009234468142191, 0.3545029064019521], size: [0.24, 0.13, 24], rotation: [1.5707963267948966, 0, 0], scale: [0.5, 0.5, 0.5] },
  { id: "right_stick", pos: [1.5005214214324951, 0.7763124505678812, 0.3545029064019521], size: [0.24, 0.13, 24], rotation: [1.5707963267948966, 0, 0], scale: [0.5, 0.5, 0.5] },
  { id: "left_pad", pos: [-1.4848190148671467, 0.24328768750031787, 0.1973915994167328], size: [0.66, 0.5, 0.06], rotation: [0, 0, 0], scale: [0.666792935347466, 0.9095993327254873, 1.0052069336166984] },
  { id: "right_pad", pos: [1.6002639532089233, 0.24328768750031787, 0.1973915994167328], size: [0.66, 0.5, 0.06], rotation: [0, 0, 0], scale: [0.6840672609280403, 0.9602273328163837, 1] },
  { id: "view", pos: [-1.6787373622258503, 1.0720743338267007, 0.20313108960787454], size: [0.18, 0.08, 0.07], rotation: [0, 0, 0], scale: [0.7718260318261734, 1, 1] },
  { id: "menu", pos: [1.6788936456044514, 1.0720743338267007, 0.20313108960787454], size: [0.18, 0.08, 0.07], rotation: [0, 0, 0], scale: [1, 1, 1] },
  { id: "steam", pos: [-1.4477551380793252, -0.03469822369515896, 0.1915585696697235], size: [0.14, 0.14, 0.06], rotation: [0, 0, 0], scale: [1.678227421016667, 0.6425742679181182, 1.3131953078484062] },
  { id: "quick_access", pos: [1.447754899660746, -0.0643408065661788, 0.1915585696697235], size: [0.16, 0.12, 0.06], rotation: [0, 0, 0], scale: [1.188975197989932, 0.9017574539047117, 1] },
  { id: "dpad_up", pos: [-1.9162099361419678, 1.008418063322703, 0.22144445280234018], size: [0.18, 0.11, 0.045], rotation: [0, 0, 0], scale: [1, 1, 1] },
  { id: "dpad_down", pos: [-1.9381882747014363, 0.7662722865740458, 0.22154265642166138], size: [0.18, 0.11, 0.045], rotation: [0, 0, 0], scale: [1, 1, 1] },
  { id: "dpad_left", pos: [-2.0328590075174966, 0.896206259727478, 0.22153052687644958], size: [0.11, 0.18, 0.045], rotation: [0, 0, 0], scale: [1, 1, 1] },
  { id: "dpad_right", pos: [-1.7928784688313801, 0.8784178892771403, 0.2213268280029297], size: [0.11, 0.18, 0.045], rotation: [0, 0, 0], scale: [1, 1, 1] },
  { id: "x", pos: [1.805057962735494, 0.8825451532999674, 0.2214406927426656], size: [0.09, 0.06, 20], rotation: [1.5707963267948966, 0, 0], scale: [1, 1, 1] },
  { id: "y", pos: [1.9201560815175374, 0.9941441218058268, 0.2214406927426656], size: [0.09, 0.06, 20], rotation: [1.5707963267948966, 0, 0], scale: [1, 1, 1] },
  { id: "a", pos: [1.9095153013865152, 0.7573799689610798, 0.2214406927426656], size: [0.09, 0.06, 20], rotation: [1.5707963267948966, 0, 0], scale: [1, 1, 1] },
  { id: "b", pos: [2.0545754432678223, 0.8904473980267842, 0.20950340231259662], size: [0.09, 0.06, 20], rotation: [1.5707963267948966, 0, 0], scale: [1, 1, 1] },
  { id: "left_grip_4", pos: [-1.6133379141489663, 0.27285367250442505, -0.1351798375447591], size: [0.34, 0.18, 0.14], rotation: [-0.07308699292290546, -0.46169632762870666, -0.02645219815081445], scale: [1, 1.4964297947289706, 1] },
  { id: "left_grip_5", pos: [-1.554385224978129, -0.031910067424178123, -0.09912295639514923], size: [0.34, 0.18, 0.14], rotation: [0.08677762251471617, -0.4604422579535512, 0.03279662112019297], scale: [1, 1.423939915867236, 0.45765880054170427] },
  { id: "right_grip_4", pos: [1.620943268140157, 0.3415716787179311, -0.14454569419225055], size: [0.34, 0.18, 0.14], rotation: [0.1155606541002835, 0.19637704731326103, -0.03940858525112614], scale: [0.6770387748281969, 1.3648758314937044, 0.3609690967760934] },
  { id: "right_grip_5", pos: [1.6039751768112183, 0.03561945694188277, -0.12487076967954636], size: [0.34, 0.18, 0.14], rotation: [0.14011519040806605, 0.6981317007977318, -0.09062077740806787], scale: [0.8530498643533708, 1.4298278821587411, 0.6161448889316428] },
];

const DEFAULT_CONTROLS = CONTROL_GEOMETRY.map((entry) => ({ ...getDeckControl(entry.id), ...entry }));

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
  // Action sets and layers; a plain layout has a single "Default" set.
  presets: [createEmptyPreset()],
  activePresetIndex: 0,
  layoutTitle: "",
  layoutDescription: "",
  // Increments whenever the user loads or resets a layout, so slower
  // background loads can tell they are stale.
  layoutGeneration: 0,
  comparison: null
};
const requestSequence = new Map();

const MODEL_URL = "./assets/steamdeck_shell.stl";
const DEFAULT_LAYOUT_URL = "./saved-layouts/steamdeck-layout-2026-03-11.json";
const DEFAULT_EXPORT_NAME = "Steam Deck Layout Studio export";
const STEAM_CONTROLLER_CONFIGS_APP_ID = 241100;
const TARGET_MODEL_WIDTH = 4.35;
const FALLBACK_BODY_SIZE = [4.3, 1.8, 1.25];
const DEBUG_KEY_SEQUENCE = ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "A", "S", "D", "F", "G", "H", "J", "K", "L", "Z", "X", "C", "V", "B", "N", "M"];
const CRITICAL_CONTROL_IDS = ["left_stick", "right_stick", "a", "b", "x", "y", "left_trigger", "right_trigger", "left_bumper", "right_bumper", "menu", "view"];
const MODIFIER_TOKENS = ["Ctrl", "Shift", "Alt", "Meta"];
const THEME_STORAGE_KEY = "steamdeck-layout-theme";
const DRAFT_STORAGE_KEY = "steamdeck-layout-draft";
const API_BASE_STORAGE_KEY = "steamdeck-layout-api-base";
const API_BASE = resolveApiBase();
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
  appStatus: document.getElementById("appStatus"),
  openCommunityBtn: document.getElementById("openCommunityBtn"),
  communityDialogBackdrop: document.getElementById("communityDialogBackdrop"),
  communityDialogCloseBtn: document.getElementById("communityDialogCloseBtn"),
  layoutDetailTitle: document.getElementById("layoutDetailTitle"),
  layoutDetailMeta: document.getElementById("layoutDetailMeta"),
  layoutDetailDescription: document.getElementById("layoutDetailDescription"),
  layoutDetailTags: document.getElementById("layoutDetailTags"),
  dialogLoadLayoutBtn: document.getElementById("dialogLoadLayoutBtn"),
  dialogCompareLayoutBtn: document.getElementById("dialogCompareLayoutBtn"),
  layoutOverview: document.getElementById("layoutOverview"),
  copyLayoutLinkBtn: document.getElementById("copyLayoutLinkBtn"),
  presetSelectLabel: document.getElementById("presetSelectLabel"),
  presetSelect: document.getElementById("presetSelect"),
  cheatSheetBtn: document.getElementById("cheatSheetBtn"),
  cheatSheetBackdrop: document.getElementById("cheatSheetBackdrop"),
  cheatSheetTitle: document.getElementById("cheatSheetTitle"),
  cheatSheetBody: document.getElementById("cheatSheetBody"),
  cheatSheetPrintBtn: document.getElementById("cheatSheetPrintBtn"),
  cheatSheetCopyBtn: document.getElementById("cheatSheetCopyBtn"),
  cheatSheetCloseBtn: document.getElementById("cheatSheetCloseBtn"),
  compareBtn: document.getElementById("compareBtn"),
  compareBackdrop: document.getElementById("compareBackdrop"),
  compareCloseBtn: document.getElementById("compareCloseBtn"),
  compareSelectA: document.getElementById("compareSelectA"),
  compareSelectB: document.getElementById("compareSelectB"),
  compareSummary: document.getElementById("compareSummary"),
  compareList: document.getElementById("compareList"),
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
let overlayDirty = true;
let modelStatusMessage = "Loading Steam Deck shell model…";
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
    if (file) await handleLayoutFile(file, "drop");
  });

  el.newLayoutBtn.addEventListener("click", () => {
    state.layoutGeneration += 1;
    state.loadedLayoutMeta = null;
    state.layoutTitle = "";
    state.layoutDescription = "";
    state.presets = [createEmptyPreset()];
    state.activePresetIndex = 0;
    replaceLayoutUrlParam(null);
    controls.forEach((control) => {
      const defaults = getDefaultControl(control.id);
      control.pos = [...defaults.pos];
      control.rotation = [...getDefaultRotationForControl(control.id, control.kind)];
      control.scale = [...getDefaultScale(control.id)];
    });
    clearAllPaintRegions();
    selectControl(null);
    renderPresetSelect();
    updateCommunitySummary();
    refreshBindingViews();
  });
  el.debugMapBtn.addEventListener("click", applyDebugBindings);
  el.presetSelect.addEventListener("change", () => {
    state.activePresetIndex = clamp(Number.parseInt(el.presetSelect.value, 10) || 0, 0, state.presets.length - 1);
    refreshBindingViews();
    if (state.bindingEditorOpen) renderBindingEditor();
  });
  el.copyLayoutLinkBtn.addEventListener("click", copyLayoutLink);
  el.cheatSheetBtn.addEventListener("click", showCheatSheet);
  el.cheatSheetCloseBtn.addEventListener("click", () => closeDialog(el.cheatSheetBackdrop));
  el.cheatSheetPrintBtn.addEventListener("click", () => window.print());
  el.cheatSheetCopyBtn.addEventListener("click", copyCheatSheetText);
  el.compareBtn.addEventListener("click", () => showCompareDialog());
  el.compareCloseBtn.addEventListener("click", () => closeDialog(el.compareBackdrop));
  el.compareSelectA.addEventListener("change", renderComparison);
  el.compareSelectB.addEventListener("change", renderComparison);
  el.dialogCompareLayoutBtn.addEventListener("click", () => {
    if (state.selectedLayoutDetail) void compareWithCommunityLayout(state.selectedLayoutDetail);
  });
  for (const backdrop of [el.cheatSheetBackdrop, el.compareBackdrop]) {
    backdrop.addEventListener("click", (event) => {
      if (event.target === backdrop) closeDialog(backdrop);
    });
  }
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    // The key-capture field in the binding editor records Escape as a key.
    if (event.target === el.bindingEditorStepInput) return;
    const open = [el.bindingEditorBackdrop, el.compareBackdrop, el.cheatSheetBackdrop, el.communityDialogBackdrop]
      .find((backdrop) => !backdrop.classList.contains("hidden"));
    if (!open) return;
    event.preventDefault();
    if (open === el.bindingEditorBackdrop) hideBindingEditor();
    else if (open === el.communityDialogBackdrop) hideCommunityDialog();
    else closeDialog(open);
  });

  el.saveLayoutBtn.addEventListener("click", saveLayoutToStorage);
  el.exportVdfBtn.addEventListener("click", exportCurrentLayoutVdf);
  el.loadLayoutBtn.addEventListener("click", loadLayoutFromStorage);
  el.themeAutoBtn.addEventListener("click", () => setThemeMode("auto"));
  el.themeLightBtn.addEventListener("click", () => setThemeMode("light"));
  el.themeDarkBtn.addEventListener("click", () => setThemeMode("dark"));
  el.fileInput.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    // Reset first so choosing the same file again still fires "change".
    event.target.value = "";
    if (file) await handleLayoutFile(file);
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
  const deepLinkId = new URLSearchParams(window.location.search).get("layout")?.trim() ?? "";
  if (!restored && !deepLinkId) await loadDefaultLayout();
  renderPresetSelect();
  refreshBindingViews();
  state.layoutPersistenceReady = true;
  if (deepLinkId) {
    const validId = /^\d{1,20}$/.test(deepLinkId);
    const loaded = validId && await loadLayoutFromDeepLink(deepLinkId);
    if (!loaded) {
      if (!validId) setLayoutStatus("The shared link does not contain a valid layout id.", true);
      replaceLayoutUrlParam(null);
      if (!restored) await loadDefaultLayout();
    }
  }
  schedulePersistCurrentLayoutState();
}

/** Loads a shared layout by its Steam published file id (?layout=<id>). */
async function loadLayoutFromDeepLink(fileId) {
  setLayoutStatus(`Loading shared layout ${fileId}...`);
  try {
    const response = await fetch(apiUrl("file-details", { id: fileId }));
    if (!response.ok) throw new Error("Details request failed");
    const details = (await response.json())?.response?.publishedfiledetails?.[0];
    if (details?.result !== 1 || details.creator_app_id !== STEAM_CONTROLLER_CONFIGS_APP_ID || !details.file_url) {
      throw new Error("Not a controller layout");
    }
    const meta = {
      title: details.title || `Layout ${fileId}`,
      description: details.description || "",
      file_id: String(details.publishedfileid ?? fileId),
      file_url: details.file_url,
      app_id: details.consumer_app_id,
      subscriptions: Number(details.lifetime_subscriptions ?? details.subscriptions ?? 0),
      // Only feature tags ("feature_gyro") describe the layout itself.
      tags: Array.isArray(details.tags)
        ? details.tags.map((tag) => String(tag?.tag ?? tag)).filter((tag) => tag.startsWith("feature_")).map((tag) => tag.slice(8))
        : []
    };
    const vdf = await fetchCommunityLayoutVdf(meta);
    backupDraft("before-link");
    applyVdfLayout(vdf, meta);
    return true;
  } catch {
    setLayoutStatus(`Shared layout ${fileId} could not be loaded.`, true);
    return false;
  }
}

function backupDraft(suffix) {
  try {
    const current = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (current) localStorage.setItem(`${DRAFT_STORAGE_KEY}-${suffix}`, current);
  } catch {
    // Ignore storage failures.
  }
}

function replaceLayoutUrlParam(fileId) {
  const url = new URL(window.location.href);
  if (fileId) url.searchParams.set("layout", String(fileId));
  else url.searchParams.delete("layout");
  if (url.toString() !== window.location.href) window.history.replaceState(null, "", url);
  el.copyLayoutLinkBtn.hidden = !fileId;
}

async function copyLayoutLink() {
  const fileId = state.loadedLayoutMeta?.file_id;
  if (!fileId) return;
  const url = new URL(window.location.pathname, window.location.origin);
  url.searchParams.set("layout", String(fileId));
  try {
    await navigator.clipboard.writeText(url.toString());
    flashButtonLabel(el.copyLayoutLinkBtn, "Link copied");
  } catch {
    window.prompt("Copy this link:", url.toString());
  }
}

function flashButtonLabel(button, label) {
  const original = button.dataset.label ?? button.textContent;
  button.dataset.label = original;
  button.textContent = label;
  setTimeout(() => {
    button.textContent = original;
  }, 1600);
}

function renderPresetSelect() {
  el.presetSelect.innerHTML = "";
  state.presets.forEach((preset, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = preset.kind === "layer" ? `↳ ${preset.title} (layer)` : preset.title;
    el.presetSelect.appendChild(option);
  });
  el.presetSelect.value = String(state.activePresetIndex);
  el.presetSelectLabel.hidden = state.presets.length < 2;
}

function getEffectivePresetView(presets, preset) {
  const parent = preset.kind === "layer" ? presets.find((candidate) => candidate.name === preset.parentName) : null;
  return {
    ...preset,
    bindings: getEffectiveBindings(presets, preset),
    modes: { ...(parent?.modes ?? {}), ...preset.modes },
    gyro: preset.gyro ?? parent?.gyro ?? null
  };
}

function renderLayoutOverview() {
  const view = getEffectivePresetView(state.presets, getActivePreset());
  el.layoutOverview.textContent = describeLayoutOverview(view, controls, { presetNames: getPresetNames() });
}

// Dialogs: remember the opener, move focus in, and give it back on close.
const dialogOpeners = new Map();

function openDialog(backdrop, focusTarget = null) {
  dialogOpeners.set(backdrop, document.activeElement);
  backdrop.classList.remove("hidden");
  const target = focusTarget ?? backdrop.querySelector("button, input, select, textarea");
  requestAnimationFrame(() => target?.focus());
}

function closeDialog(backdrop) {
  backdrop.classList.add("hidden");
  restoreFocus(backdrop);
}

function restoreFocus(backdrop) {
  const opener = dialogOpeners.get(backdrop);
  dialogOpeners.delete(backdrop);
  if (opener && typeof opener.focus === "function" && document.contains(opener)) opener.focus();
}

function getCheatSheetModel() {
  const preset = getActivePreset();
  const view = getEffectivePresetView(state.presets, preset);
  const options = { presetNames: getPresetNames() };
  const title = state.layoutTitle || state.loadedLayoutMeta?.title || "Steam Deck layout";
  const subtitle = state.presets.length > 1 ? preset.title : "";
  const sections = CHEAT_SHEET_SECTIONS.map((section) => ({
    title: section.title,
    rows: section.ids
      .map((id) => getControlById(id))
      .filter(Boolean)
      .map((control) => ({ name: control.name, lines: describeControl(view.bindings[control.id], view.modes[control.id], options) }))
      .filter((row) => row.lines.length)
  })).filter((section) => section.rows.length);
  return { title, subtitle, overview: describeLayoutOverview(view, controls, options), sections };
}

function showCheatSheet() {
  const model = getCheatSheetModel();
  el.cheatSheetTitle.textContent = model.subtitle ? `${model.title} — ${model.subtitle}` : model.title;
  el.cheatSheetBody.innerHTML = "";
  const overview = document.createElement("p");
  overview.className = "cheat-sheet-overview";
  overview.textContent = model.overview;
  el.cheatSheetBody.appendChild(overview);
  const grid = document.createElement("div");
  grid.className = "cheat-sheet-grid";
  for (const section of model.sections) {
    const block = document.createElement("section");
    const heading = document.createElement("h3");
    heading.textContent = section.title;
    block.appendChild(heading);
    const list = document.createElement("dl");
    for (const row of section.rows) {
      const term = document.createElement("dt");
      term.textContent = row.name;
      list.appendChild(term);
      for (const line of row.lines) {
        const detail = document.createElement("dd");
        detail.textContent = line;
        list.appendChild(detail);
      }
    }
    block.appendChild(list);
    grid.appendChild(block);
  }
  el.cheatSheetBody.appendChild(grid);
  openDialog(el.cheatSheetBackdrop, el.cheatSheetPrintBtn);
}

async function copyCheatSheetText() {
  const model = getCheatSheetModel();
  const lines = [model.subtitle ? `${model.title} — ${model.subtitle}` : model.title, "", model.overview];
  for (const section of model.sections) {
    lines.push("", section.title.toUpperCase());
    for (const row of section.rows) {
      lines.push(`${row.name}: ${row.lines.join("; ")}`);
    }
  }
  try {
    await navigator.clipboard.writeText(lines.join("\n"));
    flashButtonLabel(el.cheatSheetCopyBtn, "Copied");
  } catch {
    setLayoutStatus("Copying to the clipboard is not allowed here.", true);
  }
}

function getCompareSources() {
  const sources = state.presets.map((preset, index) => ({
    key: `current:${index}`,
    label: `${state.layoutTitle || "Current layout"} · ${preset.title}`,
    view: getEffectivePresetView(state.presets, preset)
  }));
  if (state.comparison) {
    state.comparison.presets.forEach((preset, index) => {
      sources.push({
        key: `other:${index}`,
        label: `${state.comparison.title} · ${preset.title}`,
        view: getEffectivePresetView(state.comparison.presets, preset)
      });
    });
  }
  return sources;
}

function showCompareDialog(preferredB = null) {
  const sources = getCompareSources();
  for (const select of [el.compareSelectA, el.compareSelectB]) {
    select.innerHTML = "";
    for (const source of sources) {
      const option = document.createElement("option");
      option.value = source.key;
      option.textContent = source.label;
      select.appendChild(option);
    }
  }
  el.compareSelectA.value = `current:${state.activePresetIndex}`;
  const fallbackB = sources.find((source) => source.key !== el.compareSelectA.value)?.key ?? el.compareSelectA.value;
  el.compareSelectB.value = preferredB && sources.some((source) => source.key === preferredB) ? preferredB : fallbackB;
  renderComparison();
  openDialog(el.compareBackdrop, el.compareSelectB);
}

function renderComparison() {
  const sources = getCompareSources();
  const a = sources.find((source) => source.key === el.compareSelectA.value);
  const b = sources.find((source) => source.key === el.compareSelectB.value);
  el.compareList.innerHTML = "";
  if (!a || !b || a.key === b.key) {
    el.compareSummary.textContent = sources.length < 2
      ? "Load a layout with several action sets, or pick “Compare” on a community layout, to compare."
      : "Pick two different layouts to compare.";
    return;
  }
  const options = { presetNames: getPresetNames() };
  const changes = diffLayouts(a.view, b.view, controls, options);
  const gyroA = a.view.gyro?.mode ?? "";
  const gyroB = b.view.gyro?.mode ?? "";
  el.compareSummary.textContent = changes.length || gyroA !== gyroB
    ? `${changes.length} control${changes.length === 1 ? " differs" : "s differ"}${gyroA !== gyroB ? "; gyro differs" : ""}.`
    : "No differences.";
  for (const change of changes) {
    const item = document.createElement("li");
    item.className = `compare-item ${change.status}`;
    const name = document.createElement("strong");
    name.textContent = change.name;
    item.appendChild(name);
    for (const [label, lines] of [["Before", change.before], ["After", change.after]]) {
      const column = document.createElement("div");
      column.className = "compare-column";
      const caption = document.createElement("span");
      caption.className = "compare-caption";
      caption.textContent = label;
      column.appendChild(caption);
      for (const line of lines.length ? lines : ["Unmapped"]) {
        const text = document.createElement("div");
        text.textContent = line;
        column.appendChild(text);
      }
      item.appendChild(column);
    }
    el.compareList.appendChild(item);
  }
}

async function compareWithCommunityLayout(layoutMeta) {
  const isLatest = beginRequest("layout-compare");
  setLayoutStatus(`Loading ${layoutMeta.title} for comparison...`);
  try {
    const vdf = await fetchCommunityLayoutVdf(layoutMeta);
    const doc = readControllerConfig(parseVdf(vdf), controls.map((control) => control.id));
    if (!isLatest()) return;
    if (!doc.presets.length) throw new Error("No action sets");
    state.comparison = { title: layoutMeta.title || doc.title || "Community layout", presets: doc.presets };
    setLayoutStatus(`Comparing with ${state.comparison.title}.`, false);
    hideCommunityDialog();
    showCompareDialog("other:0");
  } catch {
    if (isLatest()) setLayoutStatus(`Failed to load ${layoutMeta.title} for comparison.`, true);
  }
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

function resolveApiBase() {
  let override = new URLSearchParams(window.location.search).get("api")?.trim() ?? "";
  try {
    if (override === "default") {
      localStorage.removeItem(API_BASE_STORAGE_KEY);
      override = "";
    } else if (override) {
      localStorage.setItem(API_BASE_STORAGE_KEY, override);
    } else {
      override = localStorage.getItem(API_BASE_STORAGE_KEY) ?? "";
    }
  } catch {
    // Storage unavailable: the override applies to this page load only.
  }
  if (override === "default") override = "";
  if (override) return override;
  const isLocal = ["localhost", "127.0.0.1", "[::1]"].includes(window.location.hostname);
  return isLocal || !REMOTE_API_BASE ? LOCAL_API_BASE : REMOTE_API_BASE;
}

function apiUrl(endpoint, params) {
  const url = new URL(API_BASE, window.location.href);
  url.searchParams.set("endpoint", endpoint);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  return url.toString();
}

async function fetchCommunityLayoutVdf(layoutMeta) {
  const response = await fetch(apiUrl("layout-file", { url: layoutMeta.file_url }));
  if (!response.ok) throw new Error("Layout fetch failed");
  return response.text();
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
  if (sceneRef.fog) sceneRef.fog.color.set(bg);
  else sceneRef.fog = new THREE.Fog(bg, 5.5, 11);
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

/**
 * Applies a saved layout (format 1: flat bindings, format 2: presets).
 * Everything is parsed before any state changes, so a bad file leaves the
 * current layout untouched. Calibration (positions, paint regions) only
 * changes when the file carries it.
 */
function applyLayoutData(json, requireBindings = true) {
  if (!json || typeof json !== "object") throw new Error("Invalid layout file");
  const presets = parseLayoutPresets(json);
  if (requireBindings && !presets) throw new Error("Invalid layout file");

  const calibration = controls.map((control) => ({
    control,
    pos: readVector(json.controlPositions?.[control.id]),
    rotation: readVector(json.controlRotations?.[control.id]),
    scale: readVector(json.controlScales?.[control.id], (value) => value > 0)
  }));

  if (presets) {
    state.presets = presets;
    state.activePresetIndex = clamp(Math.floor(Number(json.activePresetIndex) || 0), 0, presets.length - 1);
  }
  state.layoutTitle = typeof json.name === "string" && json.name !== DEFAULT_EXPORT_NAME ? json.name : "";
  state.layoutDescription = typeof json.description === "string" ? json.description : "";
  state.loadedLayoutMeta = json.loadedLayoutMeta && typeof json.loadedLayoutMeta === "object" ? json.loadedLayoutMeta : null;
  for (const entry of calibration) {
    if (entry.pos) entry.control.pos = entry.pos;
    if (entry.rotation) entry.control.rotation = entry.rotation;
    if (entry.scale) entry.control.scale = entry.scale;
  }
  if (json.paintRegions && typeof json.paintRegions === "object") {
    pendingPaintRegions = json.paintRegions;
    applyPendingPaintRegions();
  }
  renderPresetSelect();
  updateCommunitySummary();
  schedulePersistCurrentLayoutState();
}

function parseLayoutPresets(json) {
  if (Array.isArray(json.presets) && json.presets.length) {
    return json.presets.map((preset, index) => ({
      id: typeof preset?.id === "string" ? preset.id : String(index),
      name: typeof preset?.name === "string" && preset.name ? preset.name : index === 0 ? "Default" : `Preset_${index}`,
      title: typeof preset?.title === "string" && preset.title ? preset.title : preset?.name || "Default",
      kind: preset?.kind === "layer" ? "layer" : "set",
      parentName: typeof preset?.parentName === "string" ? preset.parentName : "",
      bindings: normalizeBindingsRecord(preset?.bindings),
      modes: preset?.modes && typeof preset.modes === "object" ? structuredClone(preset.modes) : {},
      gyro: preset?.gyro?.mode ? { mode: String(preset.gyro.mode) } : null
    }));
  }
  if (json.bindings && typeof json.bindings === "object") {
    return [{ ...createEmptyPreset(), bindings: normalizeBindingsRecord(json.bindings) }];
  }
  return null;
}

function normalizeBindingsRecord(bindings) {
  const result = {};
  if (!bindings || typeof bindings !== "object") return result;
  for (const control of controls) {
    if (bindings[control.id] === undefined) continue;
    const activators = normalizeBindingValue(bindings[control.id]);
    if (activators.length) result[control.id] = activators;
  }
  return result;
}

function readVector(value, isValid = () => true) {
  return Array.isArray(value) && value.length === 3 && value.every((entry) => Number.isFinite(entry) && isValid(entry))
    ? [...value]
    : null;
}

async function loadDefaultLayout() {
  const generation = state.layoutGeneration;
  try {
    const response = await fetch(DEFAULT_LAYOUT_URL, { cache: "no-store" });
    if (!response.ok) return;
    const json = await response.json();
    // The user loaded something while the default was still downloading.
    if (generation !== state.layoutGeneration) return;
    applyLayoutData(json, false);
    refreshBindingViews();
  } catch {
    // Keep the app usable even if the default checkpoint is missing.
  }
}

function restorePersistedLayoutState() {
  let stored = null;
  try {
    stored = localStorage.getItem(DRAFT_STORAGE_KEY);
  } catch {
    return false;
  }
  if (!stored) return false;
  try {
    const payload = JSON.parse(stored);
    const layoutPayload = payload?.payload ?? payload;
    if (!layoutPayload || typeof layoutPayload !== "object") throw new Error("Invalid draft");
    applyLayoutData(layoutPayload, false);
    const ui = payload?.ui;
    if (typeof ui?.selectedControlId === "string" && getControlById(ui.selectedControlId)) {
      state.selectedControlId = ui.selectedControlId;
      state.selectedActivatorIndex = clampNumber(ui.selectedActivatorIndex, 0, 99, 0);
    }
    refreshBindingViews();
    setLayoutStatus("Restored local draft from browser storage.", false);
    return true;
  } catch {
    // Keep the unreadable draft instead of overwriting it with the default.
    try {
      localStorage.setItem(`${DRAFT_STORAGE_KEY}-unreadable`, stored);
    } catch {
      // Ignore storage failures.
    }
    return false;
  }
}











function createEmptyPreset() {
  return { id: "0", name: "Default", title: "Default", kind: "set", parentName: "", bindings: {}, modes: {}, gyro: null };
}

function getActivePreset() {
  return state.presets[state.activePresetIndex] ?? state.presets[0];
}

function getActiveBindings() {
  return getEffectiveBindings(state.presets, getActivePreset());
}

function getPresetNames() {
  return Object.fromEntries(state.presets.map((preset) => [preset.id, preset.title]));
}

/** Read-only view of a control's activators, including ones a layer inherits. */
function getControlActivators(controlId) {
  return getActiveBindings()[controlId] ?? [];
}

/** Activators to mutate; a layer gets its own copy of an inherited control. */
function getEditableActivators(controlId) {
  const preset = getActivePreset();
  if (!Array.isArray(preset.bindings[controlId])) {
    const inherited = getActiveBindings()[controlId] ?? [];
    preset.bindings[controlId] = inherited.map((activator) => structuredClone(activator));
  }
  return preset.bindings[controlId];
}

function getControlMode(controlId) {
  const preset = getActivePreset();
  if (preset.modes?.[controlId]) return preset.modes[controlId];
  if (preset.kind !== "layer") return undefined;
  return state.presets.find((candidate) => candidate.name === preset.parentName)?.modes?.[controlId];
}

/** Starts a request on a channel and returns a check for whether it is still the latest. */
function beginRequest(channel) {
  const id = (requestSequence.get(channel) ?? 0) + 1;
  requestSequence.set(channel, id);
  return () => requestSequence.get(channel) === id;
}

function getSelectedControl() {
  return state.selectedControlId ? getControlById(state.selectedControlId) : null;
}

function isAxisControl(controlId) {
  const control = getControlById(controlId);
  return control?.kind === "stick" || control?.kind === "pad";
}

function isAxisEditing(controlId, activator) {
  return isAxisControl(controlId) && !activator?.input;
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
  const legacy = active.actions.find((step) => step.output)?.output ?? "";
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
  if (!axisBindingHasSlots(axisBinding)) return "Unmapped";
  const mode = AXIS_CONTROL_MODES.find((entry) => entry.value === axisBinding.mode)?.label ?? "Mouse Move";
  const slots = ["click", "move", "up", "down", "left", "right"]
    .filter((slot) => getAxisSlotValue(axisBinding, slot))
    .map((slot) => `${slot[0].toUpperCase()}${slot.slice(1)}: ${getAxisSlotValue(axisBinding, slot)}`);
  return [mode, ...slots].join(" • ");
}


function renderAxisBindingSummary(axisBinding = null) {
  if (!el.bindingEditorAxisSummary) return;
  el.bindingEditorAxisSummary.innerHTML = "";
  const binding = axisBinding ?? (state.bindingEditorOpen && state.selectedControlId
    ? getAxisBindingForEditing(getEditableActivators(state.selectedControlId)[state.selectedActivatorIndex])
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
  return describeControl(getControlActivators(controlId), getControlMode(controlId), { presetNames: getPresetNames() });
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
  const meta = state.loadedLayoutMeta;
  if (!meta) {
    el.currentCommunitySummary.textContent = state.layoutTitle || "No layout loaded yet.";
    el.copyLayoutLinkBtn.hidden = true;
    return;
  }
  el.currentCommunitySummary.textContent = [meta.title || state.layoutTitle, meta.controller_type_nice || (meta.file_id ? "Community layout" : "")]
    .filter(Boolean)
    .join(" • ");
  el.copyLayoutLinkBtn.hidden = !meta.file_id;
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
    row?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
  });
}

function showCommunityDialog() {
  state.communityDialogOpen = true;
  openDialog(el.communityDialogBackdrop, el.gameSearchInput);
}

function hideCommunityDialog() {
  if (!state.communityDialogOpen) return;
  state.communityDialogOpen = false;
  closeDialog(el.communityDialogBackdrop);
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
  const activators = getEditableActivators(state.selectedControlId);
  const active = activators[state.selectedActivatorIndex];
  if (!active) {
    el.bindingEditorStepInput.focus();
    return;
  }
  if (isAxisEditing(state.selectedControlId, active)) {
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
  dialogOpeners.set(el.bindingEditorBackdrop, document.activeElement);
  el.bindingEditorBackdrop.classList.remove("hidden");
  const activators = getEditableActivators(state.selectedControlId);
  if (!activators.length) {
    activators.push(createDefaultActivator());
  }
  state.selectedActivatorIndex = clamp(Math.floor(state.selectedActivatorIndex), 0, activators.length - 1);
  renderBindingEditor();
  focusKeyInputIfVisible();
}

function hideBindingEditor() {
  if (!state.bindingEditorOpen) return;
  state.bindingEditorOpen = false;
  el.bindingEditorBackdrop.classList.add("hidden");
  if (state.selectedControlId) {
    const activators = getEditableActivators(state.selectedControlId);
    for (const activator of activators) {
      activator.actions = normalizeActivatorActions(activator.actions);
    }
    const kept = activators.filter((activator) => !isPristineActivator(activator));
    activators.splice(0, activators.length, ...kept);
  }
  restoreFocus(el.bindingEditorBackdrop);
  refreshBindingViews();
}

function isPristineActivator(activator) {
  const pristine = createDefaultActivator();
  return !activatorHasAction(activator)
    && !axisBindingHasSlots(activator.axisBinding)
    && ["type", "chord", "toggle", "interruptable", "turbo", "cycleBinding", "doubleTapTime", "longPressTime",
      "fireStartDelay", "fireEndDelay", "repeatRate", "haptics", "notes"].every((key) => activator[key] === pristine[key]);
}

function refreshBindingViews() {
  renderBindings();
  updateSelectionInfo();
  renderBindingOverlays();
  renderLayoutOverview();
}

function renderBindingEditor() {
  if (!state.bindingEditorOpen || !state.selectedControlId) return;
  const control = getSelectedControl();
  const activators = getEditableActivators(state.selectedControlId);
  if (!activators.length) {
    activators.push(createDefaultActivator());
  }
  state.selectedActivatorIndex = clamp(Math.floor(state.selectedActivatorIndex), 0, activators.length - 1);
  el.bindingEditorActivatorList.innerHTML = "";
  activators.forEach((activator, index) => {
    const item = document.createElement("li");
    item.className = `editor-list-item${index === state.selectedActivatorIndex ? " active" : ""}`;
    const title = ACTIVATOR_TYPES.find((entry) => entry.value === activator.type)?.label ?? "Full Press";
    const binding = activator.actions.some((step) => step.output) ? describeActivator(activator, { presetNames: getPresetNames() }) : "Unmapped";
    item.innerHTML = `<strong>${escapeHtml(title)}</strong><span>${escapeHtml(binding)}</span>`;
    item.addEventListener("click", () => {
      state.selectedActivatorIndex = index;
      renderBindingEditor();
    });
    el.bindingEditorActivatorList.appendChild(item);
  });

  const active = activators[state.selectedActivatorIndex];
  const axisControl = isAxisEditing(state.selectedControlId, active);
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
        <button type="button" data-action="up" data-index="${index}" aria-label="Move step up" ${index === 0 ? "disabled" : ""}>↑</button>
        <button type="button" data-action="down" data-index="${index}" aria-label="Move step down" ${index === actions.length - 1 ? "disabled" : ""}>↓</button>
        <button type="button" data-action="remove" data-index="${index}" aria-label="Remove step">✕</button>
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
  const activators = getEditableActivators(state.selectedControlId);
  const active = activators[state.selectedActivatorIndex];
  if (!active) return;
  if (state.draftStepIndex != null && state.draftStepIndex >= 0 && state.draftStepIndex < active.actions.length && !active.actions[state.draftStepIndex]?.output) {
    requestAnimationFrame(() => el.bindingEditorStepInput.focus());
    return;
  }
  active.actions.push({ output: "", delayMs: 0, dsl: null });
  state.draftStepIndex = active.actions.length - 1;
  resetDraftStepInput();
  renderActionStepList(active.actions);
  requestAnimationFrame(() => el.bindingEditorStepInput.focus());
}

function mutateActionStep(action, index) {
  if (!state.bindingEditorOpen || !state.selectedControlId) return;
  const activators = getEditableActivators(state.selectedControlId);
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
  renderBindingEditor();
  renderBindings();
  updateSelectionInfo();
  renderBindingOverlays();
}

function updateActionStepDelay(index, delayMs) {
  if (!state.bindingEditorOpen || !state.selectedControlId) return;
  const activators = getEditableActivators(state.selectedControlId);
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
  const activators = getEditableActivators(state.selectedControlId);
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
  const activators = getEditableActivators(state.selectedControlId);
  const active = activators[state.selectedActivatorIndex];
  if (!active) return;
  if (isAxisEditing(state.selectedControlId, active)) {
    const axisBinding = getAxisBindingForEditing(active);
    if (!axisBinding) return;
    setAxisSlotValue(axisBinding, state.bindingEditorAxisSlot, composed);
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
  const activators = getEditableActivators(state.selectedControlId);
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
  const activators = getEditableActivators(state.selectedControlId);
  const active = activators[state.selectedActivatorIndex];
  if (!active) return;
  const axisBinding = getAxisBindingForEditing(active);
  if (!axisBinding) return;
  axisBinding.mode = el.bindingEditorAxisMode.value;
  axisBinding.sensitivity = clampNumber(el.bindingEditorAxisSensitivity.value, 0.1, 3, axisBinding.sensitivity);
  axisBinding.deadzone = clampNumber(el.bindingEditorAxisDeadzone.value, 0, 1, axisBinding.deadzone);
  syncAxisPresetButtons(axisBinding);
  renderAxisBindingSummary(axisBinding);
  renderBindings();
  updateSelectionInfo();
  renderBindingOverlays();
}

function applyAxisPreset(preset) {
  if (!state.bindingEditorOpen || !state.selectedControlId) return;
  const activators = getEditableActivators(state.selectedControlId);
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
  syncAxisBindingEditor();
  syncAxisPresetButtons(axisBinding);
  renderAxisBindingSummary(axisBinding);
  renderBindings();
  updateSelectionInfo();
  renderBindingOverlays();
}

function addActivatorForSelectedControl() {
  if (!state.selectedControlId) return;
  const activators = getEditableActivators(state.selectedControlId);
  const next = createDefaultActivator();
  activators.push(next);
  state.selectedActivatorIndex = activators.length - 1;
  renderBindingEditor();
  renderBindings();
  updateSelectionInfo();
  renderBindingOverlays();
}

function removeSelectedActivator() {
  if (!state.selectedControlId) return;
  const activators = getEditableActivators(state.selectedControlId);
  if (!activators.length) return;
  activators.splice(state.selectedActivatorIndex, 1);
  if (!activators.length) activators.push(createDefaultActivator());
  state.selectedActivatorIndex = clamp(state.selectedActivatorIndex, 0, activators.length - 1);
  renderBindingEditor();
  renderBindings();
  updateSelectionInfo();
  renderBindingOverlays();
}

function updateSelectedActivatorFromEditor() {
  if (!state.bindingEditorOpen || !state.selectedControlId) return;
  const activators = getEditableActivators(state.selectedControlId);
  const active = activators[state.selectedActivatorIndex];
  if (!active) return;
  if (isAxisEditing(state.selectedControlId, active)) {
    const axisBinding = getAxisBindingForEditing(active);
    if (!axisBinding) return;
    axisBinding.mode = el.bindingEditorAxisMode.value;
    axisBinding.sensitivity = clampNumber(el.bindingEditorAxisSensitivity.value, 0.1, 3, axisBinding.sensitivity);
    axisBinding.deadzone = clampNumber(el.bindingEditorAxisDeadzone.value, 0, 1, axisBinding.deadzone);
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
  active.doubleTapTime = Math.round(clampNumber(el.bindingEditorDoubleTap.value, 0, 10000, active.doubleTapTime));
  active.longPressTime = Math.round(clampNumber(el.bindingEditorLongPress.value, 0, 10000, active.longPressTime));
  active.fireStartDelay = Math.round(clampNumber(el.bindingEditorStartDelay.value, 0, 10000, active.fireStartDelay));
  active.fireEndDelay = Math.round(clampNumber(el.bindingEditorEndDelay.value, 0, 10000, active.fireEndDelay));
  active.repeatRate = Math.round(clampNumber(el.bindingEditorRepeatRate.value, 0, 10000, active.repeatRate));
  active.haptics = el.bindingEditorHaptics.value;
  active.notes = el.bindingEditorNotes.value.trim();
  active.actions = normalizeActivatorActions(active.actions);
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
  const activators = getEditableActivators(state.selectedControlId);
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

  const isLatest = beginRequest("game-search");
  setLayoutStatus(`Searching Steam for "${query}"...`);
  try {
    const response = await fetch(apiUrl("store-search", { q: query }));
    if (!response.ok) throw new Error("Game search failed");
    const items = mapStoreSearchItems(await response.json());
    if (!isLatest()) return;
    state.gameResults = items;
    renderGameResults();
    setLayoutStatus(state.gameResults.length ? `Found ${state.gameResults.length} game result(s).` : "No games found.");
  } catch {
    if (isLatest()) setLayoutStatus("Game search failed. The layout proxy is unreachable.", true);
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
  const game = state.selectedGame;
  if (!game?.id) {
    setLayoutStatus("Select a game first.");
    return;
  }

  const params = {
    appid: String(game.id),
    sort: el.layoutSortSelect.value,
    controller_type: "controller_neptune"
  };
  const searchText = ignoreLayoutSearch ? "" : el.layoutSearchInput.value.trim();
  if (searchText && searchText !== "*") params.searchtext = searchText;

  const isLatest = beginRequest("community-layouts");
  setLayoutStatus(`Loading community layouts for ${game.name}...`);
  try {
    const layouts = await fetchCommunityLayoutList(params);
    if (!isLatest()) return;
    state.communityLayouts = layouts.map((layout) => ({ ...layout, app_id: game.id }));
    renderCommunityLayouts();
    setLayoutStatus(
      state.communityLayouts.length
        ? `Loaded ${state.communityLayouts.length} layout(s) for ${game.name}.`
        : `No layouts found for ${game.name}.`
    );
  } catch {
    if (isLatest()) setLayoutStatus("Community layout loading failed. The layout proxy is unreachable.", true);
  }
}

/**
 * Steam's own listing first; SteamInputDB only when the proxy has no Steam
 * Web API key (503).
 */
async function fetchCommunityLayoutList(params) {
  const response = await fetch(apiUrl("layouts", params));
  if (response.ok) return mapQueryFilesLayouts(await response.json());
  if (response.status !== 503) throw new Error("Layout search failed");
  const fallback = await fetch(apiUrl("community-layouts", params));
  if (!fallback.ok) throw new Error("Layout search failed");
  return extractSteamInputDbLayouts(await fallback.text());
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
    el.dialogCompareLayoutBtn.disabled = true;
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
    span.textContent = String(tag).replaceAll("_", " ");
    el.layoutDetailTags.appendChild(span);
  });
  el.dialogLoadLayoutBtn.disabled = !layout.file_url;
  el.dialogCompareLayoutBtn.disabled = !layout.file_url;
}

async function loadCommunityLayout(layoutMeta) {
  const target = layoutMeta ?? state.selectedLayoutDetail;
  if (!target?.file_url) {
    setLayoutStatus("That layout does not expose a downloadable VDF.", true);
    return;
  }

  const isLatest = beginRequest("layout-load");
  setLayoutStatus(`Loading ${target.title}...`);
  try {
    const vdf = await fetchCommunityLayoutVdf(target);
    if (!isLatest()) return;
    applyVdfLayout(vdf, target);
    state.selectedLayoutDetail = target;
    renderCommunityLayouts();
    hideCommunityDialog();
  } catch {
    if (isLatest()) setLayoutStatus(`Failed to parse ${target?.title ?? "selected layout"}.`, true);
  }
}

/** Replaces the current layout with a Steam Input VDF. */
function applyVdfLayout(vdfText, meta = null) {
  const doc = readControllerConfig(parseVdf(vdfText), controls.map((control) => control.id));
  if (!doc.presets.length) throw new Error("No action sets in layout");
  state.layoutGeneration += 1;
  state.presets = doc.presets;
  state.activePresetIndex = 0;
  state.layoutTitle = meta?.title || doc.title;
  state.layoutDescription = meta?.description || doc.description;
  state.loadedLayoutMeta = meta ?? { title: doc.title || "VDF layout", description: doc.description };
  replaceLayoutUrlParam(meta?.file_id ?? null);
  renderPresetSelect();
  refreshBindingViews();
  updateCommunitySummary();

  const mappedControlCount = controls.filter((control) => getControlActivators(control.id).some(activatorHasAction)).length;
  const sets = doc.presets.filter((preset) => preset.kind === "set").length;
  const layers = doc.presets.length - sets;
  const structure = `${sets} action set${sets === 1 ? "" : "s"}${layers ? `, ${layers} layer${layers === 1 ? "" : "s"}` : ""}`;
  const summary = meta ? summarizeLoadedLayout(meta) : "";
  setLayoutStatus(
    `Loaded ${state.loadedLayoutMeta.title}. ${structure} • ${mappedControlCount}/${controls.length} controls mapped${summary ? ` • ${summary}` : ""}`,
    mappedControlCount === 0
  );
}

async function downloadCommunityLayout(layoutMeta) {
  const target = layoutMeta ?? state.selectedLayoutDetail;
  if (!target?.file_url) {
    setLayoutStatus("That layout does not expose a downloadable VDF.", true);
    return;
  }

  setLayoutStatus(`Downloading ${target.title || `Layout ${target.file_id}`}...`);
  try {
    const vdf = await fetchCommunityLayoutVdf(target);
    const filename = getCommunityLayoutFileName(target);
    downloadBlob(new Blob([vdf], { type: "text/plain;charset=utf-8" }), filename);
    setLayoutStatus(`Downloaded ${filename}.`, false);
  } catch {
    setLayoutStatus(`Failed to download ${target?.title ?? "selected layout"}.`, true);
  }
}

function downloadBlob(blob, filename) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  // Revoking synchronously can cancel the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(a.href), 30_000);
}

function getCommunityLayoutFileName(layoutMeta) {
  const appSegment = layoutMeta?.app_id ? `app${layoutMeta.app_id}` : "app";
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
  for (const target of [el.layoutStatus, el.appStatus]) {
    target.textContent = message;
    target.classList.toggle("error", isError);
  }
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
  return activatorHasAction(activator);
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
  for (const activator of getControlActivators(controlId)) {
    const raw = activatorHasConfiguredAxisBinding(activator)
      ? formatAxisBindingSummary(activator.axisBinding)
      : activator.actions.find((step) => step.output)?.output;
    if (!raw) continue;
    return { key: raw.toLowerCase(), label: raw };
  }
  return null;
}

function applyDebugBindings() {
  const preset = getActivePreset();
  controls.forEach((control, index) => {
    const key = DEBUG_KEY_SEQUENCE[index] ?? `F${13 + (index - DEBUG_KEY_SEQUENCE.length)}`;
    preset.bindings[control.id] = [createDefaultActivator(key)];
  });
  refreshBindingViews();
  setLayoutStatus("Debug bindings applied to all controls.", false);
}

function buildLayoutPayload() {
  return {
    version: 2,
    name: state.layoutTitle || DEFAULT_EXPORT_NAME,
    description: state.layoutDescription,
    savedAt: new Date().toISOString(),
    presets: state.presets,
    activePresetIndex: state.activePresetIndex,
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
        selectedActivatorIndex: state.selectedActivatorIndex
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
  const suggestedName = `${sanitizeFilenameSegment(state.layoutTitle) || "steamdeck-layout"}.json`;
  if ("showSaveFilePicker" in window) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName,
        types: [{ description: "JSON Files", accept: { "application/json": [".json"] } }]
      });
      const writable = await handle.createWritable();
      await writable.write(text);
      await writable.close();
      setLayoutStatus(`Layout saved via File System Access.${savedMessageSuffix}`, false);
    } catch (error) {
      if (error.name !== "AbortError") setLayoutStatus("Saving layout failed.", true);
    }
  } else {
    downloadBlob(new Blob([text], { type: "application/json" }), suggestedName);
    setLayoutStatus(`Layout downloaded locally.${savedMessageSuffix}`, false);
  }
}










function exportCurrentLayoutVdf() {
  const config = buildControllerConfig({
    title: state.layoutTitle || DEFAULT_EXPORT_NAME,
    description: state.layoutDescription,
    presets: state.presets.map(expandAxisBindingsForExport)
  });
  const filename = `${sanitizeFilenameSegment(state.layoutTitle) || "steamdeck-layout"}.vdf`;
  downloadBlob(new Blob([serializeVdf(config)], { type: "text/plain;charset=utf-8" }), filename);
  setLayoutStatus(`Exported current layout as ${filename}.`, false);
}

const AXIS_SLOT_INPUTS = { click: "click", up: "dpad_north", down: "dpad_south", left: "dpad_west", right: "dpad_east" };

/**
 * The editor's stick/pad slots become Steam sub-inputs: directions use the
 * directional pad mode, otherwise the control acts as a mouse.
 */
function expandAxisBindingsForExport(preset) {
  const bindings = {};
  const modes = { ...preset.modes };
  for (const [controlId, activators] of Object.entries(preset.bindings)) {
    const control = getControlById(controlId);
    const expanded = [];
    for (const activator of activators) {
      if (activator.input || !axisBindingHasSlots(activator.axisBinding) || (control?.kind !== "stick" && control?.kind !== "pad")) {
        expanded.push(activator);
        continue;
      }
      const axis = activator.axisBinding;
      for (const [slot, input] of Object.entries(AXIS_SLOT_INPUTS)) {
        if (axis[slot]) expanded.push({ ...createDefaultActivator(axis[slot]), input });
      }
      const hasDirections = ["up", "down", "left", "right"].some((slot) => axis[slot]);
      if (!modes[controlId]) {
        const mouseMode = control.kind === "stick" ? "joystick_mouse" : "absolute_mouse";
        modes[controlId] = { mode: hasDirections && axis.mode !== "mouse_move" ? "dpad" : mouseMode, settings: {} };
      }
    }
    bindings[controlId] = expanded;
  }
  return { ...preset, bindings, modes };
}

async function loadLayoutFromStorage() {
  if ("showOpenFilePicker" in window) {
    try {
      const [handle] = await window.showOpenFilePicker({
        types: [{ description: "Layouts", accept: { "application/json": [".json"], "text/plain": [".vdf"] } }],
        multiple: false
      });
      if (!handle) return;
      const file = await handle.getFile();
      await handleLayoutFile(file);
    } catch (error) {
      if (error.name !== "AbortError") setLayoutStatus("Loading layout failed.", true);
    }
    return;
  }
  el.fileInput.click();
}

/** Loads a layout JSON or Steam Input VDF; returns whether it was applied. */
function handleLayoutText(text, sourceLabel = "file") {
  const trimmed = text.trimStart();
  try {
    if (trimmed.startsWith("{")) {
      applyLayoutData(JSON.parse(text), true);
      state.layoutGeneration += 1;
      replaceLayoutUrlParam(state.loadedLayoutMeta?.file_id ?? null);
      refreshBindingViews();
      setLayoutStatus(`Layout loaded from ${sourceLabel}.`, false);
    } else {
      applyVdfLayout(text, null);
    }
    return true;
  } catch {
    setLayoutStatus(`Could not read the layout ${sourceLabel}: expected layout JSON or a Steam Input VDF.`, true);
    return false;
  }
}

async function handleLayoutFile(file, sourceLabel = "file") {
  let text;
  try {
    text = await file.text();
  } catch {
    setLayoutStatus(`Could not read ${file.name}.`, true);
    return false;
  }
  return handleLayoutText(text, sourceLabel);
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

  let pointerDownAt = null;
  renderer.domElement.addEventListener("pointerdown", (event) => {
    pointerDownAt = { x: event.clientX, y: event.clientY };
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
      updateControlFromPaintedRegion(state.selectedControlId);
      schedulePersistCurrentLayoutState();
    }
  });

  renderer.domElement.addEventListener("click", (event) => {
    if (state.paintMode) return;
    // Releasing after rotating the deck is not a selection.
    if (pointerDownAt && Math.hypot(event.clientX - pointerDownAt.x, event.clientY - pointerDownAt.y) > 4) return;
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

  const resize = () => {
    const width = el.deckContainer.clientWidth;
    const height = el.deckContainer.clientHeight;
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    overlayDirty = true;
  };
  new ResizeObserver(resize).observe(el.deckContainer);
  orbitControls.addEventListener("change", () => {
    overlayDirty = true;
  });

  const animate = () => {
    if (selectionAnimation) {
      updateSelectionAnimation();
      overlayDirty = true;
    }
    orbitControls.update();
    if (overlayDirty) {
      overlayDirty = false;
      renderBindingOverlays();
    }
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
      modelStatusMessage = "Steam Deck shell model loaded.";
      setDeckStatus(modelStatusMessage);
    },
    undefined,
    () => {
      deckRoot.add(createFallbackDeckBody());
      updateDeckVisualTheme();
      modelStatusMessage = "Steam Deck shell model failed to load. Showing fallback body.";
      setDeckStatus(modelStatusMessage, true);
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
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
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
  if (!state.paintMode) {
    setDeckStatus(modelStatusMessage, !shellMesh);
  } else if (!shellMesh) {
    setDeckStatus("Painting needs the shell model, which is not loaded.", true);
  } else {
    setDeckStatus(state.selectedControlId
      ? "Paint mode active. Click the shell to assign a region to the selected control."
      : "Paint mode active. Select a control in the bindings list first.");
  }
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
    schedulePersistCurrentLayoutState();
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

const shellColorCache = new Map();

function getCachedColor(hex) {
  let color = shellColorCache.get(hex);
  if (!color) {
    color = new THREE.Color(hex);
    shellColorCache.set(hex, color);
  }
  return color;
}

function recolorShellRegions() {
  if (!shellGeometry) return;
  const colorAttr = shellGeometry.getAttribute("color");
  const colors = colorAttr.array;
  const lightTheme = isLightTheme();
  const baseColor = getCachedColor(lightTheme ? 0x7f8ba3 : 0x2f3747);
  const selectedColor = getCachedColor(lightTheme ? 0xc02424 : state.paintMode ? 0xff9999 : 0xff7373);
  const previewColor = getCachedColor(lightTheme ? 0xff7d4a : 0xffa366);
  const ownerColors = new Map(controls.map((control) => [control.id, getCachedColor(getControlColor(control.kind))]));

  for (let faceIndex = 0; faceIndex < shellFaceOwners.length; faceIndex += 1) {
    const owner = shellFaceOwners[faceIndex];
    const color = shellPreviewFaces.has(faceIndex)
      ? previewColor
      : owner && owner === state.selectedControlId
        ? selectedColor
        : owner
          ? ownerColors.get(owner) ?? baseColor
          : baseColor;
    const offset = faceIndex * 9;
    for (let vertex = 0; vertex < 9; vertex += 3) {
      colors[offset + vertex] = color.r;
      colors[offset + vertex + 1] = color.g;
      colors[offset + vertex + 2] = color.b;
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
  overlayDirty = true;
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
  // Until the model has loaded, the regions only exist as pending data.
  if (!shellFaceOwners.length) return pendingPaintRegions ?? {};
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
  updateSelectionInfo();
  schedulePersistCurrentLayoutState();
}

function getControlById(controlId) {
  return controls.find((control) => control.id === controlId);
}
