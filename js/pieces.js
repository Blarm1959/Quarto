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

  function shade(hex, amount) {
    const raw = hex.replace("#", "");
    const number = Number.parseInt(raw, 16);
    const r = Math.max(0, Math.min(255, (number >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((number >> 8) & 255) + amount));
    const b = Math.max(0, Math.min(255, (number & 255) + amount));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  function createPieceSvg(piece) {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("class", "quarto-piece");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", describePiece(piece));

    const baseColour = getComputedStyle(document.documentElement)
      .getPropertyValue(piece.dark ? "--dark-piece" : "--light-piece").trim()
      || (piece.dark ? "#c83d4b" : "#2668b2");
    const stroke = shade(baseColour, -48);
    const topY = piece.tall ? 8 : 28;
    const baseY = 90;
    const width = piece.round ? 58 : 62;
    const x = (100 - width) / 2;
    const height = baseY - topY;

    const shadow = document.createElementNS(ns, "ellipse");
    shadow.setAttribute("cx", "50");
    shadow.setAttribute("cy", "92");
    shadow.setAttribute("rx", piece.round ? "28" : "31");
    shadow.setAttribute("ry", "5");
    shadow.setAttribute("fill", "rgba(15,22,30,0.18)");
    svg.appendChild(shadow);

    const body = document.createElementNS(ns, "rect");
    body.setAttribute("x", String(x));
    body.setAttribute("y", String(topY));
    body.setAttribute("width", String(width));
    body.setAttribute("height", String(height));
    body.setAttribute("rx", piece.round ? String(width / 2) : "8");
    body.setAttribute("fill", baseColour);
    body.setAttribute("stroke", stroke);
    body.setAttribute("stroke-width", "4");
    svg.appendChild(body);

    const topShine = document.createElementNS(ns, "ellipse");
    topShine.setAttribute("cx", "50");
    topShine.setAttribute("cy", String(topY + 8));
    topShine.setAttribute("rx", piece.round ? "20" : "22");
    topShine.setAttribute("ry", "7");
    topShine.setAttribute("fill", "rgba(255,255,255,0.18)");
    svg.appendChild(topShine);

    const highlight = document.createElementNS(ns, "path");
    highlight.setAttribute("d", piece.round
      ? `M ${x + 14} ${topY + 15} Q ${x + 9} ${topY + height / 2} ${x + 16} ${baseY - 14}`
      : `M ${x + 12} ${topY + 13} L ${x + 12} ${baseY - 14}`);
    highlight.setAttribute("fill", "none");
    highlight.setAttribute("stroke", "rgba(255,255,255,0.34)");
    highlight.setAttribute("stroke-width", "5");
    highlight.setAttribute("stroke-linecap", "round");
    svg.appendChild(highlight);

    if (piece.hole) {
      const rim = document.createElementNS(ns, "ellipse");
      rim.setAttribute("cx", "50");
      rim.setAttribute("cy", String(topY + 9));
      rim.setAttribute("rx", piece.round ? "13" : "12");
      rim.setAttribute("ry", "7.5");
      rim.setAttribute("fill", shade(baseColour, 30));
      rim.setAttribute("stroke", stroke);
      rim.setAttribute("stroke-width", "3");
      svg.appendChild(rim);

      const recess = document.createElementNS(ns, "ellipse");
      recess.setAttribute("cx", "50");
      recess.setAttribute("cy", String(topY + 10));
      recess.setAttribute("rx", piece.round ? "7.5" : "7");
      recess.setAttribute("ry", "4.8");
      recess.setAttribute("fill", "rgba(12,18,24,0.72)");
      svg.appendChild(recess);
    }

    return svg;
  }

  function createRemainingPieces(onSelect) {
    const tray = document.getElementById("remaining-pieces");
    if (!tray) return;
    tray.replaceChildren();

    for (const piece of PIECES) {
      const slot = document.createElement("button");
      slot.type = "button";
      slot.className = "piece-slot";
      slot.dataset.pieceId = String(piece.id);
      slot.title = describePiece(piece);
      slot.setAttribute("aria-label", `Select ${describePiece(piece)} piece`);
      slot.appendChild(createPieceSvg(piece));
      slot.addEventListener("click", () => onSelect?.(piece, slot));
      tray.appendChild(slot);
    }
  }

  window.QuartoPieces = { PIECES, createPieceSvg, createRemainingPieces, describePiece };
})();
