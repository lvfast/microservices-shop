export type StockedProduct = { id: number; name: string; description: string; price: number; available: number };
export type Overview = { totalProducts: number; totalUnits: number; products: StockedProduct[] };

export async function getOverview(
  request: typeof fetch = fetch,
  productUrl = process.env.PRODUCT_SERVICE_URL ?? "http://localhost:8080",
  inventoryUrl = process.env.INVENTORY_SERVICE_URL ?? "http://localhost:8082",
): Promise<Overview> {
  const productsResponse = await request(`${productUrl}/products`, { cache: "no-store" });
  if (!productsResponse.ok) throw new Error(`Product Service returned ${productsResponse.status}`);
  const products: Omit<StockedProduct, "available">[] = await productsResponse.json();
  if (!Array.isArray(products)) throw new Error("Product Service returned invalid data");
  const stocked = await Promise.all(products.map(async product => {
    const response = await request(`${inventoryUrl}/inventory/${product.id}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`Inventory Service returned ${response.status}`);
    const stock: { available: number } = await response.json();
    if (!Number.isInteger(stock.available) || stock.available < 0) throw new Error("Inventory Service returned invalid data");
    return { ...product, available: stock.available };
  }));
  return { totalProducts: stocked.length, totalUnits: stocked.reduce((sum, product) => sum + product.available, 0), products: stocked };
}
