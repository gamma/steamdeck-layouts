import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js";

const controls = [
  { id: "a", name: "A Button", pos: [1.2, 0.35, 0.75], color: 0x6be1ff },
  { id: "b", name: "B Button", pos: [1.55, 0.5, 0.68], color: 0xff6f8f },
  { id: "x", name: "X Button", pos: [1.03, 0.66, 0.7], color: 0xaf7bff },
  { id: "y", name: "Y Button", pos: [1.37, 0.82, 0.66], color: 0xffc857 },
  { id: "l_trigger", name: "L Trigger", pos: [-1.7, 0.9, -0.2], color: 0x62d8ff },
  { id: "r_trigger", name: "R Trigger", pos: [1.7, 0.9, -0.2], color: 0x62d8ff },
  { id: "left_stick", name: "Left Stick", pos: [-1.2, -0.05, 0.74], color: 0x8ff3a3 },
  { id: "right_stick", name: "Right Stick", pos: [1.0, -0.15, 0.72], color: 0x8ff3a3 },
  { id: "left_pad", name: "Left Touchpad", pos: [-1.35, 0.5, 0.72], color: 0xffa25e },
  { id: "right_pad", name: "Right Touchpad", pos: [1.35, 0.2, 0.72], color: 0xffa25e },
];

const actions = [
  "Move", "Jump", "Interact", "Reload", "Inventory", "Sprint", "Map", "Melee", "Quick Save", "Open Menu"
];

const state = {
  selectedControlId: null,
  selectedAction: actions[0],
  bindings: Object.fromEntries(controls.map((c) => [c.id, "Unmapped"]))
};

const el = {
  actionLibrary: document.getElementById("actionLibrary"),
  bindingsTable: document.getElementById("bindingsTable"),
  selectionInfo: document.getElementById("selectionInfo"),
  newLayoutBtn: document.getElementById("newLayoutBtn"),
  saveLayoutBtn: document.getElementById("saveLayoutBtn"),
  loadLayoutBtn: document.getElementById("loadLayoutBtn"),
  fileInput: document.getElementById("fileInput"),
  rowTemplate: document.getElementById("bindingRowTemplate"),
  deckContainer: document.getElementById("deckContainer")
};

const controlMeshes = new Map();
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

initUI();
initScene();
renderBindings();

function initUI() {
  actions.forEach((action, idx) => {
    const li = document.createElement("li");
    li.textContent = action;
    if (idx === 0) li.classList.add("active");
    li.addEventListener("click", () => {
      state.selectedAction = action;
      [...el.actionLibrary.children].forEach((n) => n.classList.remove("active"));
      li.classList.add("active");
      applyActionToSelected();
    });
    el.actionLibrary.appendChild(li);
  });

  el.newLayoutBtn.addEventListener("click", () => {
    state.bindings = Object.fromEntries(controls.map((c) => [c.id, "Unmapped"]));
    state.selectedControlId = null;
    renderBindings();
    updateSelectionInfo();
    updateMeshHighlights();
  });

  el.saveLayoutBtn.addEventListener("click", () => {
    const payload = {
      version: 1,
      name: "My Steam Deck Layout",
      savedAt: new Date().toISOString(),
      bindings: state.bindings,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "steamdeck-layout.json";
    a.click();
    URL.revokeObjectURL(a.href);
  });

  el.loadLayoutBtn.addEventListener("click", () => el.fileInput.click());
  el.fileInput.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      const json = JSON.parse(text);
      if (!json.bindings || typeof json.bindings !== "object") throw new Error("Invalid layout file");
      for (const c of controls) {
        state.bindings[c.id] = json.bindings[c.id] ?? "Unmapped";
      }
      renderBindings();
      updateSelectionInfo();
    } catch {
      alert("Invalid layout JSON file.");
    }
  });
}

function renderBindings() {
  el.bindingsTable.innerHTML = "";
  controls.forEach((control) => {
    const fragment = el.rowTemplate.content.cloneNode(true);
    const tr = fragment.querySelector("tr");
    const nameCell = fragment.querySelector(".control-name");
    const select = fragment.querySelector(".action-select");

    nameCell.textContent = control.name;
    ["Unmapped", ...actions].forEach((a) => {
      const opt = document.createElement("option");
      opt.value = a;
      opt.textContent = a;
      select.appendChild(opt);
    });
    select.value = state.bindings[control.id];

    tr.addEventListener("click", () => {
      state.selectedControlId = control.id;
      updateSelectionInfo();
      updateMeshHighlights();
      renderBindings();
    });

    select.addEventListener("change", () => {
      state.bindings[control.id] = select.value;
      updateSelectionInfo();
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
  el.selectionInfo.textContent = `${control.name} → ${state.bindings[control.id]}`;
}

function applyActionToSelected() {
  if (!state.selectedControlId) return;
  state.bindings[state.selectedControlId] = state.selectedAction;
  renderBindings();
  updateSelectionInfo();
}

function initScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x070c18);

  const camera = new THREE.PerspectiveCamera(50, el.deckContainer.clientWidth / el.deckContainer.clientHeight, 0.1, 100);
  camera.position.set(0, 1.2, 5.4);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(el.deckContainer.clientWidth, el.deckContainer.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  el.deckContainer.appendChild(renderer.domElement);

  const controls3D = new OrbitControls(camera, renderer.domElement);
  controls3D.enableDamping = true;

  scene.add(new THREE.AmbientLight(0xffffff, 1.2));
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
  keyLight.position.set(4, 6, 5);
  scene.add(keyLight);

  const deckBody = new THREE.Mesh(
    new THREE.BoxGeometry(4.3, 1.8, 1.25),
    new THREE.MeshStandardMaterial({ color: 0x202a3f, metalness: 0.25, roughness: 0.7 })
  );
  scene.add(deckBody);

  controls.forEach((control) => {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(control.id.includes("stick") ? 0.14 : 0.1, 20, 20),
      new THREE.MeshStandardMaterial({ color: control.color, emissive: 0x000000 })
    );
    mesh.position.set(...control.pos);
    mesh.userData.controlId = control.id;
    scene.add(mesh);
    controlMeshes.set(control.id, mesh);
  });

  renderer.domElement.addEventListener("click", (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects([...controlMeshes.values()]);
    if (!intersects.length) return;

    state.selectedControlId = intersects[0].object.userData.controlId;
    updateSelectionInfo();
    updateMeshHighlights();
    renderBindings();
  });

  window.addEventListener("resize", () => {
    camera.aspect = el.deckContainer.clientWidth / el.deckContainer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(el.deckContainer.clientWidth, el.deckContainer.clientHeight);
  });

  const animate = () => {
    controls3D.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };
  animate();
}

function updateMeshHighlights() {
  for (const [id, mesh] of controlMeshes.entries()) {
    const isSelected = id === state.selectedControlId;
    mesh.material.emissive.setHex(isSelected ? 0x3355ff : 0x000000);
    mesh.scale.setScalar(isSelected ? 1.3 : 1);
  }
}
