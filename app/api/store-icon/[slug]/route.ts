import { NextResponse, type NextRequest } from "next/server";
import { getRestaurantBySlug } from "@/lib/data";
import { parseStoreIconSize, renderStoreIconPng } from "@/lib/store-icon";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

type Props = {
  params: Promise<{ slug: string }>;
};

export const runtime = "nodejs";

async function fallbackZbounIcon(size: number): Promise<Buffer> {
  const file =
    size === 180
      ? "apple-touch-icon.png"
      : size === 512
        ? "icon-512.png"
        : "icon-192.png";
  return readFile(join(process.cwd(), "public", file));
}

export async function GET(request: NextRequest, { params }: Props) {
  const { slug } = await params;
  const size = parseStoreIconSize(request.nextUrl.searchParams.get("size"));
  const restaurant = await getRestaurantBySlug(slug);

  if (!restaurant || !restaurant.is_active) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const logoUrl = restaurant.logo_url?.trim();
    const png = logoUrl
      ? await renderStoreIconPng(logoUrl, size)
      : await fallbackZbounIcon(size);

    return new NextResponse(new Uint8Array(png), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    try {
      const png = await fallbackZbounIcon(size);
      return new NextResponse(new Uint8Array(png), {
        status: 200,
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=300",
        },
      });
    } catch {
      return new NextResponse("Icon unavailable", { status: 500 });
    }
  }
}
