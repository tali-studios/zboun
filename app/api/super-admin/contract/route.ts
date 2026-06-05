import { NextResponse } from "next/server";
import { contractPdfFilename, generateContractPdfBuffer } from "@/lib/contract-pdf";
import { getCurrentUserRole } from "@/lib/data";
import { ZBOUN_PRICING } from "@/lib/pricing";

export const dynamic = "force-dynamic";

function parseDateInput(value: unknown): Date | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const d = new Date(`${value}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function POST(request: Request) {
  const appUser = await getCurrentUserRole();
  if (!appUser || appUser.role !== "superadmin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const data = body as Record<string, unknown>;
  const restaurantName = String(data.restaurantName ?? "").trim();
  const adminEmail = String(data.adminEmail ?? "").trim();
  const effectiveDate = parseDateInput(data.effectiveDate);
  const subscriptionEndDate = parseDateInput(data.subscriptionEndDate);

  if (!restaurantName) {
    return NextResponse.json({ error: "Restaurant name is required" }, { status: 400 });
  }
  if (!adminEmail || !adminEmail.includes("@")) {
    return NextResponse.json({ error: "A valid administrator email is required" }, { status: 400 });
  }
  if (!effectiveDate) {
    return NextResponse.json({ error: "Effective date is required" }, { status: 400 });
  }
  if (!subscriptionEndDate) {
    return NextResponse.json({ error: "Subscription end date is required" }, { status: 400 });
  }
  if (subscriptionEndDate < effectiveDate) {
    return NextResponse.json(
      { error: "Subscription end date must be on or after the effective date" },
      { status: 400 },
    );
  }

  const pdf = await generateContractPdfBuffer({
    restaurantName,
    adminEmail,
    effectiveDate,
    subscriptionEndDate,
    monthlyPrice: ZBOUN_PRICING.monthly,
  });

  const filename = contractPdfFilename(restaurantName);
  return new NextResponse(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
