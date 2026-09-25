import ExcelJS from "exceljs";
import {
  CATALOG_IMPORT_MAX_ROWS,
  buildOptionGroupsFromImportRow,
  parseCommaList,
} from "../src/lib/catalog-import.ts";
import {
  buildCatalogImportTemplateBuffer,
  parseCatalogImportWorkbook,
} from "../src/lib/catalog-import-template.ts";

const FASHION_PROFILE = {
  weightPricing: false,
  displayQuantity: false,
  nutrition: false,
  contents: true,
  audienceTag: true,
  brandRequired: true,
  isFashionLike: true,
  isElectronicsLike: false,
  isFoodLike: false,
  productOptions: true,
  ingredientCustomization: false,
  optionHints: {
    typePrimary: "Size",
    typeSecondary: "Color",
    value: "Custom size",
    addAnother: "+ Add colors",
    presetMode: "fashion" as const,
  },
};

async function buildWorkbook(rowCount: number) {
  const wb = new ExcelJS.Workbook();
  const sheet = wb.addWorksheet("Items");
  sheet.addRow([
    "section_name",
    "name",
    "price",
    "description",
    "sizes",
    "colors",
    "track_stock",
    "stock_quantity",
    "is_available",
  ]);
  for (let i = 1; i <= rowCount; i++) {
    sheet.addRow([
      "Section A",
      `Item ${i}`,
      10,
      "",
      "S, M, L",
      "Black, White",
      "no",
      "",
      "yes",
    ]);
  }
  return Buffer.from(await wb.xlsx.writeBuffer());
}

async function run() {
  let failed = 0;
  const cases = [0, 1, 50, 51];

  for (const n of cases) {
    const result = await parseCatalogImportWorkbook(await buildWorkbook(n));
    const denyMsg = result.errors.find((e) => /too many|max \d+ items/i.test(e.message));
    const denied = result.rows.length === 0 && Boolean(denyMsg);
    const expectDeny = n > CATALOG_IMPORT_MAX_ROWS;
    let pass = false;
    if (n === 0) pass = result.rows.length === 0 && !denied;
    else if (expectDeny) pass = denied;
    else pass = result.rows.length === n && result.errors.length === 0;
    if (!pass) failed += 1;
    console.log(
      `${pass ? "PASS" : "FAIL"} filled=${n} parsed=${result.rows.length} denied=${denied}`,
    );
  }

  const fashion = await parseCatalogImportWorkbook(
    await buildCatalogImportTemplateBuffer({
      profile: FASHION_PROFILE,
      hasBrands: true,
      storeName: "Fashion Test",
    }),
  );
  const first = fashion.rows[0];
  const groups = first ? buildOptionGroupsFromImportRow(first) : [];
  const hasSize = groups.some((g) => g.label === "Size" && g.values.length >= 3);
  const hasColor = groups.some((g) => g.label === "Color" && g.values.length >= 2);
  const fashionPass =
    fashion.rows.length === 2 &&
    fashion.errors.length === 0 &&
    Boolean(first?.sizes.length) &&
    Boolean(first?.colors.length) &&
    hasSize &&
    hasColor;
  if (!fashionPass) failed += 1;
  console.log(
    `${fashionPass ? "PASS" : "FAIL"} fashion_template sizes=${JSON.stringify(first?.sizes)} colors=${JSON.stringify(first?.colors)} groups=${groups.map((g) => g.label).join("+")}`,
  );

  const listPass = parseCommaList("XS, S, M | L").join("|") === "XS|S|M|L";
  if (!listPass) failed += 1;
  console.log(`${listPass ? "PASS" : "FAIL"} comma_list_parse`);

  if (failed > 0) {
    console.error(`\n${failed} test(s) failed`);
    process.exit(1);
  }
  console.log("\nAll catalog import option checks passed.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
