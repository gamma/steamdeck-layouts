# Steam Deck Layout Studio (MVP)

A visual-first Steam Deck layout editor MVP with:
- Interactive 3D deck view using Valve's Steam Deck shell CAD
- Steam store game search + Steam community layout loading via local proxy
- Full-screen community layout dialog (games/filter left, layouts middle, details right)
- Parsed Steam Input bindings rendered as table rows and short hideable 3D callout tags
- JSON save/load workflow plus drag&drop/layout storage API persistence
- JSON save/load workflow plus drag&drop/layout storage API persistence

## Run locally

```bash
node server.js
```

Open `http://127.0.0.1:8000`.
Click “Browse Community Layouts” to open the dialog, which lays out games on the left, layout search/filter in the middle (it always queries Steam Deck layouts), and layout details/tags on the right; within the gallery the Overlay button toggles the short callouts and connector lines. Drag `.json` files onto the deck view or use the Save/Load buttons to leverage the File System Access API for local persistence (it falls back to download/upload when unsupported).

`server.js` serves the app and proxies:
- Steam store search for resolving game names to app IDs
- SteamInputDB app pages for community layout metadata
- Steam CDN layout VDF downloads for parsing

The old static `python3 -m http.server` flow is not enough anymore because browser-side direct fetches to SteamInputDB/CDN are blocked by CORS.

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
