// Builds out/steamdeck-layout-studio.zip in the layout Decky's
// "Install plugin from ZIP" expects: one top-level plugin folder.
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const name = "steamdeck-layout-studio";
const stage = join(root, "out", "stage");
const target = join(stage, name);

rmSync(join(root, "out"), { recursive: true, force: true });
mkdirSync(join(target, "dist"), { recursive: true });
for (const file of ["plugin.json", "package.json", "main.py", "README.md", "LICENSE"]) {
  if (existsSync(join(root, file))) cpSync(join(root, file), join(target, file));
}
cpSync(join(root, "py_modules"), join(target, "py_modules"), { recursive: true, filter: (path) => !path.includes("__pycache__") });
cpSync(join(root, "dist", "index.js"), join(target, "dist", "index.js"));
execFileSync("zip", ["-qr", join(root, "out", `${name}.zip`), name], { cwd: stage });
rmSync(stage, { recursive: true, force: true });
console.log(`out/${name}.zip`);
