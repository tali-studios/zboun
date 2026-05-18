import { readFileSync } from "node:fs";
import { join } from "node:path";
import { jsPDF } from "jspdf";
import { ZBOUN_PRICING } from "@/lib/pricing";

export type ContractPdfParams = {
  restaurantName: string;
  adminEmail: string;
  effectiveDate: Date;
  subscriptionEndDate: Date;
  monthlyPrice?: number;
};

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function fillTemplate(raw: string, params: ContractPdfParams) {
  const price = params.monthlyPrice ?? ZBOUN_PRICING.monthly;
  return raw
    .replace(/\[DATE\]/g, formatDate(params.effectiveDate))
    .replace(/\[RESTAURANT LEGAL NAME\]/g, params.restaurantName)
    .replace(/\[OPERATOR LEGAL NAME\]/g, "Zboun")
    .replace(/\[ENTITY TYPE, e\.g\. limited liability company\]/g, "platform operator")
    .replace(/\[ENTITY TYPE\]/g, "business")
    .replace(/\[JURISDICTION\]/g, "Lebanon")
    .replace(/\[ADDRESS\]/g, "Lebanon")
    .replace(/\[ORDER FORM \/ PRICING PAGE \/ INVOICE\]/g, `USD ${price.toFixed(2)} per month`)
    .replace(/\[RATE\]%/g, "0")
    .replace(/\[NUMBER\]/g, "30")
    .replace(/\[CURRENCY AMOUNT\]/g, String(price))
    .replace(/\[THREE\]/g, "three")
    .replace(/\[EMAIL \/ ADDRESS\]/g, "zbounlb@outlook.com")
    .replace(/\[VENUE\]/g, "Lebanon")
    .replace(/\[English\]/g, "English")
    .replace(/«OPTIONAL»/g, "")
    .replace(/\*\*/g, "");
}

/** Professional service agreement PDF for email attachment. */
export function generateContractPdfBuffer(params: ContractPdfParams): Buffer {
  const templatePath = join(
    process.cwd(),
    "contracts",
    "RESTAURANT-PLATFORM-SERVICE-AGREEMENT-TEMPLATE.md",
  );
  const template = readFileSync(templatePath, "utf-8");
  const filled = fillTemplate(template, params);

  const cover = [
    "ZBOUN — RESTAURANT PLATFORM SERVICE AGREEMENT",
    "",
    `Restaurant: ${params.restaurantName}`,
    `Administrator email: ${params.adminEmail}`,
    `Effective date: ${formatDate(params.effectiveDate)}`,
    `Current subscription period ends: ${formatDate(params.subscriptionEndDate)}`,
    `Monthly fee: USD ${(params.monthlyPrice ?? ZBOUN_PRICING.monthly).toFixed(2)}`,
    "",
    "—",
    "",
    filled,
  ].join("\n");

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const margin = 14;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = pageWidth - margin * 2;
  const lineHeight = 5;
  let y = margin;

  const lines = doc.splitTextToSize(cover, maxWidth) as string[];

  for (const line of lines) {
    if (y > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
    doc.setFont("helvetica", line.startsWith("ZBOUN") ? "bold" : "normal");
    doc.setFontSize(line.startsWith("###") ? 11 : 9);
    const text = line.replace(/^#+\s*/, "");
    doc.text(text, margin, y);
    y += lineHeight;
  }

  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}

export function contractPdfFilename(restaurantName: string) {
  const slug = restaurantName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `zboun-service-agreement-${slug || "restaurant"}.pdf`;
}
