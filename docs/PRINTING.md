# Quarto Print Assets

The `docs/print` folder contains:

- `Quarto_A4_Game_Board.pdf` - one-page A4 board.
- `Quarto_A4_Rules.pdf` - one-page A4 quick rules.
- `Quarto_A4_Print_Pack.pdf` - board followed by rules.

Board specification:

- A4 portrait.
- 194 mm square 4x4 grid.
- Thick black lines.
- Print at Actual size / 100%.

The PDFs can be regenerated with:

```powershell
python tools/generate_printables.py
```
