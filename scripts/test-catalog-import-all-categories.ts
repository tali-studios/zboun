/**
 * Production readiness: catalog Excel import for every browse category profile.
 * Run: npx tsx scripts/test-catalog-import-all-categories.ts
 */
import {
  CATALOG_IMPORT_MAX_ROWS,
  buildOptionGroupsFromImportRow,
  catalogImportColumnsForProfile,
  parseAddOnList,
  parseCommaList,
  type CatalogImportProfile,
} from "../src/lib/catalog-import.ts";
import {
  buildCatalogImportTemplateBuffer,
  parseCatalogImportWorkbook,
} from "../src/lib/catalog-import-template.ts";
import { resolveStoreItemProfile } from "../src/lib/store-item-profile.ts";
import { BROWSE_SECTION_OPTIONS, type BrowseSection } from "../src/lib/browse-sections.ts";
import ExcelJS from "exceljs";

type Check = { name: string; pass: boolean; detail?: string };

function profileFor(sections: BrowseSection[]): CatalogImportProfile {
  return resolveStoreItemProfile(sections);
}

async function parseTemplate(profile: CatalogImportProfile, storeName: string) {
  const buf = await buildCatalogImportTemplateBuffer({
    profile,
    hasBrands: profile.brandRequired || profile.isFashionLike,
    storeName,
  });
  return parseCatalogImportWorkbook(buf);
}

async function buildFilledSheet(
  headers: string[],
  dataRows: Array<Array<string | number>>,
) {
  const wb = new ExcelJS.Workbook();
  const sheet = wb.addWorksheet("Items");
  sheet.addRow(headers);
  for (const row of dataRows) sheet.addRow(row);
  return Buffer.from(await wb.xlsx.writeBuffer());
}

async function run() {
  const checks: Check[] = [];
  let failed = 0;

  function assert(name: string, pass: boolean, detail?: string) {
    checks.push({ name, pass, detail });
    if (!pass) failed += 1;
    console.log(`${pass ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
  }

  // ── Per-category template + sample parse ─────────────────────────────────
  for (const section of BROWSE_SECTION_OPTIONS) {
    const profile = profileFor([section]);
    const columns = catalogImportColumnsForProfile(profile, {
      hasBrands: profile.brandRequired || profile.isFashionLike,
    });
    const parsed = await parseTemplate(profile, section);

    assert(
      `${section}: template parses`,
      parsed.errors.length === 0 && parsed.rows.length === 2,
      `rows=${parsed.rows.length} cols=${columns.length} errors=${JSON.stringify(parsed.errors)}`,
    );

    assert(
      `${section}: has required core columns`,
      columns.includes("section_name") &&
        columns.includes("name") &&
        columns.includes("price") &&
        columns.includes("description") &&
        columns.includes("track_stock"),
    );

    // Category-specific expectations
    if (profile.isFashionLike) {
      assert(
        `${section}: fashion has sizes+colors`,
        columns.includes("sizes") && columns.includes("colors"),
      );
      const groups = buildOptionGroupsFromImportRow(parsed.rows[0]!);
      assert(
        `${section}: sample builds Size+Color groups`,
        groups.some((g) => g.label === "Size" && g.values.length > 0) &&
          groups.some((g) => g.label === "Color" && g.values.length > 0),
        groups.map((g) => `${g.label}(${g.values.length})`).join(", "),
      );
    }

    if (profile.isElectronicsLike) {
      assert(
        `${section}: electronics has storage+colors`,
        columns.includes("storage_options") && columns.includes("colors"),
      );
    }

    if (profile.weightPricing) {
      assert(
        `${section}: weight pricing columns`,
        columns.includes("sold_by_weight") && columns.includes("price_per_kg"),
      );
    }

    if (profile.nutrition) {
      assert(
        `${section}: nutrition columns`,
        columns.includes("calories") && columns.includes("protein_g"),
      );
    }

    if (profile.ingredientCustomization) {
      assert(
        `${section}: food customization columns`,
        columns.includes("removable_ingredients") &&
          columns.includes("add_on_ingredients"),
      );
      const addons = parseAddOnList(String(parsed.rows[0] ? "Cheese:1 | Bacon:2" : ""));
      // Also verify sample row when present
      const sampleAddons = parsed.rows[0]?.addOnIngredients ?? [];
      assert(
        `${section}: add-on prices parsed from sample`,
        sampleAddons.length >= 1 && sampleAddons.every((a) => a.name && a.price >= 0),
        JSON.stringify(sampleAddons),
      );
      assert(
        `${section}: add-on parser Cheese:1|Bacon:2`,
        addons.length === 2 && addons[0]!.price === 1 && addons[1]!.price === 2,
      );
    }

    if (profile.audienceTag) {
      assert(`${section}: audience column`, columns.includes("audience"));
    }

    if (profile.contents) {
      assert(`${section}: contents column`, columns.includes("contents"));
    }

    // Smoke-like (nicotine/flavor hints without fashion/electronics preset)
    if (
      profile.productOptions &&
      !profile.isFashionLike &&
      !profile.isElectronicsLike &&
      (profile.optionHints.typePrimary.toLowerCase().includes("nicotine") ||
        profile.optionHints.typeSecondary.toLowerCase().includes("flavor"))
    ) {
      assert(
        `${section}: smoke option columns`,
        columns.includes("nicotine_options") && columns.includes("flavor_options"),
      );
    } else if (
      profile.productOptions &&
      !profile.isFashionLike &&
      !profile.isElectronicsLike &&
      !profile.optionHints.typePrimary.toLowerCase().includes("nicotine")
    ) {
      assert(
        `${section}: generic option columns`,
        columns.includes("option1_label") && columns.includes("option1_values"),
      );
    }
  }

  // ── Mixed multi-category store (union) ───────────────────────────────────
  const mixed = profileFor(["Fashion & Apparel", "Food & Restaurants"]);
  const mixedCols = catalogImportColumnsForProfile(mixed, { hasBrands: true });
  assert(
    "mixed fashion+food: union includes sizes, colors, weight, nutrition, add-ons",
    mixedCols.includes("sizes") &&
      mixedCols.includes("colors") &&
      mixedCols.includes("sold_by_weight") &&
      mixedCols.includes("calories") &&
      mixedCols.includes("add_on_ingredients"),
    mixedCols.join(","),
  );

  // ── Fashion filled row round-trip ────────────────────────────────────────
  const fashionCols = catalogImportColumnsForProfile(profileFor(["Fashion & Apparel"]), {
    hasBrands: true,
  });
  const fashionBuf = await buildFilledSheet(
    ["section_name", "name", "brand_name", "audience", "contents", "price", "sizes", "colors", "description", "track_stock", "is_available"],
    [
      [
        "Dresses",
        "Silk Wrap Dress",
        "Nova",
        "women",
        "100% silk",
        89,
        "XS, S, M, L",
        "Black, Cream, Navy",
        "Evening dress",
        "yes",
        "yes",
      ],
    ],
  );
  const fashionParsed = await parseCatalogImportWorkbook(fashionBuf);
  const fRow = fashionParsed.rows[0];
  const fGroups = fRow ? buildOptionGroupsFromImportRow(fRow) : [];
  assert(
    "fashion filled row: sizes+colors imported",
    fashionParsed.errors.length === 0 &&
      fRow?.sizes.length === 4 &&
      fRow?.colors.length === 3 &&
      fGroups.some((g) => g.label === "Size") &&
      fGroups.some((g) => g.label === "Color"),
    JSON.stringify({ sizes: fRow?.sizes, colors: fRow?.colors, groups: fGroups.map((g) => g.label) }),
  );
  assert(
    "fashion cols include sizes/colors",
    fashionCols.includes("sizes") && fashionCols.includes("colors"),
  );

  // ── Food filled row with priced add-ons ──────────────────────────────────
  const foodBuf = await buildFilledSheet(
    [
      "section_name",
      "name",
      "price",
      "description",
      "calories",
      "protein_g",
      "removable_ingredients",
      "add_on_ingredients",
      "sold_by_weight",
      "track_stock",
      "is_available",
    ],
    [
      [
        "Burgers",
        "Classic Burger",
        8.5,
        "Beef patty",
        650,
        32,
        "Onions, Pickles",
        "Cheese:1.5 | Bacon:2 | Egg:1",
        "no",
        "yes",
        "yes",
      ],
    ],
  );
  const foodParsed = await parseCatalogImportWorkbook(foodBuf);
  const foodRow = foodParsed.rows[0];
  assert(
    "food filled row: priced add-ons",
    foodParsed.errors.length === 0 &&
      foodRow?.removableIngredients.length === 2 &&
      foodRow?.addOnIngredients.length === 3 &&
      foodRow?.addOnIngredients[0]!.price === 1.5 &&
      foodRow?.addOnIngredients[1]!.price === 2 &&
      foodRow?.addOnIngredients[2]!.price === 1,
    JSON.stringify(foodRow?.addOnIngredients),
  );

  // ── Electronics filled row ───────────────────────────────────────────────
  const elecBuf = await buildFilledSheet(
    ["section_name", "name", "price", "storage_options", "colors", "description", "track_stock", "is_available"],
    [["Phones", "Galaxy A", 299, "128GB, 256GB", "Black, Blue", "Midrange", "no", "yes"]],
  );
  const elecParsed = await parseCatalogImportWorkbook(elecBuf);
  const eRow = elecParsed.rows[0];
  const eGroups = eRow ? buildOptionGroupsFromImportRow(eRow) : [];
  assert(
    "electronics filled row: Storage+Color",
    eRow?.storageOptions.length === 2 &&
      eGroups.some((g) => g.label === "Storage") &&
      eGroups.some((g) => g.label === "Color"),
    eGroups.map((g) => `${g.label}:${g.values.map((v) => v.name).join("/")}`).join(" | "),
  );

  // ── Deny >50 ─────────────────────────────────────────────────────────────
  const many = Array.from({ length: 51 }, (_, i) => [
    "A",
    `Item ${i + 1}`,
    5,
    "",
    "no",
    "yes",
  ]);
  const over = await parseCatalogImportWorkbook(
    await buildFilledSheet(
      ["section_name", "name", "price", "description", "track_stock", "is_available"],
      many,
    ),
  );
  assert(
    `deny over ${CATALOG_IMPORT_MAX_ROWS} rows`,
    over.rows.length === 0 && over.errors.some((e) => /too many|max 50/i.test(e.message)),
    over.errors[0]?.message,
  );

  // ── Helpers ──────────────────────────────────────────────────────────────
  assert("comma list", parseCommaList("S, M | L").join("-") === "S-M-L");
  assert(
    "addon list prices",
    parseAddOnList("Cheese:1 | FreeSauce").length === 2 &&
      parseAddOnList("Cheese:1 | FreeSauce")[1]!.price === 0,
  );

  console.log("\n────────────────────────────────────────");
  console.log(
    failed === 0
      ? `ALL ${checks.length} CHECKS PASSED — safe to deploy import feature`
      : `${failed}/${checks.length} FAILED — fix before production`,
  );
  if (failed > 0) process.exit(1);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
