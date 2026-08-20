import { writeFileSync } from "fs";
import { join } from "path";
import {
  generateMerchantTermsPdfBuffer,
  merchantTermsPdfFilename,
} from "../src/lib/merchant-terms-pdf";

async function main() {
  const buf = await generateMerchantTermsPdfBuffer({
    merchantName: "Demo Store",
    adminEmail: "demo@zboun.net",
  });
  const filename = merchantTermsPdfFilename("Demo Store");
  const outPath = join(process.cwd(), filename);
  writeFileSync(outPath, buf);
  console.log(`Wrote ${outPath} (${buf.length} bytes)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
