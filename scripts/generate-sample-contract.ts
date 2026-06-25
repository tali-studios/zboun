import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { contractPdfFilename, generateContractPdfBuffer } from "../src/lib/contract-pdf";

const params = {
  restaurantName: "Al Baaklini Restaurant",
  adminEmail: "admin@example.com",
  effectiveDate: new Date(),
  subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  monthlyPrice: 10,
};

async function main() {
  const pdf = await generateContractPdfBuffer(params);
  const out = join(process.cwd(), contractPdfFilename(params.restaurantName));
  writeFileSync(out, pdf);
  console.log(`Wrote ${out}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
