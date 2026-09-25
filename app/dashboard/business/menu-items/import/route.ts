import { NextResponse } from "next/server";
import { getCurrentUserRole } from "@/lib/data";
import { CATALOG_IMPORT_MAX_ROWS } from "@/lib/catalog-import";
import { parseCatalogImportWorkbook } from "@/lib/catalog-import-template";
import {
  executeCatalogExcelImport,
  type CatalogImportActionResult,
} from "@/lib/catalog-import-run";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request): Promise<NextResponse<CatalogImportActionResult>> {
  const user = await getCurrentUserRole();
  if (!user || user.role !== "restaurant_admin" || !user.restaurant_id) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid upload. Try again." },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { ok: false, error: "Choose an Excel .xlsx file to import." },
      { status: 400 },
    );
  }
  if (file.size > 4 * 1024 * 1024) {
    return NextResponse.json(
      { ok: false, error: "File is too large (max 4MB)." },
      { status: 400 },
    );
  }
  const nameLower = file.name.toLowerCase();
  if (!nameLower.endsWith(".xlsx") && !nameLower.endsWith(".xlsm")) {
    return NextResponse.json(
      { ok: false, error: "Upload the official .xlsx template." },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let parsed;
  try {
    parsed = await parseCatalogImportWorkbook(buffer);
  } catch (error) {
    console.error("[catalog-import] parse failed", error);
    return NextResponse.json(
      {
        ok: false,
        error: "Could not read the Excel file. Download a fresh template and try again.",
      },
      { status: 400 },
    );
  }

  if (parsed.errors.length && parsed.rows.length === 0) {
    return NextResponse.json(
      {
        ok: false,
        error: parsed.errors[0]?.message ?? "Could not read the Excel file.",
        errors: parsed.errors,
      },
      { status: 400 },
    );
  }

  if (parsed.rows.length === 0) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "No valid item rows found. Use the Items sheet, keep row 1 headers, and fill section_name, name, and price on each row (row 2 is labels only).",
      },
      { status: 400 },
    );
  }

  if (parsed.rows.length > CATALOG_IMPORT_MAX_ROWS) {
    return NextResponse.json(
      {
        ok: false,
        error: `Max ${CATALOG_IMPORT_MAX_ROWS} items per import. Split your file and try again.`,
      },
      { status: 400 },
    );
  }

  const result = await executeCatalogExcelImport(user.restaurant_id, parsed);
  const status = result.ok ? 200 : 400;
  return NextResponse.json(result, { status });
}
