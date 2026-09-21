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

  // Quarto keeps the same eight colour-A / eight colour-B structure, while
  // allowing the two colours to be selected in Settings.
  // Hollow centres are deliberately rendered as one solid white shape so they
  // remain unmistakable at phone size and never appear as a white/black ring.
  const COLOURS = {
    blue: ["Blue", "#1769d2"], red: ["Red", "#e42b32"],
    green: ["Green", "#318653"], yellow: ["Yellow", "#e2ad34"],
    purple: ["Purple", "#7955a6"], orange: ["Orange", "#d97832"],
    black: ["Black", "#1d1d1d"], white: ["White", "#f8f8f4"],
    hollow: "#ffffff"
  };

  let appearance = { colourAKey: "blue", colourBKey: "red" };

  function configureAppearance(settings = {}) {
    appearance.colourAKey = COLOURS[settings.colourA] ? settings.colourA : "blue";
    appearance.colourBKey = COLOURS[settings.colourB] ? settings.colourB : "red";
    if (appearance.colourAKey === appearance.colourBKey) appearance.colourBKey = appearance.colourAKey === "red" ? "blue" : "red";
    const colourA = COLOURS[appearance.colourAKey], colourB = COLOURS[appearance.colourBKey];
    document.documentElement.style.setProperty("--piece-colour-a", colourA[1]);
    document.documentElement.style.setProperty("--piece-colour-b", colourB[1]);
    return { colourA: colourA[1], colourB: colourB[1], colourAName: colourA[0], colourBName: colourB[0] };
  }

  function getColourName(piece) { return COLOURS[piece.dark ? appearance.colourBKey : appearance.colourAKey][0]; }
  function getColourNames() { return [COLOURS[appearance.colourAKey][0], COLOURS[appearance.colourBKey][0]]; }
  function describePiece(piece) {
    return [piece.tall ? "Tall" : "Short", piece.round ? "Round" : "Square", getColourName(piece), piece.hole ? "Hollow" : "Solid"].join(", ");
  }

  function shade(hex, amount) {
    const raw = hex.replace("#", "");
    const number = Number.parseInt(raw, 16);
    const r = Math.max(0, Math.min(255, (number >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((number >> 8) & 255) + amount));
    const b = Math.max(0, Math.min(255, (number & 255) + amount));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  function svgElement(name, attrs = {}) {
    const element = document.createElementNS("http://www.w3.org/2000/svg", name);
    for (const [key, value] of Object.entries(attrs)) element.setAttribute(key, String(value));
    return element;
  }

  function addShadow(svg, round, width = 27) {
    svg.appendChild(svgElement("ellipse", {
      cx: 50, cy: 93, rx: round ? 25 : width, ry: 4.2,
      fill: "rgba(15,22,30,0.18)"
    }));
  }

  function createRoundPiece(svg, piece, baseColour) {
    const topY = piece.tall ? 10 : 45;
    const bottomY = 88;
    const rx = 23;
    const edge = shade(baseColour, -48);

    addShadow(svg, true);
    svg.appendChild(svgElement("path", {
      d: `M ${50-rx} ${topY+6} L ${50-rx} ${bottomY-6} A ${rx} 6 0 0 0 ${50+rx} ${bottomY-6} L ${50+rx} ${topY+6} Z`,
      fill: baseColour, stroke: edge, "stroke-width": 2.2
    }));
    svg.appendChild(svgElement("ellipse", {
      cx: 50, cy: bottomY-6, rx, ry: 6,
      fill: shade(baseColour, -10), stroke: edge, "stroke-width": 2.2
    }));
    svg.appendChild(svgElement("ellipse", {
      cx: 50, cy: topY+6, rx, ry: 6,
      fill: shade(baseColour, 18), stroke: edge, "stroke-width": 2.2
    }));
    svg.appendChild(svgElement("path", {
      d: `M ${34} ${topY+12} Q ${31} ${(topY+bottomY)/2} ${35} ${bottomY-12}`,
      fill: "none", stroke: "rgba(255,255,255,.28)", "stroke-width": 3.2, "stroke-linecap": "round"
    }));

    if (piece.hole) {
      // A single, uninterrupted white centre. No inner dark ellipse is drawn.
      svg.appendChild(svgElement("ellipse", {
        cx: 50, cy: topY+6, rx: 13.5, ry: 4.2,
        fill: COLOURS.hollow, stroke: COLOURS.hollow, "stroke-width": 1
      }));
    }
  }

  function createSquarePiece(svg, piece, baseColour) {
    const topY = piece.tall ? 10 : 45;
    const bottomY = 88;
    const x = 28;
    const width = 38;
    const side = 9;
    const topDepth = 7;
    const edge = shade(baseColour, -48);

    addShadow(svg, false, 26);
    svg.appendChild(svgElement("path", {
      d: `M ${x} ${topY+topDepth} L ${x+width} ${topY+topDepth} L ${x+width} ${bottomY} L ${x} ${bottomY} Z`,
      fill: baseColour, stroke: edge, "stroke-width": 2.2
    }));
    svg.appendChild(svgElement("path", {
      d: `M ${x+width} ${topY+topDepth} L ${x+width+side} ${topY} L ${x+width+side} ${bottomY-side} L ${x+width} ${bottomY} Z`,
      fill: shade(baseColour, -28), stroke: edge, "stroke-width": 2.2
    }));
    svg.appendChild(svgElement("path", {
      d: `M ${x} ${topY+topDepth} L ${x+side} ${topY} L ${x+width+side} ${topY} L ${x+width} ${topY+topDepth} Z`,
      fill: shade(baseColour, 18), stroke: edge, "stroke-width": 2.2
    }));
    svg.appendChild(svgElement("path", {
      d: `M ${34} ${topY+15} L ${34} ${bottomY-12}`,
      fill: "none", stroke: "rgba(255,255,255,.25)", "stroke-width": 3, "stroke-linecap": "round"
    }));

    if (piece.hole) {
      // The complete inset is white; there is no second, darker centre shape.
      svg.appendChild(svgElement("path", {
        d: `M ${x+9} ${topY+5.5} L ${x+15} ${topY+2} L ${x+width} ${topY+2} L ${x+width-6} ${topY+5.5} Z`,
        fill: COLOURS.hollow, stroke: COLOURS.hollow, "stroke-width": 1
      }));
    }
  }

  function createPieceSvg(piece) {
    const svg = svgElement("svg", {
      viewBox: "0 0 100 100", class: "quarto-piece", role: "img",
      "aria-label": describePiece(piece)
    });
    const baseColour = COLOURS[piece.dark ? appearance.colourBKey : appearance.colourAKey][1];
    if (piece.round) createRoundPiece(svg, piece, baseColour);
    else createSquarePiece(svg, piece, baseColour);
    return svg;
  }

  function getPiece(pieceId) { return PIECES.find(piece => piece.id === Number(pieceId)) || null; }

  function createRemainingPieces(onSelect, remainingPieceIds = PIECES.map(piece => piece.id), enabled = true, container = null, highlightedPieceId = null) {
    const tray = container || document.getElementById("remaining-pieces");
    if (!tray) return;
    tray.replaceChildren();
    for (const pieceId of remainingPieceIds) {
      const piece = getPiece(pieceId);
      if (!piece) continue;
      const slot = document.createElement("button");
      slot.type = "button";
      slot.className = "piece-slot";
      slot.dataset.pieceId = String(piece.id);
      if (piece.id === highlightedPieceId) slot.classList.add("piece-slot--ai-choice");
      slot.title = describePiece(piece);
      slot.setAttribute("aria-label", `Select ${describePiece(piece)} piece`);
      slot.appendChild(createPieceSvg(piece));
      slot.disabled = !enabled;
      slot.classList.toggle("piece-slot--disabled", !enabled);
      if (enabled) slot.addEventListener("click", () => onSelect?.(piece, slot));
      tray.appendChild(slot);
    }
  }

  window.QuartoPieces = {
    PIECES, COLOURS, getPiece, createPieceSvg, createRemainingPieces,
    describePiece, configureAppearance, getColourName, getColourNames
  };
})();
