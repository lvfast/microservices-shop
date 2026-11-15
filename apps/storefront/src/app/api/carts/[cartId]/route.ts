import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(_request: Request, context: { params: Promise<{ cartId: string }> }) {
  const { cartId } = await context.params;
  if (!uuid.test(cartId)) return NextResponse.json({ error: "Invalid cart ID" }, { status: 400 });
  try {
    const response = await fetch(`${process.env.CART_SERVICE_URL ?? "http://localhost:8081"}/carts/${cartId}`, { cache: "no-store" });
    return new Response(await response.text(), {
      status: response.status,
      headers: { "content-type": response.headers.get("content-type") ?? "application/json" },
    });
  } catch {
    return NextResponse.json({ error: "Cart Service unavailable" }, { status: 502 });
  }
}
