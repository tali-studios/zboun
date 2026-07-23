import { NextResponse } from "next/server";
import { searchHomeMenuItems } from "@/lib/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const section = searchParams.get("section") ?? "all";

  if (!q.trim()) {
    return NextResponse.json({ items: [] });
  }

  try {
    const items = await searchHomeMenuItems(q, { section });
    return NextResponse.json({ items });
  } catch (err) {
    console.error("[api/search/items]", err);
    return NextResponse.json({ items: [], error: "search_failed" }, { status: 500 });
  }
}
