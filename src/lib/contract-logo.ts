import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

export type ContractLogoAsset = {
  base64: string;
  width: number;
  height: number;
  /** jsPDF image format */
  format: "PNG" | "JPEG";
};

/** Transparent — contract cover header */
const HEADER_SRC = join(process.cwd(), "public", "zbounbannernobackground.png");
/** White background — signature block */
const SIGNATURE_SRC = join(process.cwd(), "public", "zbounbanner.png");

let headerCache: ContractLogoAsset | null = null;
let signatureCache: ContractLogoAsset | null = null;

async function bufferToAsset(buf: Buffer): Promise<ContractLogoAsset> {
  const meta = await sharp(buf).metadata();
  return {
    base64: buf.toString("base64"),
    width: meta.width ?? 480,
    height: meta.height ?? 100,
    format: meta.format === "jpeg" ? "JPEG" : "PNG",
  };
}

async function prepareHeaderBuffer(buf: Buffer): Promise<Buffer> {
  return sharp(buf).trim({ threshold: 10 }).resize(480, null, { fit: "inside" }).png().toBuffer();
}

async function prepareSignatureBuffer(buf: Buffer): Promise<Buffer> {
  return sharp(buf)
    .trim({ threshold: 10 })
    .resize(480, null, { fit: "inside" })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .png()
    .toBuffer();
}

/** Contract cover header — public/zbounbannernobackground.png */
export async function loadHeaderLogoFromSvg(): Promise<ContractLogoAsset | null> {
  if (headerCache) return headerCache;
  if (!existsSync(HEADER_SRC)) return null;

  try {
    const buf = await prepareHeaderBuffer(readFileSync(HEADER_SRC));
    headerCache = await bufferToAsset(buf);
    return headerCache;
  } catch {
    return null;
  }
}

/** Signature block — public/zbounbanner.png */
export async function getSignatureLogo(): Promise<ContractLogoAsset | null> {
  if (signatureCache) return signatureCache;
  if (!existsSync(SIGNATURE_SRC)) return null;

  try {
    const buf = await prepareSignatureBuffer(readFileSync(SIGNATURE_SRC));
    signatureCache = await bufferToAsset(buf);
    return signatureCache;
  } catch {
    return null;
  }
}

/** Clear in-process cache (e.g. after replacing banner files in dev). */
export function clearContractLogoCache(): void {
  headerCache = null;
  signatureCache = null;
}
