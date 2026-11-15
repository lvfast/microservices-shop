import { NextResponse } from "next/server";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request, context: { params: Promise<{ cartId: string }> }) {
  const { cartId } = await context.params;
  if (!uuid.test(cartId)) return NextResponse.json({ error: "Invalid cart ID" }, { status: 400 });
  let body: { productId?: number; quantity?: number };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  if (!body || typeof body !== "object" || !Number.isSafeInteger(body.productId) || !Number.isSafeInteger(body.quantity)
      || body.productId! <= 0 || body.quantity! <= 0) {
    return NextResponse.json({ error: "Invalid item" }, { status: 400 });
  }
  try {
    const response = await fetch(`${process.env.CART_SERVICE_URL ?? "http://localhost:8081"}/carts/${cartId}/items`, {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body), cache: "no-store",
    });
    return new Response(await response.text(), {
      status: response.status,
      headers: { "content-type": response.headers.get("content-type") ?? "application/json" },
    });
  } catch {
    return NextResponse.json({ error: "Cart Service unavailable" }, { status: 502 });
  }
}
