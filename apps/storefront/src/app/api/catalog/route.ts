import { NextResponse } from "next/server";
import { getCatalog } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await getCatalog());
  } catch (error) {
    console.error("Catalog aggregation failed", error);
    return NextResponse.json({ error: "Catalog unavailable" }, { status: 502 });
  }
}
