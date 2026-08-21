import { jsPDF } from "jspdf";
import {
  MERCHANT_TERMS,
  MERCHANT_TERMS_ACCEPTANCE_NOTICE,
  MERCHANT_TERMS_SECTIONS,
} from "@/lib/merchant-terms-content";
import {
  getSignatureLogo,
  loadHeaderLogoFromSvg,
  type ContractLogoAsset,
} from "@/lib/contract-logo";

const INK: [number, number, number] = [0, 0, 0];
const INK_BODY: [number, number, number] = [45, 45, 45];
const INK_MUTED: [number, number, number] = [100, 100, 100];
const INK_FAINT: [number, number, number] = [140, 140, 140];
const RULE: [number, number, number] = [200, 200, 200];
const PANEL_BG: [number, number, number] = [248, 248, 248];

const MARGIN = 18;
const FOOTER_Y_OFFSET = 12;

export type MerchantTermsPdfParams = {
  merchantName?: string | null;
  adminEmail?: string | null;
  issuedAt?: Date;
};

class MerchantTermsPdfDocument {
  private doc: jsPDF;
  private y = 0;
  private readonly pageWidth: number;
  private readonly pageHeight: number;
  private readonly contentWidth: number;
  private readonly headerLogo: ContractLogoAsset | null;

  constructor(headerLogo: ContractLogoAsset | null) {
    this.doc = new jsPDF({ unit: "mm", format: "a4" });
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.contentWidth = this.pageWidth - MARGIN * 2;
    this.headerLogo = headerLogo;
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
    const mime = asset.format === "JPEG" ? "jpeg" : "png";
    this.doc.addImage(
      `data:image/${mime};base64,${asset.base64}`,
      asset.format,
      x,
      y,
      w,
      h,
    );
    return { w, h };
  }

  private addFooterRule() {
    const y = this.pageHeight - FOOTER_Y_OFFSET;
    this.doc.setDrawColor(...RULE);
    this.doc.setLineWidth(0.2);
    this.doc.line(MARGIN, y - 4, this.pageWidth - MARGIN, y - 4);
  }

  private startBodyPage() {
    this.doc.addPage();
    this.doc.setDrawColor(...INK);
    this.doc.setLineWidth(0.35);
    this.doc.line(MARGIN, 11, this.pageWidth - MARGIN, 11);
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(7.5);
    this.doc.setTextColor(...INK_MUTED);
    this.doc.text("ZBOUN  ·  MERCHANT TERMS OF SERVICE", MARGIN, 9);
    this.addFooterRule();
    this.doc.setTextColor(...INK);
    this.y = MARGIN + 8;
  }

  private ensureSpace(needed: number) {
    if (this.y + needed <= this.pageHeight - MARGIN - FOOTER_Y_OFFSET - 4) return;
    this.startBodyPage();
  }

  private drawWrapped(
    text: string,
    opts?: {
      fontSize?: number;
      bold?: boolean;
      color?: [number, number, number];
      indent?: number;
      lineHeight?: number;
    },
  ) {
    const fontSize = opts?.fontSize ?? 9;
    const lineHeight = opts?.lineHeight ?? fontSize * 0.48;
    const indent = opts?.indent ?? 0;
    this.doc.setFont("helvetica", opts?.bold ? "bold" : "normal");
    this.doc.setFontSize(fontSize);
    this.doc.setTextColor(...(opts?.color ?? INK_BODY));
    const lines = this.doc.splitTextToSize(text, this.contentWidth - indent) as string[];
    for (const line of lines) {
      this.ensureSpace(lineHeight + 1);
      this.doc.text(line, MARGIN + indent, this.y);
      this.y += lineHeight;
    }
  }

  private drawAcceptanceBanner() {
    const boxPad = 3.5;
    const text = MERCHANT_TERMS_ACCEPTANCE_NOTICE;
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(8.5);
    const lines = this.doc.splitTextToSize(text, this.contentWidth - boxPad * 2) as string[];
    const lineH = 4;
    const boxH = lines.length * lineH + boxPad * 2;
    this.ensureSpace(boxH + 4);
    this.doc.setFillColor(...PANEL_BG);
    this.doc.setDrawColor(...INK);
    this.doc.setLineWidth(0.3);
    this.doc.rect(MARGIN, this.y, this.contentWidth, boxH, "FD");
    let ty = this.y + boxPad + 3.2;
    this.doc.setTextColor(...INK);
    for (const line of lines) {
      this.doc.text(line, MARGIN + boxPad, ty);
      ty += lineH;
    }
    this.y += boxH + 6;
  }

  build(params: MerchantTermsPdfParams): Buffer {
    let contentTop = MARGIN;

    if (this.headerLogo) {
      const logo = this.addLogoImage(this.headerLogo, MARGIN, MARGIN, 80, 24);
      contentTop = MARGIN + logo.h + 3;
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
    this.doc.setFontSize(14);
    this.doc.setTextColor(...INK);
    this.doc.text(MERCHANT_TERMS.documentTitle, MARGIN, contentTop);

    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(9);
    this.doc.setTextColor(...INK_MUTED);
    this.doc.text(
      `Version ${MERCHANT_TERMS.version}  ·  Effective ${MERCHANT_TERMS.effectiveDateLabel}`,
      MARGIN,
      contentTop + 6,
    );

    this.y = contentTop + 14;
    this.addFooterRule();

    this.drawAcceptanceBanner();

    const issued = params.issuedAt ?? new Date();
    const issuedLabel = issued.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    this.drawWrapped("Document particulars", {
      fontSize: 10,
      bold: true,
      color: INK,
    });
    this.y += 2;
    this.drawWrapped(
      `Operator: ${MERCHANT_TERMS.operator.legalName} (${MERCHANT_TERMS.operator.website})`,
      { fontSize: 9 },
    );
    this.drawWrapped(`Jurisdiction: ${MERCHANT_TERMS.operator.jurisdiction}`, { fontSize: 9 });
    this.drawWrapped(`Contact: ${MERCHANT_TERMS.operator.contactEmail}`, { fontSize: 9 });
    this.drawWrapped(`Issued: ${issuedLabel}`, { fontSize: 9 });
    if (params.merchantName?.trim()) {
      this.drawWrapped(`Merchant: ${params.merchantName.trim()}`, { fontSize: 9 });
    }
    if (params.adminEmail?.trim()) {
      this.drawWrapped(`Merchant admin email: ${params.adminEmail.trim()}`, { fontSize: 9 });
    }
    this.y += 4;

    this.drawWrapped(
      "Please retain this document for your records. Logging into your store account constitutes acceptance of these Terms.",
      { fontSize: 8.5, color: INK_MUTED },
    );
    this.y += 5;

    for (const section of MERCHANT_TERMS_SECTIONS) {
      this.ensureSpace(14);
      this.drawWrapped(`${section.number}. ${section.title}`, {
        fontSize: 10.5,
        bold: true,
        color: INK,
      });
      this.y += 2;
      for (let i = 0; i < section.clauses.length; i += 1) {
        const label = `${section.number}.${i + 1}`;
        this.drawWrapped(`${label}  ${section.clauses[i]}`, {
          fontSize: 8.8,
          color: INK_BODY,
          lineHeight: 4.2,
        });
        this.y += 2.2;
      }
      this.y += 2;
    }

    this.ensureSpace(18);
    this.y += 2;
    this.doc.setDrawColor(...RULE);
    this.doc.setLineWidth(0.2);
    this.doc.line(MARGIN, this.y, this.pageWidth - MARGIN, this.y);
    this.y += 5;
    this.drawWrapped("End of Merchant Terms of Service", {
      fontSize: 8,
      bold: true,
      color: INK_MUTED,
    });
    this.drawWrapped(
      "This document is provided for contractual clarity and Platform protection. For advice specific to your business, consult a licensed attorney in Lebanon.",
      { fontSize: 7.5, color: INK_FAINT },
    );

    const total = this.doc.getNumberOfPages();
    for (let i = 1; i <= total; i += 1) {
      this.doc.setPage(i);
      const footerY = this.pageHeight - FOOTER_Y_OFFSET;
      this.doc.setFont("helvetica", "normal");
      this.doc.setFontSize(7.5);
      this.doc.setTextColor(...INK_FAINT);
      this.doc.text(`Page ${i} of ${total}`, this.pageWidth - MARGIN, footerY, { align: "right" });
    }

    return Buffer.from(this.doc.output("arraybuffer"));
  }
}

export async function generateMerchantTermsPdfBuffer(
  params: MerchantTermsPdfParams = {},
): Promise<Buffer> {
  const [headerLogo] = await Promise.all([loadHeaderLogoFromSvg(), getSignatureLogo()]);
  return new MerchantTermsPdfDocument(headerLogo).build(params);
}

export function merchantTermsPdfFilename(merchantName?: string | null) {
  const slug = (merchantName ?? "merchant")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `zboun-merchant-terms-${slug || "merchant"}.pdf`;
}
