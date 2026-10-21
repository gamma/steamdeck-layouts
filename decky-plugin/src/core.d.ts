// Types for the shared JavaScript modules in ../../core, which the plugin
// bundles as-is.

declare module "*core/vdf.js" {
  export function parseVdf(text: string): Record<string, any>;
}

declare module "*core/steam-input.js" {
  export interface Preset {
    id: string;
    name: string;
    title: string;
    kind: "set" | "layer";
    parentName: string;
    bindings: Record<string, any[]>;
    modes: Record<string, { mode: string; settings: Record<string, string> }>;
    gyro: { mode: string } | null;
  }
  export interface LayoutDocument {
    title: string;
    description: string;
    controllerType: string;
    presets: Preset[];
  }
  export function readControllerConfig(parsed: Record<string, any>, controlIds: string[]): LayoutDocument;
  export function getEffectiveBindings(presets: Preset[], preset: Preset): Record<string, any[]>;
}

declare module "*core/layout-summary.js" {
  type Options = { presetNames?: Record<string, string> };
  export function describeControl(activators: any[] | undefined, modeEntry: { mode?: string } | undefined, options?: Options): string[];
  export function describeLayoutOverview(preset: any, controls: { id: string; name: string }[], options?: Options): string;
}

declare module "*core/deck-controls.js" {
  export const DECK_CONTROLS: { id: string; name: string; kind: string }[];
  export const CHEAT_SHEET_SECTIONS: { title: string; ids: string[] }[];
  export function getDeckControl(id: string): { id: string; name: string; kind: string } | undefined;
}
