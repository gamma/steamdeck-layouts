import { ButtonItem, DropdownItem, Field, PanelSection, PanelSectionRow, Router, ToggleField, staticClasses } from "@decky/ui";
import { callable, definePlugin } from "@decky/api";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FaGamepad } from "react-icons/fa";

import { parseVdf } from "../../core/vdf.js";
import { readControllerConfig, getEffectiveBindings } from "../../core/steam-input.js";
import type { LayoutDocument, Preset } from "../../core/steam-input.js";
import { describeControl, describeLayoutOverview } from "../../core/layout-summary.js";
import { CHEAT_SHEET_SECTIONS, DECK_CONTROLS, getDeckControl } from "../../core/deck-controls.js";

const LAYOUT_STUDIO_URL = "https://gamma.github.io/steamdeck-layouts/";

type FindLayoutResult = {
  found: boolean;
  source?: "workshop" | "template" | "personal";
  title?: string;
  text?: string;
  fileId?: string;
  notes: string[];
};

const findLayout = callable<[appid: number, gameName: string], FindLayoutResult>("find_layout");

const SOURCE_LABELS: Record<string, string> = {
  workshop: "Community layout",
  template: "Steam template",
  personal: "Your saved configuration"
};

type LoadState =
  | { status: "idle" | "loading" }
  | { status: "no-game" }
  | { status: "missing"; notes: string[] }
  | { status: "error"; message: string; notes: string[] }
  | { status: "ready"; doc: LayoutDocument; result: FindLayoutResult };

function getRunningGame() {
  const app = Router.MainRunningApp;
  if (!app) return null;
  return { appid: Number(app.appid), name: app.display_name ?? "" };
}

/** A layer's view includes the controls and modes it inherits from its set. */
function getPresetView(presets: Preset[], preset: Preset) {
  const parent = preset.kind === "layer" ? presets.find((candidate) => candidate.name === preset.parentName) : undefined;
  return {
    ...preset,
    bindings: getEffectiveBindings(presets, preset),
    modes: { ...(parent?.modes ?? {}), ...preset.modes },
    gyro: preset.gyro ?? parent?.gyro ?? null
  };
}

function Content() {
  const [state, setState] = useState<LoadState>({ status: "idle" });
  const [presetIndex, setPresetIndex] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const game = getRunningGame();

  const load = useCallback(async () => {
    const running = getRunningGame();
    if (!running) {
      setState({ status: "no-game" });
      return;
    }
    setState({ status: "loading" });
    try {
      const result = await findLayout(running.appid, running.name);
      if (!result.found || !result.text) {
        setState({ status: "missing", notes: result.notes ?? [] });
        return;
      }
      const doc = readControllerConfig(parseVdf(result.text), DECK_CONTROLS.map((control) => control.id));
      if (!doc.presets.length) {
        setState({ status: "error", message: "The layout has no action sets.", notes: result.notes });
        return;
      }
      setPresetIndex(0);
      setState({ status: "ready", doc, result });
    } catch (error) {
      setState({ status: "error", message: String(error), notes: [] });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load, game?.appid]);

  const notes = state.status === "missing" || state.status === "error" ? state.notes : state.status === "ready" ? state.result.notes : [];

  return (
    <>
      <PanelSection title={game?.name || "No game running"}>
        {state.status === "loading" && <PanelSectionRow><Field label="Looking up the layout…" /></PanelSectionRow>}
        {state.status === "no-game" && (
          <PanelSectionRow><Field label="Start a game to see its controller layout." /></PanelSectionRow>
        )}
        {state.status === "missing" && (
          <PanelSectionRow><Field label="No layout found" description="The game may use Steam's built-in default." /></PanelSectionRow>
        )}
        {state.status === "error" && <PanelSectionRow><Field label="Could not read the layout" description={state.message} /></PanelSectionRow>}
        {state.status === "ready" && (
          <LayoutHeader state={state} presetIndex={presetIndex} onPresetChange={setPresetIndex} />
        )}
        <PanelSectionRow>
          <ButtonItem layout="below" onClick={() => void load()}>Refresh</ButtonItem>
        </PanelSectionRow>
      </PanelSection>

      {state.status === "ready" && <CheatSheet doc={state.doc} presetIndex={presetIndex} />}

      <PanelSection title="Diagnostics">
        <PanelSectionRow>
          <ToggleField label="Show lookup details" checked={showNotes} onChange={setShowNotes} />
        </PanelSectionRow>
        {showNotes && notes.map((note, index) => (
          <PanelSectionRow key={index}>
            <div style={{ fontSize: "11px", wordBreak: "break-all", opacity: 0.8 }}>{note}</div>
          </PanelSectionRow>
        ))}
      </PanelSection>
    </>
  );
}

function LayoutHeader({ state, presetIndex, onPresetChange }: {
  state: Extract<LoadState, { status: "ready" }>;
  presetIndex: number;
  onPresetChange: (index: number) => void;
}) {
  const { doc, result } = state;
  const title = result.title || doc.title || "Untitled layout";
  const presetOptions = doc.presets.map((preset, index) => ({
    data: index,
    label: preset.kind === "layer" ? `↳ ${preset.title} (layer)` : preset.title
  }));
  return (
    <>
      <PanelSectionRow>
        <Field label={title} description={SOURCE_LABELS[result.source ?? ""] ?? ""} />
      </PanelSectionRow>
      {doc.presets.length > 1 && (
        <PanelSectionRow>
          <DropdownItem
            label="Action set"
            rgOptions={presetOptions}
            selectedOption={presetIndex}
            onChange={(option) => onPresetChange(Number(option.data))}
          />
        </PanelSectionRow>
      )}
      {result.fileId && (
        <PanelSectionRow>
          <Field label="Share" description={`${LAYOUT_STUDIO_URL}?layout=${result.fileId}`} />
        </PanelSectionRow>
      )}
    </>
  );
}

function CheatSheet({ doc, presetIndex }: { doc: LayoutDocument; presetIndex: number }) {
  const preset = doc.presets[presetIndex] ?? doc.presets[0];
  const view = useMemo(() => getPresetView(doc.presets, preset), [doc, preset]);
  const options = useMemo(() => ({ presetNames: Object.fromEntries(doc.presets.map((entry) => [entry.id, entry.title])) }), [doc]);

  return (
    <>
      <PanelSection title="Overview">
        <PanelSectionRow>
          <div style={{ fontSize: "12px", lineHeight: 1.4 }}>{describeLayoutOverview(view, DECK_CONTROLS, options)}</div>
        </PanelSectionRow>
      </PanelSection>
      {CHEAT_SHEET_SECTIONS.map((section) => {
        const rows = section.ids
          .map((id) => ({ control: getDeckControl(id), lines: describeControl(view.bindings[id], view.modes[id], options) }))
          .filter((row) => row.control && row.lines.length);
        if (!rows.length) return null;
        return (
          <PanelSection key={section.title} title={section.title}>
            {rows.map((row) => (
              <PanelSectionRow key={row.control!.id}>
                <Field label={row.control!.name} childrenLayout="below" focusable>
                  <div style={{ fontSize: "12px", lineHeight: 1.35 }}>
                    {row.lines.map((line, index) => <div key={index}>{line}</div>)}
                  </div>
                </Field>
              </PanelSectionRow>
            ))}
          </PanelSection>
        );
      })}
    </>
  );
}

export default definePlugin(() => ({
  name: "Steam Deck Layout Studio",
  titleView: <div className={staticClasses.Title}>Layout Studio</div>,
  content: <Content />,
  icon: <FaGamepad />
}));
