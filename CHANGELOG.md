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
