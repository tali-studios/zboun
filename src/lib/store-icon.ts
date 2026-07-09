import sharp from "sharp";

const WHITE = { r: 255, g: 255, b: 255, alpha: 1 } as const;
const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 } as const;
/** Inset so logos don't touch home-screen icon edges. */
const LOGO_INSET = 0.12;

export const STORE_ICON_SIZES = [180, 192, 512] as const;
export type StoreIconSize = (typeof STORE_ICON_SIZES)[number];

export function parseStoreIconSize(raw: string | null): StoreIconSize {
  const n = Number(raw);
  if (n === 180 || n === 192 || n === 512) return n;
  return 192;
}

/** Square padded PNG suitable for PWA / apple-touch-icon from a remote logo URL. */
export async function renderStoreIconPng(
  logoUrl: string,
  size: StoreIconSize,
): Promise<Buffer> {
  const res = await fetch(logoUrl, { cache: "force-cache" });
  if (!res.ok) {
    throw new Error(`Failed to fetch store logo (${res.status})`);
  }
  const input = Buffer.from(await res.arrayBuffer());
  const inner = Math.max(1, Math.round(size * (1 - LOGO_INSET * 2)));

  const logo = await sharp(input)
    .rotate()
    .resize(inner, inner, { fit: "contain", background: TRANSPARENT })
    .ensureAlpha()
    .png()
    .toBuffer();

  const meta = await sharp(logo).metadata();
  const lw = meta.width ?? inner;
  const lh = meta.height ?? inner;
  const left = Math.round((size - lw) / 2);
  const top = Math.round((size - lh) / 2);

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: WHITE,
    },
  })
    .composite([{ input: logo, left, top }])
    .png()
    .toBuffer();
}
