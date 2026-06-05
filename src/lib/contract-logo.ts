import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

export type ContractLogoAsset = {
  base64: string;
  width: number;
  height: number;
};

const LOGO_SVG = join(process.cwd(), "public", "Logo.svg");
const LOGO_PNG = join(process.cwd(), "public", "contract-logo.png");
const HEADER_PNG = join(process.cwd(), "public", "contract-logo-header.png");

let headerCache: ContractLogoAsset | null = null;
let signatureCache: ContractLogoAsset | null = null;

function pngDimensions(buf: Buffer): { width: number; height: number } {
  if (buf.length < 24) return { width: 480, height: 100 };
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function bufferToAsset(buf: Buffer): ContractLogoAsset {
  const { width, height } = pngDimensions(buf);
  return { base64: buf.toString("base64"), width, height };
}

function readPngFile(path: string): ContractLogoAsset | null {
  if (!existsSync(path)) return null;
  try {
    return bufferToAsset(readFileSync(path));
  } catch {
    return null;
  }
}

/** Cover header — rasterized from Logo.svg (transparent background). */
export async function loadHeaderLogoFromSvg(): Promise<ContractLogoAsset | null> {
  if (headerCache) return headerCache;

  const cached = readPngFile(HEADER_PNG);
  if (cached) {
    headerCache = cached;
    return headerCache;
  }

  if (!existsSync(LOGO_SVG)) return null;

  try {
    const buf = await sharp(LOGO_SVG, { density: 200 })
      .resize(480, null, { fit: "inside" })
      .png()
      .toBuffer();
    headerCache = bufferToAsset(buf);
    return headerCache;
  } catch {
    return null;
  }
}

/** Signature block — public/contract-logo.png (white background). */
export function getSignatureLogo(): ContractLogoAsset | null {
  if (signatureCache) return signatureCache;
  signatureCache = readPngFile(LOGO_PNG);
  return signatureCache;
}
