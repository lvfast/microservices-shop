import { describe, expect, it, vi } from "vitest";
import { getCatalog } from "./catalog";

describe("catalog aggregation", () => {
  it("joins products with live stock", async () => {
    const request = vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      if (url.endsWith("/products")) {
        return Response.json([{ id: 1, name: "Áo thun", description: "Cotton", price: 199000 }]);
      }
      if (url.endsWith("/inventory/1")) {
        return Response.json({ productId: 1, available: 8 });
      }
      throw new Error(`Unexpected URL: ${url}`);
    });

    const result = await getCatalog(request as typeof fetch, "http://product", "http://inventory");

    expect(result).toEqual([{ id: 1, name: "Áo thun", description: "Cotton", price: 199000, available: 8 }]);
    expect(request).toHaveBeenCalledTimes(2);
  });

  it("surfaces inventory failures", async () => {
    const request = vi.fn(async (input: string | URL | Request) =>
      String(input).endsWith("/products")
        ? Response.json([{ id: 1, name: "Áo thun", description: "Cotton", price: 199000 }])
        : new Response(null, { status: 503 }),
    );
    await expect(getCatalog(request as typeof fetch, "http://product", "http://inventory"))
      .rejects.toThrow("Inventory Service");
  });
});
