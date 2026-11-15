import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { backofficeAccess } from "@/lib/access";

export const dynamic = "force-dynamic";
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(_request: Request, context: { params: Promise<{ orderId: string }> }) {
  const status = backofficeAccess(await auth());
  if (status) return NextResponse.json({ error: status === 401 ? "Sign in required" : "Admin role required" }, { status });
  const { orderId } = await context.params;
  if (!uuid.test(orderId)) return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
  try {
    const response = await fetch(`${process.env.ORDER_SERVICE_URL ?? "http://localhost:8083"}/orders/${orderId}`, { cache: "no-store" });
    return new Response(await response.text(), {
      status: response.status,
      headers: { "content-type": response.headers.get("content-type") ?? "application/json" },
    });
  } catch {
    return NextResponse.json({ error: "Order Service unavailable" }, { status: 502 });
  }
}
