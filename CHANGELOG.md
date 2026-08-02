# Changelog

## v0.0.17

- Added a dedicated phone play surface that keeps the board as the dominant element.
- Replaced phone-only side panels with a compact turn dock directly below the board.
- Added a current-piece preview in the phone turn dock while placing.
- Added a large phone action button that opens the piece-selection bottom sheet while choosing.
- Improved phone spacing, safe-area use and bottom-sheet sizing for installed Android use.
- Kept tablet, laptop and desktop layouts unchanged.

## v0.0.16

- Added automatic deployment to GitHub Pages after every push to `main`.
- Added deployment validation for JavaScript and JSON before publishing.
- Added generated live-build metadata containing the version, Git commit and deployment time.
- Updated the app footer to display deployed build information when available.
- Kept all PWA URLs relative so Quarto works below a GitHub Pages repository path.
- Added a one-time GitHub Pages setup and troubleshooting guide.
- Excluded local Visual Studio workspace data from the replacement project.

## v0.0.15

- Strengthened Quarto as an installable Progressive Web App.
- Added a complete icon set, including Android maskable icons and an Apple touch icon.
- Added install controls that appear only when the browser supports installation.
- Added a version-aware service worker with offline app-shell caching and safer update handling.
- Added an in-app update banner when a new release is ready.
- Added an offline fallback page for first-load failures.
- Added safe-area, standalone-display and mobile viewport support for modern phones.
- Added manifest metadata suitable for later Android/Play Store packaging while retaining one web codebase.

## v0.0.14

- Standardised the game on one permanent high-visibility red and blue piece set.
- Removed Classic/Modern style selection and every custom-colour option.
- Redrew all 16 generated pieces with consistent proportions, perspective, lighting and shadows.
- Made every hollow centre a single solid white shape, with no dark centre or inner ring.
- Updated all piece names, help text and winning messages to use Red and Blue.
- Updated project metadata and offline cache to v0.0.14.

## v0.0.13

- Added **Classic** piece style with clear traditional cylinders and rectangular pieces.
- Retained the existing artwork as the **Modern** piece style.
- Classic defaults to black and white; Modern defaults to red and blue.
- Added an optional custom-colour override.
- Updated piece descriptions and winning messages to use the colours currently shown.
- Changed player-facing “hole” wording to the clearer “hollow”.

## v0.0.12
- Added a playable one-player mode against the computer.
- Added a 1–10 difficulty control grouped as Beginner, Intermediate and Expert.
- Added an initial difficulty-aware computer strategy for placing and selecting pieces.
- Added a dedicated phone piece-selection bottom sheet with large touch targets.
- Improved the phone game hierarchy so the board is shown before secondary information.
- Added a clearer game-mode selector to New Game setup.
- Updated project metadata, documentation and offline cache to v0.0.12.

## v0.0.11
- Added a dedicated phone portrait layout tested at 360 x 740 CSS pixels.
- Enlarged the board to almost the full phone width.
- Reduced players and timer to a compact single-row strip.
- Shows only the controls needed for the current game phase.
- Made the current-piece card horizontal on phones.
- Increased touch targets for available pieces and game buttons.
- Preserved desktop, compact-laptop, tablet and phone-landscape layouts.

## v0.0.10
- Optimised the full game for 1366x768-class 13-inch laptop screens at 100% browser zoom.
- Kept the three-column layout down to 900 CSS pixels for laptops using Windows display scaling.
- Reduced non-game spacing while preserving a practical board size.
- Made the footer version read automatically from package.json.
- Kept the existing tablet, phone portrait and phone landscape layouts.
- Updated the service-worker cache to prevent stale v0.0.7 files being shown.

## v0.0.7
- Reworked the layout for 15-inch laptops at 100% browser zoom.
- Added dedicated desktop, compact-laptop, tablet, phone portrait and phone landscape layouts.
- Made touch targets and controls phone-friendly.
- On phones, hides the unused Current Piece panel while choosing.
- On phones, hides the unavailable pieces tray while placing.
- Added a compact sticky control bar on phones.
- Preserved the square board at every screen size.

## v0.0.6
- Added automatic Quarto detection for all rows, columns and both diagonals.
- Detects Tall, Short, Round, Square, Dark, Light, Hole and Solid wins.
- Highlights the winning four squares and identifies all shared attributes.
- Fixed the bottom-left to top-right square diagonal case.

# Changelog

## v0.0.4
- Added a single game-state object as the source of truth for players, starter, board, pieces and phase.
- Added animated piece movement from the tray into the Current Piece panel.
- Improved piece hover, selection and settling animations.
- Improved the generated SVG pieces with stronger depth, highlights and shadows.
- Added a working New Game setup dialog.
- Player names can now be entered and remembered.
- Starting player can be random, alternating, Player 1 or Player 2.
- Move timer can be set to 30, 45, 60 seconds or Unlimited.
- Light and dark piece colours can be changed and remembered.
- Improved the black board with a subtle bevel and deeper shadow.

## v0.0.3
- Added black board with white squares.
- Added all 16 generated Quarto pieces.
- Added piece selection and Current Piece preview.
- Added favicon and PWA icons.

## v0.0.5
- Added the full two-player choose-and-place turn loop.
- The starting player chooses a piece for the opponent.
- The receiving player places it on any empty board square.
- The placing player then chooses the next piece for their opponent.
- Added occupied board rendering and placement animations.
- Added real move countdown behaviour, including Unlimited mode.
- Updated phase-specific player and status messages.
