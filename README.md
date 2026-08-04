# Quarto

A modern, responsive **Progressive Web App (PWA)** implementation of the classic strategy game **Quarto**.

The application has been designed to work well on **phones, tablets, laptops and desktop computers**, with a touch-friendly interface, installable PWA support and a configurable computer opponent.

---

## Release information

The current release information is maintained automatically in:

- `release.json`
- `build-info.json`

These files are the single source of truth for version, build and release metadata. :contentReference[oaicite:0]{index=0}

---

## Run locally

```powershell
npm install
npm start
```

Open:

```
http://127.0.0.1:8004
```

---

## Features

- One-player games against a configurable computer opponent with three clearly defined AI levels: **Beginner, Standard and Expert**.
- Two-player games on the same device.
- Responsive layouts optimised for phones, tablets, laptops and desktops.
- Large touch targets and phone-first user interface.
- Automatic piece selection panel with full board visibility.
- Single-move Undo (configurable for computer games, two-player games or disabled).
- Automatic Quarto detection for rows, columns and diagonals.
- Winning line remains highlighted with alternating red/blue flashing.
- Configurable player names, starting player and move timer.
- Fixed high-visibility red and blue playing pieces with contrasting hollow centres.
- Installable Progressive Web App (PWA).
- Offline support after first installation.
- Printable A4 board, rules and combined print pack included.

---

## Install as an app

Serve the project from **localhost** or HTTPS.

Open the application in a supported browser and choose **Install App** when prompted.

Once installed, Quarto behaves like a native application and is available offline after the initial load.

---

## Publish to GitHub Pages

The repository includes an automated GitHub Actions deployment workflow.

After the one-time GitHub Pages configuration, simply run:

```powershell
.\Update.ps1
```

The updater will build, commit, push and publish the latest version.

The live site will normally be available at:

```
https://<account>.github.io/<repository>/
```

All URLs are relative, allowing the application to run correctly from a repository subfolder.

For deployment notes see:

```
docs/GITHUB_PAGES.md
```

---

## Documentation

Additional documentation is included in the repository:

- `docs/ARCHITECTURE.md`
- `docs/GITHUB_PAGES.md`
- `docs/PRINTING.md`

The printable pack contains:

- Quarto A4 board
- Quarto A4 rules
- Combined print pack

---

## Roadmap

The next planned development stages are:

- Stronger computer AI.
- Additional accessibility improvements.
- Language support.
- Google Play Store packaging.
- Continued UI polish and gameplay refinements.
