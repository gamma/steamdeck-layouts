# Steam Deck Layout Studio (MVP)

A visual-first Steam Deck layout editor MVP with:
- Interactive 3D deck view using Valve's Steam Deck shell CAD
- Steam store game search + Steam community layout loading via a small proxy (local Node or hosted PHP)
- Full-screen community layout dialog (games/filter left, layouts middle, details right)
- Parsed Steam Input bindings rendered as table rows and short hideable 3D callout tags
- JSON save/load workflow plus drag&drop and local draft persistence

## Run locally

```bash
node server.js
```

Open `http://127.0.0.1:8000`.
Click “Browse Community Layouts” to open the dialog, which lays out games on the left, layout search/filter in the middle (it always queries Steam Deck layouts), and layout details/tags on the right; within the gallery the Overlay button toggles the short callouts and connector lines. Drag `.json` files onto the deck view or use the Save/Load buttons to leverage the File System Access API for local persistence (it falls back to download/upload when unsupported).

`server.js` serves the app and relays, under `./api`:
- Steam store search for resolving game names to app IDs
- SteamInputDB app pages for community layout metadata
- Steam CDN layout VDF downloads

The proxy exists because Steam and SteamInputDB send no CORS headers, so the browser cannot read them directly. It only validates, fetches and relays; all parsing happens in the browser (`core/community.js`).

Run the tests with `npm test` (Node 22+).

## Hosted proxy (PHP webspace)

Static hosting such as GitHub Pages cannot run `server.js`. Deploy `proxy/` to any PHP 8.1+ webspace with the curl extension instead (e.g. Hetzner Webhosting):

1. Upload the contents of `proxy/` to a directory, e.g. `https://example.com/sdl-api/`.
2. Copy `config.example.php` to `config.php` and list your frontend origin(s) in `allowed_origins`, e.g. `https://<your-username>.github.io`.
3. Make sure the web server can write the `cache/` directory (or point `cache_dir` outside the web root).
4. Set `REMOTE_API_BASE` in `config.js` to `https://example.com/sdl-api/api.php` and push.

The PHP proxy and `server.js` share the same contract (`?endpoint=store-search|community-layouts|layout-file`), so the app can use either. Viewers can point the app at another proxy with `?api=<url>` (remembered in the browser) and reset it with `?api=default`. When served from localhost, the app uses `./api` by default.

## Model source

This app ships with Valve's official Steam Deck external shell STL from the public hardware CAD repository:
`https://gitlab.steamos.cloud/SteamDeck/hardware`

The included model asset is stored at `assets/steamdeck_shell.stl`.
License: `CC BY-NC-SA 4.0` with attribution to Valve. See `assets/steamdeck_shell_LICENSE.txt`.

## Run online (free options)

### Option 1: GitHub Pages (recommended)
This repo includes a Pages workflow at `.github/workflows/deploy-pages.yml`.

1. Push this repository to GitHub.
2. In GitHub: **Settings → Pages**.
3. Set **Source** to **GitHub Actions**.
4. The workflow will publish the static site on each push to `main`.
5. Deploy the PHP proxy (see above) and set `REMOTE_API_BASE`, otherwise game search and community layouts are unavailable on Pages.

Your app will be available at:
`https://<your-username>.github.io/<your-repo>/`

### Option 2: Netlify Drop (fastest, no setup)
1. Go to https://app.netlify.com/drop
2. Drag and drop the repository folder (or a zip of it).
3. Netlify instantly hosts it and gives a public URL.


### Option 3: One-command deploy (when authenticated)
If you already have a GitHub remote + `gh` auth:

```bash
./scripts/deploy-gh-pages.sh
```

This pushes your current branch, waits for the Pages workflow, and prints the URL.
