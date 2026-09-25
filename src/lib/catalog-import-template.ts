import {
  CATALOG_IMPORT_COLUMN_META,
  CATALOG_IMPORT_MAX_ROWS,
  CATALOG_IMPORT_SHEET_NAME,
  catalogImportColumnsForProfile,
  catalogImportSampleRows,
  normalizeImportHeader,
  parseCatalogImportRecords,
  type CatalogImportColumn,
  type CatalogImportProfile,
  type CatalogImportRow,
  type CatalogImportRowError,
} from "@/lib/catalog-import";
import { getExcelJS } from "@/lib/load-exceljs";

export type CatalogTemplateOptions = {
  profile: CatalogImportProfile;
  hasBrands?: boolean;
  storeName?: string;
};

export async function buildCatalogImportTemplateBuffer(
  options: CatalogTemplateOptions,
): Promise<Buffer> {
  const columns = catalogImportColumnsForProfile(options.profile, {
    hasBrands: options.hasBrands,
  });
  const { Workbook } = getExcelJS();
  const workbook = new Workbook();
  workbook.creator = "Zboun";
  workbook.created = new Date();

  const instructions = workbook.addWorksheet("Instructions");
  instructions.getColumn(1).width = 96;
  const columnLines = columns.map((key) => {
    const meta = CATALOG_IMPORT_COLUMN_META[key];
    return `• ${key}  →  ${meta.formLabel}${meta.required ? " *" : ""} — ${meta.hint}`;
  });
  const lines = [
    "Zboun catalog import template",
    options.storeName ? `Store: ${options.storeName}` : "",
    "",
    "This file matches the fields on your Dashboard → Add item form for this store type.",
    "Main photo: Zboun generates a placeholder (replace later). Color options get color swatches.",
    "",
    "How to use:",
    "1. Fill the Items sheet (do not rename column headers in row 1).",
    `2. Import at most ${CATALOG_IMPORT_MAX_ROWS} rows per upload.`,
    "3. Lists use commas — e.g. sizes: XS, S, M, L  ·  colors: Black, White, Navy",
    "4. Delete the sample rows before importing (or edit them).",
    "5. Save as .xlsx and upload from Catalog → Import Excel.",
    "",
    "Columns in this template (same as your add form):",
    ...columnLines,
  ].filter((line) => line !== undefined);

  lines.forEach((line, i) => {
    const cell = instructions.getCell(i + 1, 1);
    cell.value = line;
    cell.font = i === 0 ? { bold: true, size: 14 } : { size: 11 };
  });

  const sheet = workbook.addWorksheet(CATALOG_IMPORT_SHEET_NAME);
  sheet.columns = columns.map((key) => ({
    header: key,
    key,
    width:
      key === "description" || key === "contents"
        ? 36
        : key === "section_name" || key === "name"
          ? 22
          : 16,
  }));

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF5B21B6" },
  };
  headerRow.alignment = { vertical: "middle" };

  // Row 2: human labels matching the add form (helpers only — ignored by importer)
  const labelRow = sheet.addRow(
    columns.map((key) => CATALOG_IMPORT_COLUMN_META[key].formLabel),
  );
  labelRow.font = { italic: true, color: { argb: "FF64748B" }, size: 10 };
  labelRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF1F5F9" },
  };

  for (const sample of catalogImportSampleRows(columns)) {
    sheet.addRow(columns.map((key) => sample[key] ?? ""));
  }

  // Freeze header + label rows
  sheet.views = [{ state: "frozen", ySplit: 2 }];

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export async function parseCatalogImportWorkbook(
  fileBuffer: ArrayBuffer | Buffer,
): Promise<{ rows: CatalogImportRow[]; errors: CatalogImportRowError[] }> {
  const { Workbook } = getExcelJS();
  const workbook = new Workbook();
  const bytes = Buffer.isBuffer(fileBuffer) ? fileBuffer : Buffer.from(fileBuffer);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await workbook.xlsx.load(bytes as any);

  const sheet =
    workbook.getWorksheet(CATALOG_IMPORT_SHEET_NAME) ??
    workbook.worksheets.find((ws) => ws.name.toLowerCase() === "items") ??
    workbook.worksheets[0];

  if (!sheet) {
    return { rows: [], errors: [{ rowNumber: 1, message: "No worksheet found in the Excel file." }] };
  }

  const headerCells: unknown[] = [];
  sheet.getRow(1).eachCell({ includeEmpty: true }, (cell, colNumber) => {
    headerCells[colNumber - 1] = cell.value;
  });

  const columnMap: Array<CatalogImportColumn | null> = headerCells.map((h) =>
    normalizeImportHeader(h),
  );
  if (!columnMap.includes("section_name") || !columnMap.includes("name")) {
    return {
      rows: [],
      errors: [
        {
          rowNumber: 1,
          message:
            "Missing required columns. Download a fresh template from your store (section_name, name).",
        },
      ],
    };
  }
  if (!columnMap.includes("price") && !columnMap.includes("price_per_kg")) {
    return {
      rows: [],
      errors: [
        {
          rowNumber: 1,
          message: "Missing price columns. Need price and/or price_per_kg (same as the add form).",
        },
      ],
    };
  }

  const records: Array<Record<string, unknown>> = [];
  const rowCount = sheet.rowCount;
  for (let r = 2; r <= rowCount; r++) {
    const row = sheet.getRow(r);
    const record: Record<string, unknown> = {};
    let anyValue = false;

    // Skip the human label helper row (row 2 in new templates)
    const firstCell = String(row.getCell(1).value ?? "").trim().toLowerCase();
    if (firstCell === "section" || firstCell === CATALOG_IMPORT_COLUMN_META.section_name.formLabel.toLowerCase()) {
      const looksLikeLabelRow = columnMap.every((col, i) => {
        if (!col) return true;
        const cellVal = String(row.getCell(i + 1).value ?? "").trim().toLowerCase();
        if (!cellVal) return true;
        return cellVal === CATALOG_IMPORT_COLUMN_META[col].formLabel.toLowerCase();
      });
      if (looksLikeLabelRow) continue;
    }

    columnMap.forEach((col, i) => {
      if (!col) return;
      const value = row.getCell(i + 1).value;
      if (value != null && String(value).trim() !== "") anyValue = true;
      record[col] = value;
    });
    if (anyValue) {
      record.__sheetRow = r;
      records.push(record);
    }
  }

  if (records.length > CATALOG_IMPORT_MAX_ROWS) {
    return {
      rows: [],
      errors: [
        {
          rowNumber: 1,
          message: `Too many rows (${records.length}). Max ${CATALOG_IMPORT_MAX_ROWS} items per import.`,
        },
      ],
    };
  }

  return parseCatalogImportRecords(records);
}
