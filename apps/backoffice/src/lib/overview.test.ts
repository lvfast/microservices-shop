import { describe, expect, it, vi } from "vitest";
import { getOverview } from "./overview";

describe("admin overview", () => {
  it("combines catalog and inventory counts", async () => {
    const request = vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      if (url.endsWith("/products")) return Response.json([
        { id: 1, name: "Áo thun", description: "Cotton", price: 199000 },
        { id: 2, name: "Túi vải", description: "Canvas", price: 99000 },
      ]);
      if (url.endsWith("/inventory/1")) return Response.json({ available: 8 });
      if (url.endsWith("/inventory/2")) return Response.json({ available: 5 });
      throw new Error(url);
    });
    const overview = await getOverview(request as typeof fetch, "http://products", "http://inventory");
    expect(overview.totalProducts).toBe(2);
    expect(overview.totalUnits).toBe(13);
    expect(overview.products[0].available).toBe(8);
  });
});
