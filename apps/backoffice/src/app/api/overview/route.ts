import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { backofficeAccess } from "@/lib/access";
import { getOverview } from "@/lib/overview";

export const dynamic = "force-dynamic";

export async function GET() {
  const status = backofficeAccess(await auth());
  if (status) return NextResponse.json({ error: status === 401 ? "Sign in required" : "Admin role required" }, { status });
  try {
    return NextResponse.json(await getOverview());
  } catch (error) {
    console.error("Overview aggregation failed", error);
    return NextResponse.json({ error: "Overview unavailable" }, { status: 502 });
  }
}
