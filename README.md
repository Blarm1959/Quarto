# Quarto

Starter project for a Progressive Web App implementation of Quarto.

## Design decisions (v0.1)

- Responsive 4x4 square board.
- SVG-rendered pieces.
- Piece attributes:
  - Tall / Short
  - Round / Square
  - Light / Dark
  - Solid / Hole
- Player names configurable (defaults: Player 1 / Player 2).
- Winner message format:
  - Bill wins (4 Tall pieces)
  - Player 1 wins (4 Hole & 4 Dark pieces)
- Winning reason always shown.
- Optional move timer:
  - Unlimited
  - 30 seconds (default)
  - 45 / 60 / 90 / Custom
- Countdown displayed only when enabled.
- Timeout action configurable:
  - No action (default)
  - Lose turn
  - Random piece
  - Random square
- Theme support planned (default Blue/Red).


## Project Notes
See `docs/ARCHITECTURE.md` and `docs/PRINTING.md`.
