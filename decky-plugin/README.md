# Steam Deck Layout Studio — Decky plugin

Shows the controller layout of the running game in the Quick Access menu: action sets and layers, stick/pad modes, every binding with the labels the layout author gave it, back buttons and gyro. It renders with the same `core/` modules as the web app.

## How it finds the layout

The backend (`main.py`) looks in `~/.local/share/Steam/steamapps/common/Steam Controller Configs/<account>/config/`:

1. `configset_*.vdf` entry for the game (by app id or game name):
   - `workshop` → local workshop copy, else downloaded via Steam's keyless `GetPublishedFileDetails` (cached for a week)
   - `template` → `controller_base/templates/<name>`
2. A saved personal configuration in `config/<appid or game name>/*controller*.vdf`

Steam does not document these files, so the plugin reports every probed path under **Diagnostics → Show lookup details**.

## Build and install

```bash
npm install
npm run package   # → out/steamdeck-layout-studio.zip
```

On the Deck: Decky settings → General → enable **Developer mode**, then Developer → **Install plugin from ZIP** (file or URL).

Tests for the backend: `python3 -m unittest discover -s tests`.
