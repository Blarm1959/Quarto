from pathlib import Path
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.pdfgen import canvas
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from pypdf import PdfReader, PdfWriter

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "print"
OUT.mkdir(parents=True, exist_ok=True)
BOARD = OUT / "Quarto_A4_Game_Board.pdf"
RULES = OUT / "Quarto_A4_Rules.pdf"
PACK = OUT / "Quarto_A4_Print_Pack.pdf"


def make_board(path: Path) -> None:
    width, height = A4
    board_size = 194 * mm
    x = (width - board_size) / 2
    y = (height - board_size) / 2
    c = canvas.Canvas(str(path), pagesize=A4)
    c.setTitle("Quarto A4 Game Board")
    c.setLineWidth(3.2)
    c.setStrokeColorRGB(0, 0, 0)
    cell = board_size / 4
    for i in range(5):
        p = i * cell
        c.line(x + p, y, x + p, y + board_size)
        c.line(x, y + p, x + board_size, y + p)
    c.showPage()
    c.save()


def make_rules(path: Path) -> None:
    styles = getSampleStyleSheet()
    title = ParagraphStyle(
        "RulesTitle", parent=styles["Title"], fontName="Helvetica-Bold",
        fontSize=24, leading=28, alignment=TA_CENTER, spaceAfter=13
    )
    heading = ParagraphStyle(
        "RulesHeading", parent=styles["Heading2"], fontName="Helvetica-Bold",
        fontSize=14, leading=17, spaceBefore=7, spaceAfter=4
    )
    body = ParagraphStyle(
        "RulesBody", parent=styles["BodyText"], fontName="Helvetica",
        fontSize=11.5, leading=15, spaceAfter=5
    )
    note = ParagraphStyle(
        "RulesNote", parent=body, borderWidth=1, borderColor="#888888",
        borderPadding=8, backColor="#f3f3f3", spaceBefore=10
    )
    doc = SimpleDocTemplate(
        str(path), pagesize=A4, leftMargin=16*mm, rightMargin=16*mm,
        topMargin=14*mm, bottomMargin=14*mm, title="Quarto Quick Rules"
    )
    story = [
        Paragraph("QUARTO - Quick Rules", title),
        Paragraph("Objective", heading),
        Paragraph("Be the first player to create a row, column or diagonal of four pieces that all share at least one common attribute.", body),
        Paragraph("The 16 Pieces", heading),
        Paragraph("Every piece is unique. Each one is:<br/>- Tall or Short<br/>- Round or Square<br/>- Light or Dark<br/>- Solid or Hole", body),
        Paragraph("Who Starts?", heading),
        Paragraph("Choose at random, or agree who starts. The starting player first chooses a piece for the other player; they do not place a piece themselves.", body),
        Paragraph("How to Play", heading),
        Paragraph("1. The starting player chooses any piece for their opponent.<br/>2. The opponent places it on any empty square.<br/>3. That player then chooses any remaining piece for the other player.<br/>4. Continue placing the piece you are given, then choosing the next piece for your opponent.", body),
        Paragraph("Winning", heading),
        Paragraph("Immediately after placing a piece, you win if a completed row, column or diagonal has four pieces sharing at least one attribute. The four may differ in every other way. A line can share more than one attribute.", body),
        Paragraph("Examples: 4 Tall pieces, 4 Hole pieces, or 4 Square and 4 Dark pieces.", body),
        Paragraph("Draw", heading),
        Paragraph("If all 16 squares are filled and nobody has made a winning line, the game is a draw.", body),
        Paragraph("Remember: you never choose the piece that you place. You choose the next piece for your opponent.", note),
    ]
    doc.build(story)


def combine(paths: list[Path], output: Path) -> None:
    writer = PdfWriter()
    for path in paths:
        reader = PdfReader(str(path))
        for page in reader.pages:
            writer.add_page(page)
    with output.open("wb") as stream:
        writer.write(stream)


if __name__ == "__main__":
    make_board(BOARD)
    make_rules(RULES)
    combine([BOARD, RULES], PACK)
    print(f"Created: {BOARD}")
    print(f"Created: {RULES}")
    print(f"Created: {PACK}")
