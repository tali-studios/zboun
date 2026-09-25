import { createRequire } from "node:module";

/** Load exceljs from node_modules (avoid Next/webpack bundling breaking xlsx.load). */
const nodeRequire = createRequire(import.meta.url);

export type ExcelJsModule = typeof import("exceljs");

let cached: ExcelJsModule | null = null;

export function getExcelJS(): ExcelJsModule {
  if (!cached) {
    cached = nodeRequire("exceljs") as ExcelJsModule;
  }
  return cached;
}
