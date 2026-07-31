(function () {
  "use strict";

  const PIECES = [];
  let id = 0;

  for (const tall of [false, true]) {
    for (const round of [false, true]) {
      for (const dark of [false, true]) {
        for (const hole of [false, true]) {
          PIECES.push({ id, tall, round, dark, hole });
          id += 1;
        }
      }
    }
  }

  function describePiece(piece) {
    return [
      piece.tall ? "Tall" : "Short",
      piece.round ? "Round" : "Square",
      piece.dark ? "Dark" : "Light",
      piece.hole ? "Hole" : "Solid"
    ].join(", ");
  }

  function createPieceSvg(piece) {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("class", "quarto-piece");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", describePiece(piece));

    const colour = piece.dark ? "var(--red-piece)" : "var(--blue-piece)";
    const stroke = piece.dark ? "#85222d" : "#164d86";
    const topY = piece.tall ? 16 : 30;
    const baseY = 82;
    const width = piece.round ? 52 : 56;
    const x = (100 - width) / 2;
    const height = baseY - topY;

    if (piece.round) {
      const body = document.createElementNS(ns, "rect");
      body.setAttribute("x", String(x));
      body.setAttribute("y", String(topY));
      body.setAttribute("width", String(width));
      body.setAttribute("height", String(height));
      body.setAttribute("rx", String(width / 2));
      body.setAttribute("fill", colour);
      body.setAttribute("stroke", stroke);
      body.setAttribute("stroke-width", "4");
      svg.appendChild(body);

      const highlight = document.createElementNS(ns, "path");
      highlight.setAttribute("d", `M ${x + 14} ${topY + 14} Q ${x + 10} ${topY + height / 2} ${x + 16} ${baseY - 13}`);
      highlight.setAttribute("fill", "none");
      highlight.setAttribute("stroke", "rgba(255,255,255,0.32)");
      highlight.setAttribute("stroke-width", "5");
      highlight.setAttribute("stroke-linecap", "round");
      svg.appendChild(highlight);
    } else {
      const body = document.createElementNS(ns, "rect");
      body.setAttribute("x", String(x));
      body.setAttribute("y", String(topY));
      body.setAttribute("width", String(width));
      body.setAttribute("height", String(height));
      body.setAttribute("rx", "7");
      body.setAttribute("fill", colour);
      body.setAttribute("stroke", stroke);
      body.setAttribute("stroke-width", "4");
      svg.appendChild(body);

      const highlight = document.createElementNS(ns, "path");
      highlight.setAttribute("d", `M ${x + 12} ${topY + 12} L ${x + 12} ${baseY - 12}`);
      highlight.setAttribute("stroke", "rgba(255,255,255,0.28)");
      highlight.setAttribute("stroke-width", "5");
      highlight.setAttribute("stroke-linecap", "round");
      svg.appendChild(highlight);
    }

    if (piece.hole) {
      const rim = document.createElementNS(ns, "ellipse");
      rim.setAttribute("cx", "50");
      rim.setAttribute("cy", String(topY + 9));
      rim.setAttribute("rx", piece.round ? "12" : "11");
      rim.setAttribute("ry", "7");
      rim.setAttribute("fill", "rgba(255,255,255,0.30)");
      rim.setAttribute("stroke", stroke);
      rim.setAttribute("stroke-width", "3");
      svg.appendChild(rim);

      const recess = document.createElementNS(ns, "ellipse");
      recess.setAttribute("cx", "50");
      recess.setAttribute("cy", String(topY + 10));
      recess.setAttribute("rx", piece.round ? "7" : "6.5");
      recess.setAttribute("ry", "4.5");
      recess.setAttribute("fill", "rgba(20,28,38,0.65)");
      svg.appendChild(recess);
    }

    return svg;
  }

  function createRemainingPieces() {
    const tray = document.getElementById("remaining-pieces");
    if (!tray) return;

    tray.replaceChildren();

    for (const piece of PIECES) {
      const slot = document.createElement("div");
      slot.className = "piece-slot";
      slot.dataset.pieceId = String(piece.id);
      slot.title = describePiece(piece);
      slot.appendChild(createPieceSvg(piece));
      tray.appendChild(slot);
    }
  }

  window.QuartoPieces = {
    PIECES,
    createPieceSvg,
    createRemainingPieces,
    describePiece
  };
})();
