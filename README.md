# Steam Deck Layout Studio (MVP)

A visual-first Steam Deck layout editor MVP with:
- Interactive 3D deck view
- Action library + bindings table sync
- JSON save/load layout workflow

## Run locally

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## Run online (free options)

### Option 1: GitHub Pages (recommended)
This repo includes a Pages workflow at `.github/workflows/deploy-pages.yml`.

1. Push this repository to GitHub.
2. In GitHub: **Settings → Pages**.
3. Set **Source** to **GitHub Actions**.
4. The workflow will publish the static site on each push to `main` (and `work` for dev).

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


## Troubleshooting

- If you saw `Failed to resolve module specifier "three"`, this is fixed by the import map in `index.html` that maps `three` for browser module resolution.
- If GitHub Pages deployment failed before, the workflow now uploads a clean `_site` artifact containing only static app files.
