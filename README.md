# Quarto

A responsive Progressive Web App implementation of the strategy game Quarto.

## Current version

v0.1.5

## Run locally

```powershell
npm install
npm start
```

Open `http://127.0.0.1:8004`.

## Current features

- One-player games against a computer opponent with difficulty levels 1–10.
- Two-player games on the same device.
- Dedicated phone, tablet, laptop and desktop layouts.
- Phone-first piece-selection dialog and large touch targets.
- Automatic Quarto detection for rows, columns and diagonals.
- Configurable player names, starting player and move timer.
- A fixed, high-visibility red and blue piece set with solid white hollow centres.
- Installable Progressive Web App support.


## Installable web app

Serve the project over HTTPS (or use localhost), open it in a compatible browser, and use **Install app** when offered. After the first successful load, the game shell is available offline.

## Publish on GitHub Pages

The repository contains an automatic deployment workflow. After the one-time GitHub setup, every push to `main` publishes the current app.

1. Open the repository on GitHub.
2. Select **Settings > Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Push normally by running `./Update.ps1`.
5. Check the **Actions** tab for the `Deploy Quarto to GitHub Pages` run.

The live project URL will normally be `https://<account>.github.io/<repository>/`. All app URLs are relative, so installation and offline use work from a repository subfolder.

See `docs/GITHUB_PAGES.md` for testing and troubleshooting.
