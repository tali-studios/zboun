import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const HEADER_SRC = join(process.cwd(), "public", "zbounbannernobackground.png");
const SIGNATURE_SRC = join(process.cwd(), "public", "zbounbanner.png");
const headerOut = join(process.cwd(), "public", "contract-logo-header.png");
const signatureOut = join(process.cwd(), "public", "contract-logo.png");

async function main() {
  if (!existsSync(HEADER_SRC)) {
    throw new Error(`Missing ${HEADER_SRC}`);
  }
  if (!existsSync(SIGNATURE_SRC)) {
    throw new Error(`Missing ${SIGNATURE_SRC}`);
  }

  const headerPng = await sharp(readFileSync(HEADER_SRC))
    .trim({ threshold: 10 })
    .resize(480, null, { fit: "inside" })
    .png()
    .toBuffer();

  writeFileSync(headerOut, headerPng);
  const headerMeta = await sharp(headerPng).metadata();
  console.log(
    `Header ← zbounbannernobackground.png → ${headerOut} (${headerMeta.width}x${headerMeta.height})`,
  );

  const signaturePng = await sharp(readFileSync(SIGNATURE_SRC))
    .trim({ threshold: 10 })
    .resize(480, null, { fit: "inside" })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .png()
    .toBuffer();

  writeFileSync(signatureOut, signaturePng);
  const sigMeta = await sharp(signaturePng).metadata();
  console.log(`Signature ← zbounbanner.png → ${signatureOut} (${sigMeta.width}x${sigMeta.height})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
