import { describe, expect, it } from "vitest";
import { POST } from "../app/api/carts/[cartId]/items/route";

describe("cart BFF input", () => {
  it("rejects JSON null without calling Cart Service", async () => {
    const response = await POST(
      new Request("http://localhost/api/carts/00000000-0000-0000-0000-000000000001/items", {
        method: "POST", headers: { "content-type": "application/json" }, body: "null",
      }),
      { params: Promise.resolve({ cartId: "00000000-0000-0000-0000-000000000001" }) },
    );
    expect(response.status).toBe(400);
  });
});
