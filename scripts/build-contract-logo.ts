import { writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const src = join(process.cwd(), "public", "Logo.svg");
const headerOut = join(process.cwd(), "public", "contract-logo-header.png");
const signatureOut = join(process.cwd(), "public", "contract-logo.png");

async function main() {
  const headerPng = await sharp(src, { density: 200 })
    .resize(480, null, { fit: "inside" })
    .png()
    .toBuffer();

  writeFileSync(headerOut, headerPng);
  console.log(`Wrote ${headerOut} (${headerPng.length} bytes, transparent)`);

  const signaturePng = await sharp(src, { density: 200 })
    .resize(480, null, { fit: "inside" })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .png()
    .toBuffer();

  writeFileSync(signatureOut, signaturePng);
  console.log(`Wrote ${signatureOut} (${signaturePng.length} bytes, white bg)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
