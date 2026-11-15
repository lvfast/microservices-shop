export type CatalogProduct = {
  id: number;
  name: string;
  description: string;
  price: number;
  available: number;
};

type Product = Omit<CatalogProduct, "available">;

export async function getCatalog(
  request: typeof fetch = fetch,
  productUrl = process.env.PRODUCT_SERVICE_URL ?? "http://localhost:8080",
  inventoryUrl = process.env.INVENTORY_SERVICE_URL ?? "http://localhost:8082",
): Promise<CatalogProduct[]> {
  const productsResponse = await request(`${productUrl}/products`, { cache: "no-store" });
  if (!productsResponse.ok) throw new Error(`Product Service returned ${productsResponse.status}`);
  const products: Product[] = await productsResponse.json();
  if (!Array.isArray(products)) throw new Error("Product Service returned invalid data");

  return Promise.all(products.map(async (product) => {
    const inventoryResponse = await request(`${inventoryUrl}/inventory/${product.id}`, { cache: "no-store" });
    if (!inventoryResponse.ok) throw new Error(`Inventory Service returned ${inventoryResponse.status}`);
    const stock: { available: number } = await inventoryResponse.json();
    if (!Number.isInteger(stock.available) || stock.available < 0) {
      throw new Error("Inventory Service returned invalid data");
    }
    return { ...product, available: stock.available };
  }));
}
