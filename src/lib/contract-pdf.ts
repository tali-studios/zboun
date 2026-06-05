import { jsPDF } from "jspdf";
import { ZBOUN_PRICING } from "@/lib/pricing";
import {
  CONTRACT_OPERATOR,
  CONTRACT_SECTIONS,
  ZBOUN_PLATFORM_SERVICES,
} from "@/lib/contract-content";
import {
  getSignatureLogo,
  loadHeaderLogoFromSvg,
  type ContractLogoAsset,
} from "@/lib/contract-logo";

export type ContractPdfParams = {
  restaurantName: string;
  adminEmail: string;
  effectiveDate: Date;
  subscriptionEndDate: Date;
  monthlyPrice?: number;
};

/** Professional black & white palette */
const INK: [number, number, number] = [0, 0, 0];
const INK_BODY: [number, number, number] = [45, 45, 45];
const INK_MUTED: [number, number, number] = [100, 100, 100];
const INK_FAINT: [number, number, number] = [140, 140, 140];
const RULE: [number, number, number] = [200, 200, 200];
const PANEL_BG: [number, number, number] = [248, 248, 248];

const MARGIN = 18;
const FOOTER_Y_OFFSET = 12;

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

class ContractPdfDocument {
  private doc: jsPDF;
  private y = 0;
  private readonly pageWidth: number;
  private readonly pageHeight: number;
  private readonly contentWidth: number;
  private readonly headerLogo: ContractLogoAsset | null;
  private readonly signatureLogo: ContractLogoAsset | null;

  constructor(logos: {
    headerLogo: ContractLogoAsset | null;
    signatureLogo: ContractLogoAsset | null;
  }) {
    this.doc = new jsPDF({ unit: "mm", format: "a4" });
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.contentWidth = this.pageWidth - MARGIN * 2;
    this.headerLogo = logos.headerLogo;
    this.signatureLogo = logos.signatureLogo;
  }

  private addLogoImage(
    asset: ContractLogoAsset,
    x: number,
    y: number,
    maxWidth: number,
    maxHeight: number,
  ) {
    const scale = Math.min(maxWidth / asset.width, maxHeight / asset.height);
    const w = asset.width * scale;
    const h = asset.height * scale;
    this.doc.addImage(`data:image/png;base64,${asset.base64}`, "PNG", x, y, w, h);
    return { w, h };
  }

  private footerLabel() {
    return "Zboun — Restaurant Platform Service Agreement — Confidential";
  }

  private addFooterRule() {
    const y = this.pageHeight - FOOTER_Y_OFFSET;
    this.doc.setDrawColor(...RULE);
    this.doc.setLineWidth(0.2);
    this.doc.line(MARGIN, y - 4, this.pageWidth - MARGIN, y - 4);
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(7.5);
    this.doc.setTextColor(...INK_FAINT);
    this.doc.text(this.footerLabel(), MARGIN, y);
  }

  private startBodyPage(pageNum: number) {
    this.doc.addPage();
    this.y = MARGIN + 4;
    this.doc.setDrawColor(...INK);
    this.doc.setLineWidth(0.35);
    this.doc.line(MARGIN, 11, this.pageWidth - MARGIN, 11);
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(7.5);
    this.doc.setTextColor(...INK_MUTED);
    this.doc.text("ZBOUN  ·  RESTAURANT PLATFORM SERVICE AGREEMENT", MARGIN, 9);
    this.addFooterRule();
    this.doc.setTextColor(...INK);
    this.y = MARGIN + 8;
  }

  private ensureSpace(needed: number, pageNum: { value: number }) {
    if (this.y + needed <= this.pageHeight - MARGIN - FOOTER_Y_OFFSET - 4) return;
    this.startBodyPage(pageNum.value);
    pageNum.value += 1;
  }

  private drawWrapped(
    text: string,
    opts: {
      fontSize?: number;
      bold?: boolean;
      color?: [number, number, number];
      indent?: number;
      lineHeight?: number;
      pageNum: { value: number };
    },
  ) {
    const fontSize = opts.fontSize ?? 9;
    const lineHeight = opts.lineHeight ?? fontSize * 0.48;
    const indent = opts.indent ?? 0;
    this.doc.setFont("helvetica", opts.bold ? "bold" : "normal");
    this.doc.setFontSize(fontSize);
    this.doc.setTextColor(...(opts.color ?? INK_BODY));
    const lines = this.doc.splitTextToSize(text, this.contentWidth - indent) as string[];
    for (const line of lines) {
      this.ensureSpace(lineHeight + 1, opts.pageNum);
      this.doc.text(line, MARGIN + indent, this.y);
      this.y += lineHeight;
    }
  }

  private drawTitlePage(params: ContractPdfParams) {
    const price = params.monthlyPrice ?? ZBOUN_PRICING.monthly;
    let contentTop = MARGIN;

    if (this.headerLogo) {
      const logo = this.addLogoImage(this.headerLogo, MARGIN, MARGIN, 78, 22);
      contentTop = MARGIN + logo.h + 8;
    } else {
      this.doc.setFont("helvetica", "bold");
      this.doc.setFontSize(22);
      this.doc.setTextColor(...INK);
      this.doc.text("ZBOUN", MARGIN, MARGIN + 8);
      contentTop = MARGIN + 14;
    }

    this.doc.setDrawColor(...INK);
    this.doc.setLineWidth(0.5);
    this.doc.line(MARGIN, contentTop, this.pageWidth - MARGIN, contentTop);
    contentTop += 8;

    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(13);
    this.doc.setTextColor(...INK);
    this.doc.text("Restaurant Platform Service Agreement", MARGIN, contentTop);

    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(9);
    this.doc.setTextColor(...INK_MUTED);
    this.doc.text("Subscription & platform services", MARGIN, contentTop + 6);

    this.y = contentTop + 16;

    this.drawWrapped("SERVICE AGREEMENT", {
      fontSize: 12,
      bold: true,
      color: INK,
      pageNum: { value: 1 },
    });
    this.y += 2;
    this.drawWrapped(
      "This agreement governs the Restaurant’s access to the Zboun platform, including digital menus, ordering tools, and related services.",
      { fontSize: 9.5, color: INK_BODY, pageNum: { value: 1 } },
    );
    this.y += 6;

    const boxY = this.y;
    const boxH = 52;
    this.doc.setDrawColor(...RULE);
    this.doc.setFillColor(...PANEL_BG);
    this.doc.setLineWidth(0.35);
    this.doc.roundedRect(MARGIN, boxY, this.contentWidth, boxH, 2, 2, "FD");

    const rows: [string, string][] = [
      ["Restaurant", params.restaurantName],
      ["Administrator email", params.adminEmail],
      ["Effective date", formatDate(params.effectiveDate)],
      ["Current period ends", formatDate(params.subscriptionEndDate)],
      ["Monthly subscription fee", `USD ${price.toFixed(2)}`],
      ["Operator", `${CONTRACT_OPERATOR.legalName} · ${CONTRACT_OPERATOR.contactEmail}`],
    ];

    let rowY = boxY + 9;
    for (const [label, value] of rows) {
      this.doc.setFont("helvetica", "normal");
      this.doc.setFontSize(7.5);
      this.doc.setTextColor(...INK_FAINT);
      this.doc.text(label.toUpperCase(), MARGIN + 6, rowY);
      this.doc.setFont("helvetica", "bold");
      this.doc.setFontSize(9.5);
      this.doc.setTextColor(...INK);
      const valueLines = this.doc.splitTextToSize(value, this.contentWidth - 58) as string[];
      this.doc.text(valueLines[0], MARGIN + 52, rowY);
      rowY += 7.5;
    }

    this.y = boxY + boxH + 12;

    this.drawWrapped("PARTIES", { fontSize: 10, bold: true, color: INK, pageNum: { value: 1 } });
    this.y += 1;
    this.drawWrapped(
      `This Agreement is entered into as of the Effective Date by and between ${CONTRACT_OPERATOR.legalName} (“Operator”), with principal operations in ${CONTRACT_OPERATOR.address}, and ${params.restaurantName} (“Restaurant”). Each is a “Party” and together the “Parties.”`,
      { fontSize: 9, color: INK_BODY, pageNum: { value: 1 } },
    );

    this.addFooterRule();
  }

  private drawAgreementBody(pageNum: { value: number }) {
    this.startBodyPage(pageNum.value);
    pageNum.value += 1;

    for (const section of CONTRACT_SECTIONS) {
      this.y += 3;
      this.drawWrapped(`${section.number}. ${section.title.toUpperCase()}`, {
        fontSize: 10,
        bold: true,
        color: INK,
        pageNum,
      });
      this.y += 1.5;

      section.clauses.forEach((clause, index) => {
        const prefix = section.clauses.length > 1 ? `${section.number}.${index + 1} ` : "";
        this.drawWrapped(`${prefix}${clause}`, {
          fontSize: 9,
          color: INK_BODY,
          pageNum,
        });
        this.y += 1;
      });
    }
  }

  private drawExhibitA(pageNum: { value: number }) {
    this.y += 4;
    this.ensureSpace(20, pageNum);
    this.drawWrapped("EXHIBIT A — SERVICE DESCRIPTION", {
      fontSize: 11,
      bold: true,
      color: INK,
      pageNum,
    });
    this.y += 2;
    this.drawWrapped(
      "The Services include the following platform capabilities made available to the Restaurant during the Subscription Term:",
      { fontSize: 9, color: INK_BODY, pageNum },
    );
    this.y += 2;

    for (const item of ZBOUN_PLATFORM_SERVICES) {
      this.ensureSpace(6, pageNum);
      this.doc.setFillColor(...INK);
      this.doc.circle(MARGIN + 1.5, this.y - 1.2, 0.7, "F");
      this.drawWrapped(item, { fontSize: 9, color: INK_BODY, indent: 6, pageNum });
      this.y += 0.5;
    }
  }

  private drawExhibitB(pageNum: { value: number }) {
    this.y += 4;
    this.ensureSpace(16, pageNum);
    this.drawWrapped("EXHIBIT B — PRIVACY & DATA", {
      fontSize: 11,
      bold: true,
      color: INK,
      pageNum,
    });
    this.y += 2;
    this.drawWrapped(
      "The Restaurant acknowledges that end-customer and order data processed through the Platform is handled in accordance with Operator’s published Privacy Policy and applicable data-protection law. The Restaurant is responsible for lawful collection and use of customer contact information, including any consents required for messaging or marketing.",
      { fontSize: 9, color: INK_BODY, pageNum },
    );
  }

  private drawSignatureBlock(opts: {
    x: number;
    width: number;
    y: number;
    title: string;
    name: string;
    logo?: ContractLogoAsset | null;
  }): number {
    const padX = 6;
    const padTop = 7;
    const padBottom = 7;
    const fieldRowH = 13;
    const fields = ["Signature", "Printed name", "Title", "Date"];

    const nameLines = this.doc.splitTextToSize(opts.name, opts.width - padX * 2) as string[];
    const logoH = opts.logo ? 11 : 0;
    const headerH = padTop + logoH + (logoH ? 2 : 0) + 5 + nameLines.length * 4.2 + 6;
    const boxH = headerH + fields.length * fieldRowH + padBottom;

    this.doc.setDrawColor(...RULE);
    this.doc.setFillColor(255, 255, 255);
    this.doc.setLineWidth(0.35);
    this.doc.roundedRect(opts.x, opts.y, opts.width, boxH, 2, 2, "FD");

    let by = opts.y + padTop;

    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(7.5);
    this.doc.setTextColor(...INK);
    this.doc.text(opts.title, opts.x + padX, by);
    by += 4.5;

    if (opts.logo) {
      this.addLogoImage(opts.logo, opts.x + padX, by - 1, opts.width - padX * 2, logoH);
      by += logoH + 3;
    }

    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(9.5);
    this.doc.setTextColor(...INK);
    this.doc.text(nameLines, opts.x + padX, by);
    by += nameLines.length * 4.2 + 6;

    for (const field of fields) {
      this.doc.setFont("helvetica", "normal");
      this.doc.setFontSize(7.5);
      this.doc.setTextColor(...INK_MUTED);
      this.doc.text(field, opts.x + padX, by);
      const lineY = by + 5;
      this.doc.setDrawColor(...RULE);
      this.doc.setLineWidth(0.25);
      this.doc.line(opts.x + padX, lineY, opts.x + opts.width - padX, lineY);
      by += fieldRowH;
    }

    return boxH;
  }

  private drawSignaturePage(params: ContractPdfParams, pageNum: { value: number }) {
    this.startBodyPage(pageNum.value);
    pageNum.value += 1;
    this.y += 4;

    this.drawWrapped("SIGNATURES", {
      fontSize: 12,
      bold: true,
      color: INK,
      pageNum,
    });
    this.y += 2;
    this.drawWrapped(
      "IN WITNESS WHEREOF, the Parties have executed this Restaurant Platform Service Agreement as of the Effective Date set forth on the cover page.",
      { fontSize: 9, color: INK_BODY, pageNum },
    );
    this.y += 8;

    const colW = (this.contentWidth - 10) / 2;
    const blockY = this.y;
    const leftH = this.drawSignatureBlock({
      x: MARGIN,
      width: colW,
      y: blockY,
      title: "OPERATOR",
      name: CONTRACT_OPERATOR.legalName,
      logo: this.signatureLogo,
    });
    const rightH = this.drawSignatureBlock({
      x: MARGIN + colW + 10,
      width: colW,
      y: blockY,
      title: "RESTAURANT",
      name: params.restaurantName,
    });

    this.y = blockY + Math.max(leftH, rightH) + 10;
    this.drawWrapped(
      `Return a signed copy to ${CONTRACT_OPERATOR.contactEmail} or provide a scanned PDF for your account records.`,
      { fontSize: 8,
        color: INK_FAINT,
        pageNum,
      },
    );
  }

  build(params: ContractPdfParams): Buffer {
    const pageNum = { value: 1 };
    this.drawTitlePage(params);
    this.drawAgreementBody(pageNum);
    this.drawExhibitA(pageNum);
    this.drawExhibitB(pageNum);
    this.drawSignaturePage(params, pageNum);

    const total = this.doc.getNumberOfPages();
    const footerY = this.pageHeight - FOOTER_Y_OFFSET;
    for (let i = 1; i <= total; i++) {
      this.doc.setPage(i);
      this.doc.setFont("helvetica", "normal");
      this.doc.setFontSize(7.5);
      this.doc.setTextColor(...INK_FAINT);
      this.doc.text(`Page ${i} of ${total}`, this.pageWidth - MARGIN, footerY, { align: "right" });
    }

    return Buffer.from(this.doc.output("arraybuffer"));
  }
}

/** Professional service agreement PDF for email attachment or download. */
export async function generateContractPdfBuffer(params: ContractPdfParams): Promise<Buffer> {
  const [headerLogo, signatureLogo] = await Promise.all([
    loadHeaderLogoFromSvg(),
    Promise.resolve(getSignatureLogo()),
  ]);
  return new ContractPdfDocument({ headerLogo, signatureLogo }).build(params);
}

export function contractPdfFilename(restaurantName: string) {
  const slug = restaurantName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `zboun-service-agreement-${slug || "restaurant"}.pdf`;
}
