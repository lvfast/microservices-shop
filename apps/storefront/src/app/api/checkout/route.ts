import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { checkoutAccess } from "@/lib/access";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  const status = checkoutAccess(await auth());
  if (status) return NextResponse.json({ error: status === 401 ? "Sign in required" : "Customer role required" }, { status });
  let body: { checkoutKey?: string; cartId?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  if (!body || typeof body !== "object" || !body.checkoutKey || !body.cartId || !uuid.test(body.checkoutKey) || !uuid.test(body.cartId)) {
    return NextResponse.json({ error: "Invalid checkout request" }, { status: 400 });
  }
  try {
    const response = await fetch(`${process.env.ORDER_SERVICE_URL ?? "http://localhost:8083"}/checkouts`, {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body), cache: "no-store",
    });
    return new Response(await response.text(), {
      status: response.status,
      headers: { "content-type": response.headers.get("content-type") ?? "application/json" },
    });
  } catch {
    return NextResponse.json({ error: "Order Service unavailable" }, { status: 502 });
  }
}
