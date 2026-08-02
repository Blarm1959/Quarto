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

  const STYLE_DEFAULTS = {
    classic: { colourA: "#f4f1e8", colourB: "#17191c", colourAName: "White", colourBName: "Black" },
    modern: { colourA: "#2468b4", colourB: "#d13f4d", colourAName: "Blue", colourBName: "Red" }
  };

  let appearance = { style: "classic", ...STYLE_DEFAULTS.classic };

  function normaliseStyle(style) { return style === "modern" ? "modern" : "classic"; }

  function configureAppearance(settings = {}) {
    const style = normaliseStyle(settings.pieceStyle);
    const defaults = STYLE_DEFAULTS[style];
    const useCustom = settings.useCustomColours === true;
    appearance = {
      style,
      colourA: useCustom && settings.colourA ? settings.colourA : defaults.colourA,
      colourB: useCustom && settings.colourB ? settings.colourB : defaults.colourB,
      colourAName: useCustom && settings.colourAName ? settings.colourAName : defaults.colourAName,
      colourBName: useCustom && settings.colourBName ? settings.colourBName : defaults.colourBName
    };
    document.documentElement.dataset.pieceStyle = style;
    document.documentElement.style.setProperty("--piece-colour-a", appearance.colourA);
    document.documentElement.style.setProperty("--piece-colour-b", appearance.colourB);
    return { ...appearance };
  }

  function getColourName(piece) { return piece.dark ? appearance.colourBName : appearance.colourAName; }
  function getColourNames() { return [appearance.colourAName, appearance.colourBName]; }
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

  function addShadow(svg, round, width = 31) {
    svg.appendChild(svgElement("ellipse", { cx: 50, cy: 93, rx: round ? 27 : width, ry: 4.5, fill: "rgba(15,22,30,0.18)" }));
  }

  function createClassicPiece(svg, piece, baseColour) {
    const stroke = shade(baseColour, piece.dark ? 48 : -70);
    const topY = piece.tall ? 10 : 43;
    const bottomY = 89;
    addShadow(svg, piece.round, 27);

    if (piece.round) {
      const rx = 24;
      svg.appendChild(svgElement("path", {
        d: `M ${50-rx} ${topY+6} L ${50-rx} ${bottomY-6} A ${rx} 6 0 0 0 ${50+rx} ${bottomY-6} L ${50+rx} ${topY+6} Z`,
        fill: baseColour, stroke, "stroke-width": 2.5
      }));
      svg.appendChild(svgElement("ellipse", { cx: 50, cy: bottomY-6, rx, ry: 6, fill: shade(baseColour, -8), stroke, "stroke-width": 2.5 }));
      svg.appendChild(svgElement("ellipse", { cx: 50, cy: topY+6, rx, ry: 6, fill: shade(baseColour, 22), stroke, "stroke-width": 2.5 }));
      if (piece.hole) {
        svg.appendChild(svgElement("ellipse", { cx: 50, cy: topY+6, rx: 14, ry: 3.9, fill: shade(baseColour, -55), stroke, "stroke-width": 2 }));
        svg.appendChild(svgElement("ellipse", { cx: 50, cy: topY+5.4, rx: 9, ry: 2.2, fill: "rgba(18,22,28,.78)" }));
      }
    } else {
      const x = 28, width = 38, side = 9, topDepth = 7;
      svg.appendChild(svgElement("path", { d: `M ${x} ${topY+topDepth} L ${x+width} ${topY+topDepth} L ${x+width} ${bottomY} L ${x} ${bottomY} Z`, fill: baseColour, stroke, "stroke-width": 2.5 }));
      svg.appendChild(svgElement("path", { d: `M ${x+width} ${topY+topDepth} L ${x+width+side} ${topY} L ${x+width+side} ${bottomY-side} L ${x+width} ${bottomY} Z`, fill: shade(baseColour, -28), stroke, "stroke-width": 2.5 }));
      svg.appendChild(svgElement("path", { d: `M ${x} ${topY+topDepth} L ${x+side} ${topY} L ${x+width+side} ${topY} L ${x+width} ${topY+topDepth} Z`, fill: shade(baseColour, 25), stroke, "stroke-width": 2.5 }));
      if (piece.hole) {
        svg.appendChild(svgElement("path", { d: `M ${x+9} ${topY+5.5} L ${x+15} ${topY+2} L ${x+width} ${topY+2} L ${x+width-6} ${topY+5.5} Z`, fill: shade(baseColour, -58), stroke, "stroke-width": 1.8 }));
      }
    }
  }

  function createModernPiece(svg, piece, baseColour) {
    const stroke = shade(baseColour, -48);
    const topY = piece.tall ? 8 : 28;
    const baseY = 90;
    const width = piece.round ? 58 : 62;
    const x = (100 - width) / 2;
    const height = baseY - topY;
    addShadow(svg, piece.round);
    svg.appendChild(svgElement("rect", { x, y: topY, width, height, rx: piece.round ? width / 2 : 8, fill: baseColour, stroke, "stroke-width": 4 }));
    svg.appendChild(svgElement("ellipse", { cx: 50, cy: topY + 8, rx: piece.round ? 20 : 22, ry: 7, fill: "rgba(255,255,255,0.18)" }));
    svg.appendChild(svgElement("path", { d: piece.round ? `M ${x+14} ${topY+15} Q ${x+9} ${topY+height/2} ${x+16} ${baseY-14}` : `M ${x+12} ${topY+13} L ${x+12} ${baseY-14}`, fill: "none", stroke: "rgba(255,255,255,0.34)", "stroke-width": 5, "stroke-linecap": "round" }));
    if (piece.hole) {
      svg.appendChild(svgElement("ellipse", { cx: 50, cy: topY+9, rx: piece.round ? 13 : 12, ry: 7.5, fill: shade(baseColour, 30), stroke, "stroke-width": 3 }));
      svg.appendChild(svgElement("ellipse", { cx: 50, cy: topY+10, rx: piece.round ? 7.5 : 7, ry: 4.8, fill: "rgba(12,18,24,0.72)" }));
    }
  }

  function createPieceSvg(piece) {
    const svg = svgElement("svg", { viewBox: "0 0 100 100", class: "quarto-piece", role: "img", "aria-label": describePiece(piece) });
    const baseColour = piece.dark ? appearance.colourB : appearance.colourA;
    if (appearance.style === "classic") createClassicPiece(svg, piece, baseColour);
    else createModernPiece(svg, piece, baseColour);
    return svg;
  }

  function getPiece(pieceId) { return PIECES.find(piece => piece.id === Number(pieceId)) || null; }

  function createRemainingPieces(onSelect, remainingPieceIds = PIECES.map(piece => piece.id), enabled = true, container = null) {
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
      slot.title = describePiece(piece);
      slot.setAttribute("aria-label", `Select ${describePiece(piece)} piece`);
      slot.appendChild(createPieceSvg(piece));
      slot.disabled = !enabled;
      slot.classList.toggle("piece-slot--disabled", !enabled);
      if (enabled) slot.addEventListener("click", () => onSelect?.(piece, slot));
      tray.appendChild(slot);
    }
  }

  window.QuartoPieces = { PIECES, STYLE_DEFAULTS, getPiece, createPieceSvg, createRemainingPieces, describePiece, configureAppearance, getColourName, getColourNames };
})();
