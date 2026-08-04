# Changelog

## v0.4.7

- Added four fixed Winning Features options, from Colour only through Classic Quarto.
- Added an independent Yes/No option for 2×2 square wins.
- Updated win detection, AI evaluation, setup summary, Help and statistics for the selected rules.
- Classic remains the default, with 2×2 wins disabled.

## v0.4.6 - User-controlled PWA updates
- Display the current version in the centre of the phone header.

- Replaced the temporary update banner with a responsive modal dialog.
- Added fully visible Later and Update buttons on phones, tablets and desktops.
- Removed automatic service-worker activation and reload.
- Updates install only after the user chooses Update.
- Deferred update prompts while a game is in progress.


## v0.4.3

- Simplified computer difficulty from ten numeric levels to three clear choices: Beginner, Standard and Expert.
- Made Standard the default difficulty.
- Retained the existing AI engine by mapping the new levels to distinct beginner, tactical and strongest-search profiles.
- Updated computer status text, setup summaries and statistics to use the named levels.
- Migrated existing per-level statistics into the three new groups.
- Updated AI regression tests for the new difficulty model.

## v0.4.2

- Made game setup settings session-only rather than storing them in localStorage.
- A browser launch, normal reload or Ctrl+F5 now always starts with the standard defaults.
- Standard defaults are One Player, AI Level 6 and a 30-second move timer.
- New Game continues to reuse settings selected during the current page session.
- Statistics remain stored persistently and are unaffected.

## v0.4.1

- Started the dedicated AI development release without changing the existing interface.
- Added explicit tactical safety scoring for the complete place-and-gift turn.
- Strong AI now heavily rejects placements that leave no safe piece to hand to the opponent.
- Improved shallow-search placement choices by rewarding positions that preserve several safe gifts.
- Retained immediate-win detection, iterative deepening, alpha-beta pruning and exact endgame analysis.
- Added a forced-loss placement regression test alongside the existing win, safe-gift, legality and rules tests.

## v0.3.0

- Reworked the computer engine with iterative deepening, alpha-beta search and transposition caching.
- AI now evaluates a complete Quarto turn: where to place the supplied piece and which piece to hand back.
- Tuned levels 1-10 so beginner levels make controlled mistakes while stronger levels search progressively deeper.
- Levels 4+ always take an immediate win; stronger levels avoid gifting an immediate win whenever a safe piece exists.
- Added exact/deeper endgame analysis for the strongest levels when few squares remain.
- Added automated AI legality, tactical and rules regression tests (`npm test`).
- Preserved the current UI, Undo, statistics and PWA behaviour.

## v0.2.2

- Moved the phone Undo control into the turn instruction panel.
- Undo remains visible while the opponent-piece chooser is open.
- The chooser now starts directly beneath the instruction panel.
- The Choose button hides while the chooser is already open and returns after it is closed.

- Condensed all three setup-wizard pages for 13-inch and 15-inch laptops.
- Moved the phone setup sheet higher and reduced header/progress spacing.
- Reserved a non-overlapping footer for Cancel, Back, Next and Start Game.
- Corrected Back navigation: page 2 returns to page 1, page 3 returns to page 2, and page 1 has no Back button.
- Preserved existing settings and statistics during the upgrade.

## v0.2.0

- Added configurable single-step Undo: Off, Single player only, or Always on.
- Added overall and per-level computer statistics, streaks, move counts, winning-line types and winning attributes.
- Added statistics reset with confirmation.

## v0.1.20

- Replaced the phone piece-picker modal with a compact in-page chooser beneath the board.
- Keeps the complete 4×4 board and all 16 available pieces visible together without scrolling.
- Automatically resizes the board to the live phone viewport while the chooser is open.
- Closing the chooser with × restores the normal game controls and leaves the Choose button available.
- Tablet, laptop and desktop layouts remain unchanged.
- Updated the Android PWA cache and release metadata.

## v0.1.6
- Added a clear Computer thinking state with a natural delay that scales gently by difficulty.
- Highlights the square chosen by the computer before it places a piece.
- Highlights the piece chosen by the computer before handing it to the human player.
- Added clearer phone and player-card messages for thinking, choosing and placing stages.
- Preserved the existing AI strategy and difficulty behaviour.

## v0.1.5

- On phones, the available-piece picker now opens automatically at the start of every human choose-piece turn.
- Closing the picker with × or Cancel leaves the existing Choose button available, without reopening the picker during that turn.
- The picker opens again automatically on the player's next choose-piece turn.
- Tablet, laptop and desktop piece trays remain unchanged.
- Updated the Android PWA cache and release metadata to v0.1.5.

## v0.1.4

- New Game and Play Again now immediately reset the board using the current game settings.
- The Settings cog is now the only control that opens the game setup dialog.
- Added defensive event handling so the replay button cannot fall through to setup behaviour.
- Updated the Android PWA service-worker cache to v0.1.4.
- Core JavaScript, CSS and JSON assets now use network-first refresh behaviour to prevent an installed app retaining obsolete button logic.
- Preserves existing player names, game mode, AI level, timer, sound, animations and starter setting when replaying.

## v0.1.2

- Removed the end-of-game popup so the final board remains fully visible.
- Keeps the winning row, column or diagonal flashing red and blue until the next game starts.
- Replaced the remaining orange/yellow winner styling with the official red/blue treatment.
- Shows the result in the in-page status banner and phone turn dock.
- Changes New game to Play again after a result.
- New game and Play again immediately reuse the current settings.
- The settings cog remains the place to change players, AI level, timer, sound and animations.

## v0.1.0

- Introduced the first full strategic AI framework for difficulty levels 1–10.
- AI now evaluates both Quarto decisions: where to place the supplied piece and which piece to give the opponent.
- Levels 1–3 make controlled, human-like mistakes rather than purely random moves.
- Levels 4–6 consistently take immediate wins and increasingly avoid dangerous gifts.
- Levels 7–10 use bounded negamax search across complete place-and-gift turns.
- Levels 9–10 deepen their search and attempt exact endgame analysis when the board is sufficiently full.
- Added time and node budgets so expert calculation remains responsive on phones.

## v0.1.0

- Replaced the single long setup form with a three-step New Game wizard.
- Added clearer difficulty descriptions for levels 1–10.
- Added optional sound effects and animation controls.
- Added a polished Quarto/draw result dialog while preserving the visible winning board.
- Included the planned v0.1.0 game-polish work and v0.0.21 setup-wizard work in this single v0.1.0 release.

## v0.1.0

- Recalculates the phone play surface from the live visual viewport rather than relying on a fixed `100dvh` assumption.
- Keeps the board, turn dock, player strip and bottom controls visible after pull-to-refresh, app resume and browser UI changes.
- Re-runs the calculation after resize, orientation change, page restore and visibility changes.
- Retains the established tablet, laptop and desktop layouts.

## v0.0.18

- Fixed the phone portrait layout so CSS Grid no longer stretches large empty gaps between sections.
- Keeps the board, current-piece dock, player strip and New Game/How to Play controls inside the visible S23 viewport.
- Prevents the main installed-app game screen from vertically scrolling during play.
- Added extra compact sizing for shorter phone viewports while preserving the square board.
- Kept tablet, laptop, desktop and phone-landscape layouts unchanged.

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

## v0.4.3

- Simplified computer difficulty from ten numeric levels to three clear choices: Beginner, Standard and Expert.
- Made Standard the default difficulty.
- Retained the existing AI engine by mapping the new levels to distinct beginner, tactical and strongest-search profiles.
- Updated computer status text, setup summaries and statistics to use the named levels.
- Migrated existing per-level statistics into the three new groups.
- Updated AI regression tests for the new difficulty model.

## v0.1.0

- Recalculates the phone play surface from the live visual viewport rather than relying on a fixed `100dvh` assumption.
- Keeps the board, turn dock, player strip and bottom controls visible after pull-to-refresh, app resume and browser UI changes.
- Re-runs the calculation after resize, orientation change, page restore and visibility changes.
- Retains the established tablet, laptop and desktop layouts.

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


## v0.1.3
- New Game/Play Again now immediately starts a new game using existing settings.
- Settings dialog only opened via settings button.
