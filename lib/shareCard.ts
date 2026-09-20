/**
 * lib/shareCard.ts
 * ---------------------------------------------------------------------------
 * Client-side helper that renders a verse onto a 1080×1350 canvas and triggers
 * a PNG download.  Extracted from VerseCard.tsx to reduce component size and
 * improve testability of the canvas rendering logic.
 *
 * Long verses always fit: every block is word-wrapped, the layout tries roomy
 * font sizes first and shrinks step-wise until the whole stack fits above the
 * footer, and only as a last resort truncates the translation with an ellipsis.
 * Nothing is ever clipped or drawn off-canvas.
 */

"use client";

/** Fallback font stack used when drawing the share card onto a canvas. */
const SHARE_FONT_STACK = `"Noto Sans Gurmukhi", "Nirmala UI", "Raavi", sans-serif`;

interface ShareCardOptions {
  gurmukhi: string;
  transliteration: string;
  translation: string;
  angNumber: number;
  lineId: string;
  baniToken?: string;
  baniName?: string;
}

/** Word-wraps text to the card width for the given font. */
function wrap(
  ctx: CanvasRenderingContext2D,
  text: string,
  font: string,
  usable: number,
): string[] {
  ctx.font = font;
  const out: string[] = [];
  let current = "";
  for (const w of text.split(/\s+/).filter(Boolean)) {
    const test = current ? `${current} ${w}` : w;
    if (ctx.measureText(test).width <= usable) {
      current = test;
    } else {
      if (current) out.push(current);
      current = w;
    }
  }
  if (current) out.push(current);
  return out;
}

/** Truncates wrapped lines to `max` rows, ellipsising the last one. */
function fitLines(
  ctx: CanvasRenderingContext2D,
  wrapped: string[],
  font: string,
  max: number,
  usable: number,
): string[] {
  if (wrapped.length <= max) return wrapped;
  const kept = wrapped.slice(0, max);
  ctx.font = font;
  let last = kept[max - 1];
  while (last.length > 1 && ctx.measureText(`${last}\u2026`).width > usable) {
    last = last.slice(0, -1).trimEnd();
  }
  kept[max - 1] = `${last}\u2026`;
  return kept;
}

/**
 * Renders a verse onto a 1080×1350 (4:5 portrait) canvas and triggers a
 * PNG download.
 */
export function downloadShareCard({
  gurmukhi,
  transliteration,
  translation,
  angNumber,
  lineId,
  baniToken,
  baniName,
}: ShareCardOptions): void {
  const W = 1080;
  const H = 1350;
  const PAD_X = 110;
  const usable = W - PAD_X * 2;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const trText = transliteration || "";
  const tlText = translation || "";

  // Roomy-first font configs; the first one whose stack fits wins.
  const configs = [
    { g: 56, tr: 32, tl: 30 },
    { g: 48, tr: 28, tl: 26 },
    { g: 42, tr: 25, tl: 23 },
    { g: 36, tr: 22, tl: 20 },
  ];
  const gFont = (s: number) => `600 ${s}px ${SHARE_FONT_STACK}`;
  const trFont = (s: number) => `italic 400 ${s}px Inter, sans-serif`;
  const tlFont = (s: number) => `400 ${s}px Inter, sans-serif`;

  const CONTENT_TOP = 400;
  const CONTENT_BOTTOM = H - 200;
  const GAP = 44;

  let picked = configs[configs.length - 1];
  let gLines: string[] = [];
  let trLines: string[] = [];
  let tlLines: string[] = [];

  for (const cfg of configs) {
    const g = wrap(ctx, gurmukhi, gFont(cfg.g), usable);
    const tr = trText ? wrap(ctx, trText, trFont(cfg.tr), usable) : [];
    const tl = tlText ? wrap(ctx, tlText, tlFont(cfg.tl), usable) : [];
    const need =
      g.length * cfg.g * 1.65 +
      (tr.length ? GAP * 0.7 + tr.length * cfg.tr * 1.5 : 0) +
      (tl.length ? GAP + tl.length * cfg.tl * 1.5 : 0);
    gLines = g;
    trLines = tr;
    tlLines = tl;
    picked = cfg;
    if (need <= CONTENT_BOTTOM - CONTENT_TOP) break;
  }

  // Last resort: cap the stack so it ends above the footer.
  const maxGLines = Math.max(
    2,
    Math.floor((CONTENT_BOTTOM - CONTENT_TOP) / (picked.g * 1.65)),
  );
  gLines = fitLines(ctx, gLines, gFont(picked.g), Math.min(gLines.length, maxGLines), usable);
  let used = CONTENT_TOP + gLines.length * picked.g * 1.65;
  const trBudget =
    trLines.length && used + GAP * 0.7 < CONTENT_BOTTOM
      ? Math.max(
          1,
          Math.floor((CONTENT_BOTTOM - used - GAP * 0.7) / (picked.tr * 1.5)),
        )
      : 0;
  trLines = trBudget
    ? fitLines(ctx, trLines, trFont(picked.tr), Math.min(trLines.length, trBudget), usable)
    : [];
  used += trLines.length ? GAP * 0.7 + trLines.length * picked.tr * 1.5 : 0;
  const tlBudget =
    tlLines.length && used + GAP < CONTENT_BOTTOM
      ? Math.max(1, Math.floor((CONTENT_BOTTOM - used - GAP) / (picked.tl * 1.5)))
      : 0;
  tlLines = tlBudget
    ? fitLines(ctx, tlLines, tlFont(picked.tl), Math.min(tlLines.length, tlBudget), usable)
    : [];

  const totalH =
    gLines.length * picked.g * 1.65 +
    (trLines.length ? GAP * 0.7 + trLines.length * picked.tr * 1.5 : 0) +
    (tlLines.length ? GAP + tlLines.length * picked.tl * 1.5 : 0);
  // Vertically centre the stack between the header mark and the footer.
  let y = CONTENT_TOP + Math.max(0, (CONTENT_BOTTOM - CONTENT_TOP - totalH) / 2);

  // -- Backdrop: deep base + warm radial glow + hairline frame -------------
  ctx.fillStyle = "#0B0C12";
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W / 2, H * 0.32, 60, W / 2, H * 0.32, 720);
  glow.addColorStop(0, "rgba(245, 158, 11, 0.12)");
  glow.addColorStop(1, "rgba(245, 158, 11, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "rgba(245, 158, 11, 0.35)";
  ctx.lineWidth = 2;
  ctx.strokeRect(44, 44, W - 88, H - 88);

  // -- Header mark ----------------------------------------------------------
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#F59E0B";
  ctx.font = `600 92px ${SHARE_FONT_STACK}`;
  ctx.fillText("\u0A74", W / 2, 208);
  ctx.fillRect(W / 2 - 80, 258, 160, 4);

  // -- Body: top-baseline stacking so wrapped rows never overlap -----------
  ctx.textBaseline = "top";

  // -- Gurmukhi ---------------------------------------------------------------
  ctx.fillStyle = "#FAFAFA";
  ctx.font = gFont(picked.g);
  for (const l of gLines) {
    ctx.fillText(l, W / 2, y);
    y += picked.g * 1.65;
  }

  // -- Transliteration ----------------------------------------------------------
  if (trLines.length) {
    y += GAP * 0.7;
    ctx.fillStyle = "#94A3B8";
    ctx.font = trFont(picked.tr);
    for (const l of trLines) {
      ctx.fillText(l, W / 2, y);
      y += picked.tr * 1.5;
    }
  }

  // -- Translation ----------------------------------------------------------------
  if (tlLines.length) {
    y += GAP;
    ctx.fillStyle = "#E2E8F0";
    ctx.font = tlFont(picked.tl);
    for (const l of tlLines) {
      ctx.fillText(l, W / 2, y);
      y += picked.tl * 1.5;
    }
  }

  // -- Footer attribution -----------------------------------------------------------
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#F59E0B";
  ctx.fillRect(W / 2 - 60, H - 168, 120, 3);
  ctx.fillStyle = "#64748B";
  ctx.font = `400 26px Inter, sans-serif`;
  ctx.fillText(
    baniName ?? `Sri Guru Granth Sahib Ji \u00B7 Ang ${angNumber}`,
    W / 2,
    H - 108,
  );

  // Download.
  const url = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = baniToken
    ? `sggs-${baniToken}-verse-${lineId}.png`
    : `sggs-ang-${angNumber}-verse-${lineId}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
