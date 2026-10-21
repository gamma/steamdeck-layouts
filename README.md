# Steam Deck Layout Studio

See what a Steam Deck layout does before you install it. Load a community layout (or any Steam Input `.vdf`), view every binding on a 3D Steam Deck, print a cheat sheet, and compare layouts.

- Interactive 3D deck view using Valve's Steam Deck shell CAD
- Full Steam Input reading: action sets and layers, group modes (Joystick Mouse, Directional Pad, Flick Stick, …), sub-inputs (directions, click, soft/full pull), mode shift, gyro, and the labels layout authors gave their bindings
- Plain-language overview, printable cheat sheet (Print / PDF, copy as text) and a per-control comparison between two layouts or action sets
- Shareable links: `?layout=<Steam published file id>` opens a layout directly
- Community layout browser (Steam store search + Steam's own layout listings) via a small proxy
- Decky Loader plugin (`decky-plugin/`): cheat sheet of the running game's layout in the Quick Access menu
- Light editing with JSON save/load, VDF export and local draft persistence

## Run locally

```bash
node server.js
```

Open `http://127.0.0.1:8000`. Click “Browse Community Layouts”, pick a game, then a layout. Drop a layout JSON or a Steam Input `.vdf` onto the deck view, or use **Open…**. With a layout loaded, **Cheat Sheet** and **Compare** open the viewer tools; “Copy share link” appears for community layouts.

`server.js` serves the app and relays, under `./api`:
- `store-search`: Steam store search for resolving game names to app IDs
- `layouts`: Steam's `IPublishedFileService/QueryFiles` for a game's public Steam Deck layouts (needs a Steam Web API key: `STEAM_API_KEY` for `server.js`, `steam_api_key` in `proxy/config.php`)
- `file-details`: Steam's keyless `GetPublishedFileDetails`, used by share links
- `layout-file`: Steam CDN layout VDF downloads (only `https://cdn.steamusercontent.com/ugc/<id>/<sha1>/`)

The proxy exists because Steam sends no CORS headers, so the browser cannot read them directly. It only validates, fetches and relays; all parsing happens in the browser (`core/`).

Run the tests with `npm test` (Node 22+).

## Code layout

- `core/`: platform-independent modules, tested with `node --test`
  - `vdf.js`: KeyValues parser/serializer
  - `steam-input.js`: reading and writing `controller_mappings` for the Steam Deck
  - `binding-dsl.js`: binding strings such as `key_press SPACE, Jump`
  - `layout-model.js`: the editor's activator model and draft migration
  - `layout-summary.js`: descriptions, overview and diff
  - `community.js`: Steam store search and layout listing mapping
- `app.js`: UI, 3D scene and editor
- `server.js`, `proxy/api.php`: local and hosted proxy with the same contract

Source and input names follow Valve's Steam Deck templates (`controller_base/templates/controller_neptune_*.vdf` in a Steam installation). The rear buttons map `button_back_*_upper` to L4/R4 and `button_back_*` to L5/R5.

## Hosted proxy (PHP webspace)

Static hosting such as GitHub Pages cannot run `server.js`. Deploy `proxy/` to any PHP 8.1+ webspace with the curl extension instead:

1. Upload the contents of `proxy/` to a directory, e.g. `https://example.com/sdl-api/`.
2. Copy `config.example.php` to `config.php` and list your frontend origin(s) in `allowed_origins`, e.g. `https://<your-username>.github.io`.
3. Put a Steam Web API key (https://steamcommunity.com/dev/apikey) into `steam_api_key`. It stays on the server; responses never contain it.
   The proxy limits each client IP per minute (`rate_limit_requests`, `rate_limit_upstream` for requests that reach Steam) and prunes its cache to `cache_max_bytes`. Upload `root.htaccess` as `.htaccess` to the site root to send HSTS and disable directory listings there too.
4. Make sure the web server can write the `cache/` directory (or point `cache_dir` outside the web root).
5. Set `REMOTE_API_BASE` in `config.js` to `https://example.com/sdl-api/api.php` and push.

The PHP proxy and `server.js` share the same contract (`?endpoint=store-search|layouts|file-details|layout-file`), so the app can use either. Viewers can point the app at another proxy with `?api=<url>` (remembered in the browser) and reset it with `?api=default`. When served from localhost, the app uses `./api` by default.

## Model source

This app ships with Valve's official Steam Deck external shell STL from the public hardware CAD repository:
`https://gitlab.steamos.cloud/SteamDeck/hardware`

The included model asset is stored at `assets/steamdeck_shell.stl`.
License: `CC BY-NC-SA 4.0` with attribution to Valve. See `assets/steamdeck_shell_LICENSE.txt`.

## Run online

### GitHub Pages
This repo includes a Pages workflow at `.github/workflows/deploy-pages.yml`.

1. Push this repository to GitHub.
2. In GitHub: **Settings → Pages**, set **Source** to **GitHub Actions**.
3. The workflow publishes the static site on each push to `main`.
4. Deploy the PHP proxy (see above) and set `REMOTE_API_BASE`, otherwise game search, community layouts and share links are unavailable on Pages.

Your app will be available at `https://<your-username>.github.io/<your-repo>/`.

With `gh` authenticated, `./scripts/deploy-gh-pages.sh` pushes `main`, waits for the Pages run of that commit, and prints the URL.
