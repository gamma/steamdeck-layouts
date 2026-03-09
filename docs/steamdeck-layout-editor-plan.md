# Steam Deck Layout Studio — Project Plan

## 1) Product vision
Build a **modern, visual-first layout editor** for Steam Deck control schemes where users can:
- Design mappings quickly with drag-and-drop and contextual editing.
- See every mapping on a **real-time 3D Steam Deck model**.
- Manage mappings in **structured list views** for precision editing.
- Load, save, version, import, and export layouts with confidence.

Design goal: “striking and intuitive” means high visual clarity, immediate feedback, smooth interactions, and low cognitive load.

---

## 2) Core user experience goals
1. **Immediate understanding**: Users should understand where they are and what is selected within 5 seconds.
2. **Fast editing loop**: Any mapping change should take <3 clicks and appear instantly in 3D + list views.
3. **No hidden state**: Active profile/layer/modifier should always be visible.
4. **Safe iteration**: Undo/redo, autosave drafts, and validation warnings before export.
5. **Accessibility-first**: Keyboard navigation, high contrast mode, scalable UI, and motion-reduced mode.

---

## 3) Functional requirements

### A. Layout lifecycle (load/save)
- Create new layout from templates (FPS, Racing, Desktop, Accessibility).
- Save layout locally (JSON project format).
- Save-as and duplicate layouts.
- Load existing layouts from local files.
- Import/export Steam-compatible profile formats (where feasible).
- Autosave working draft and recovery after crash/tab close.
- Revision history: timestamped snapshots with restore.

### B. Visual editor (primary)
- Steam Deck silhouette + 3D model in center canvas.
- Click a control (button, trigger, joystick, touchpad, gyro) to edit mapping.
- Visual connection lines from control -> assigned action (optional split panel).
- Color coding for action types (movement, combat, menu, system, macro).
- Drag-and-drop action assignment onto controls.
- Multi-layer mapping (default/shift layer/action set) with clear toggles.

### C. Structured list editor (secondary)
- Filterable table/list of all controls and mapped actions.
- Inline edit for action, mode, sensitivity, deadzone, haptics.
- Bulk edit (apply to selected controls).
- Search by action name/control name.
- Sort by unmapped, conflicts, recently modified.

### D. 3D render and interaction
- Real-time 3D Steam Deck model with clickable hit zones.
- Highlight selected control in model + synchronized row highlight in list.
- Orbit/pan/zoom camera presets (front/back/left/right).
- Contextual tooltips over controls.
- Optional “live preview” mode to animate trigger pull/joystick tilt values.

### E. Validation and quality safeguards
- Conflict detection (duplicate critical bindings, missing required actions).
- Sensitivity/deadzone range validation.
- Warning badges and guided fix suggestions.
- Export readiness checklist.

---

## 4) Non-functional requirements
- **Performance**: 60 FPS target in 3D view on mid-range desktop; interaction latency <100ms.
- **Reliability**: No data loss under normal editing; autosave every 10–20 seconds.
- **Portability**: Web app (desktop-first), optional Electron wrapper later.
- **Extensibility**: Plugin-like action schema for game-specific templates.
- **Observability**: Client-side error logging and usage telemetry (opt-in).

---

## 5) Information architecture

### Primary screens
1. **Home / Project Hub**
   - Recent layouts
   - New from template
   - Import layout
2. **Editor Workspace**
   - Left: action library + layer/profile panel
   - Center: 3D model + overlay controls
   - Right: properties inspector + conflicts panel
   - Bottom/side: tab for list/table editor
3. **History / Versions**
   - Snapshot timeline, compare, restore
4. **Settings**
   - Theme, accessibility, export preferences, keybindings

### Workspace modes
- **Visual mode** (default): 3D-first mapping.
- **List mode**: spreadsheet-like precision editing.
- **Conflict mode**: focus only on problematic bindings.

---

## 6) Technical architecture proposal

### Frontend stack
- **Framework**: React + TypeScript.
- **State management**: Zustand or Redux Toolkit (normalized layout graph).
- **3D engine**: Three.js with React Three Fiber.
- **UI system**: Tailwind + component primitives (Radix or shadcn-style).
- **Data validation**: Zod schemas for layout format.

### Data model (high-level)
- `LayoutProject`
  - `metadata` (name, game, tags, createdAt, updatedAt)
  - `profiles[]` (e.g., default, driving, menu)
  - `layers[]` per profile
  - `bindings[]` (controlId -> actionId + params)
  - `advanced` (haptics, gyro config, deadzones, curves)
  - `history[]` (diff snapshots)

### Persistence
- Phase 1: local file system import/export + browser storage drafts.
- Phase 2: optional cloud sync via API.
- Phase 3: collaboration (share links, comment threads).

### Suggested folder structure
- `apps/editor-web` — main app
- `packages/layout-schema` — shared schema/parser/validators
- `packages/3d-assets` — model metadata + control hit zones
- `packages/ui` — reusable components

---

## 7) 3D model and control mapping pipeline
1. Acquire/create Steam Deck 3D model (legal/compliant asset source).
2. Define control hit zones (`controlId`, mesh name, bounding volumes).
3. Build interaction layer:
   - raycasting to detect clicked control
   - hover/select states
   - synchronized highlight events
4. Add semantic overlays:
   - labels
   - conflict indicators
   - connection lines to action inspector
5. Optimize rendering:
   - LOD strategy
   - baked textures
   - post-processing kept minimal for clarity

---

## 8) Visual design direction (striking + intuitive)
- **Theme**: dark-first, high contrast neon accents for active bindings.
- **Typography**: clear hierarchy, dense-but-readable data panels.
- **Motion**: subtle transitions (<200ms), no disorienting camera movement.
- **Color semantics**:
  - Blue: navigation/movement
  - Red: combat/action
  - Yellow: utility/system
  - Purple: macro/advanced
- **Progressive disclosure**: basic options first, advanced tuning collapsible.

---

## 9) Delivery roadmap

### Phase 0 — Discovery (1–2 weeks)
- Validate target users (power users vs casual remappers).
- Confirm required import/export formats.
- Produce UX flows + wireframes + interaction prototype.

### Phase 1 — MVP editor (4–6 weeks)
- Project create/load/save.
- Core 3D model rendering + selectable controls.
- Basic binding editor (visual + list sync).
- JSON schema + validation + export.

### Phase 2 — Advanced editing (3–5 weeks)
- Multi-layer/action-set support.
- Conflict detection + resolution assistant.
- Bulk edit tools and richer property inspector.
- Undo/redo and history snapshots.

### Phase 3 — Polish + production readiness (3–4 weeks)
- Performance tuning and memory optimization.
- Accessibility pass + keyboard-first workflows.
- Error tracking, telemetry, docs, onboarding.
- Beta release with feedback loop.

### Phase 4 — Expansion (optional)
- Cloud sync and account system.
- Community template sharing.
- Plugin API for game-specific presets.

---

## 10) Risks and mitigations
- **3D complexity risk**: start with simplified interaction meshes and add fidelity later.
- **Format compatibility risk**: isolate import/export adapters behind stable schema.
- **UI overload risk**: enforce progressive disclosure and user-test early.
- **Performance risk**: benchmark early with realistic layout sizes and lower-end GPUs.

---

## 11) Success metrics
- Time to first working layout: <10 minutes for new users.
- Task completion rate for key flows (create/edit/export): >90% in usability tests.
- Export error rate: <2% after validation prompts.
- User satisfaction (post-session): >=4/5 on ease of use and visual clarity.

---

## 12) Immediate next actions (execution checklist)
1. Finalize product requirements doc from this plan.
2. Build clickable UX prototype (Figma or web prototype).
3. Implement layout schema package and sample templates.
4. Stand up React + R3F editor shell with dummy controls.
5. Add bidirectional sync between 3D selection and list row selection.
6. Ship MVP with local save/load and validation warnings.
