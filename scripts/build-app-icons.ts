import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import sharp from "sharp";

const SRC = join(process.cwd(), "public", "zbounlogo.png");
const LOGO_SVG = join(process.cwd(), "public", "Logo.svg");
const ICON_SVG = join(process.cwd(), "public", "icon.svg");
const ICON_WHITE_BG_SVG = join(process.cwd(), "public", "Icon-whitebg.svg");

const WHITE = { r: 255, g: 255, b: 255 } as const;
const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 } as const;

type Target = { path: string; size: number; label: string };

const OPAQUE_TARGETS: Target[] = [
  { path: join(process.cwd(), "public", "Icon-whitebg.png"), size: 512, label: "White-bg icon PNG" },
  { path: join(process.cwd(), "public", "apple-touch-icon.png"), size: 180, label: "Apple touch" },
  { path: join(process.cwd(), "app", "apple-icon.png"), size: 180, label: "Next.js apple-icon" },
];

const TRANSPARENT_TARGETS: Target[] = [
  { path: join(process.cwd(), "public", "icon-512.png"), size: 512, label: "Favicon / PWA (transparent)" },
  { path: join(process.cwd(), "public", "icon-192.png"), size: 192, label: "Favicon PNG (transparent)" },
];

async function makeTransparentPng(size: number): Promise<Buffer> {
  const { data, info } = await sharp(readFileSync(SRC))
    .trim({ threshold: 10 })
    .resize(size, size, { fit: "contain", background: TRANSPARENT })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = Buffer.from(data);
  for (let i = 0; i < pixels.length; i += info.channels) {
    const r = pixels[i] ?? 0;
    const g = pixels[i + 1] ?? 0;
    const b = pixels[i + 2] ?? 0;
    if (r >= 245 && g >= 245 && b >= 245) {
      pixels[i + 3] = 0;
    }
  }

  return sharp(pixels, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();
}

async function writeOpaqueIcon(target: Target) {
  const buf = await sharp(readFileSync(SRC))
    .trim({ threshold: 10 })
    .resize(target.size, target.size, {
      fit: "contain",
      background: { ...WHITE, alpha: 1 },
    })
    .flatten({ background: WHITE })
    .png()
    .toBuffer();

  mkdirSync(dirname(target.path), { recursive: true });
  writeFileSync(target.path, buf);
  const meta = await sharp(buf).metadata();
  console.log(`${target.label}: ${target.path} (${meta.width}x${meta.height} PNG)`);
}

async function writeTransparentIcon(target: Target) {
  const buf = await makeTransparentPng(target.size);
  mkdirSync(dirname(target.path), { recursive: true });
  writeFileSync(target.path, buf);
  const meta = await sharp(buf).metadata();
  console.log(`${target.label}: ${target.path} (${meta.width}x${meta.height} PNG)`);
}

async function writeEmbeddedSvg(outPath: string, label: string, pngBuf: Buffer) {
  const meta = await sharp(pngBuf).metadata();
  const w = meta.width ?? 512;
  const h = meta.height ?? 512;
  const b64 = pngBuf.toString("base64");

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <image width="${w}" height="${h}" xlink:href="data:image/png;base64,${b64}"/>
</svg>`;

  writeFileSync(outPath, svg);
  console.log(`${label}: ${outPath} (${w}x${h} SVG)`);
}

async function main() {
  if (!existsSync(SRC)) {
    throw new Error(`Missing source logo: ${SRC}`);
  }

  const srcMeta = await sharp(readFileSync(SRC)).metadata();
  console.log(`Source: ${SRC} (${srcMeta.width}x${srcMeta.height})`);

  for (const target of TRANSPARENT_TARGETS) {
    await writeTransparentIcon(target);
  }
  for (const target of OPAQUE_TARGETS) {
    await writeOpaqueIcon(target);
  }

  const faviconSvgPng = await makeTransparentPng(512);
  await writeEmbeddedSvg(ICON_SVG, "Browser favicon SVG (transparent)", faviconSvgPng);

  const navSvgPng = await sharp(readFileSync(SRC))
    .trim({ threshold: 10 })
    .resize(512, 512, { fit: "contain", background: { ...WHITE, alpha: 1 } })
    .flatten({ background: WHITE })
    .png()
    .toBuffer();
  await writeEmbeddedSvg(LOGO_SVG, "Site nav Logo.svg (white bg)", navSvgPng);
  await writeEmbeddedSvg(ICON_WHITE_BG_SVG, "Icon-whitebg.svg (white bg)", navSvgPng);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
