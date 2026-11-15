"use client";

import { useEffect, useState } from "react";
import type { CatalogProduct } from "@/lib/catalog";

type Cart = { cartId: string; items: { productId: number; quantity: number }[] };
type Order = { orderId: string; checkoutKey: string };

function ProductArtwork({ id }: { id: number }) {
  if (id === 1) return <svg viewBox="0 0 320 280" role="img" aria-label="Minh họa áo thun"><path d="M98 47 70 61 34 95 68 131 88 113 88 239 232 239 232 113 252 131 286 95 250 61 222 47 194 65Q160 87 126 65Z" fill="#f2e6d9" stroke="#d9c5ae" strokeWidth="4"/><path d="M126 65Q160 87 194 65" fill="none" stroke="#d9c5ae" strokeWidth="4"/><circle cx="160" cy="150" r="32" fill="#ec7356"/><text x="160" y="156" textAnchor="middle" fontSize="13" fontWeight="800" fill="white">GOOD</text></svg>;
  return <svg viewBox="0 0 320 280" role="img" aria-label="Minh họa túi vải"><path d="M108 103V71a52 52 0 0 1 104 0v32" fill="none" stroke="#775a45" strokeWidth="14"/><path d="M70 96h180l-14 151H84Z" fill="#e7cbab" stroke="#bfa07e" strokeWidth="4"/><path d="M96 113h128" stroke="#d6b28d" strokeWidth="3"/><text x="160" y="175" textAnchor="middle" fontSize="27" fontWeight="800" fill="#775a45">SHOP</text><text x="160" y="198" textAnchor="middle" fontSize="18" fontWeight="700" fill="#775a45">GOOD.</text></svg>;
}

export default function ShopClient({ signedIn, isCustomer }: { signedIn: boolean; isCustomer: boolean }) {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [cart, setCart] = useState<Cart | null>(null);
  const [cartId, setCartId] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [checkoutKey, setCheckoutKey] = useState("");

  useEffect(() => {
    const id = localStorage.getItem("shop-cart-id") || crypto.randomUUID();
    localStorage.setItem("shop-cart-id", id);
    setCartId(id);
    Promise.all([fetch("/api/catalog").then(async r => { if (!r.ok) throw new Error("Không tải được sản phẩm."); return r.json(); }),
      fetch(`/api/carts/${id}`).then(async r => { if (!r.ok) throw new Error("Không tải được giỏ hàng."); return r.json(); })])
      .then(([catalog, currentCart]) => { setProducts(catalog); setCart(currentCart); })
      .catch((cause) => setError(cause.message))
      .finally(() => setLoading(false));
  }, []);

  async function addItem(productId: number) {
    if (!cartId || busy || order) return;
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/carts/${cartId}/items`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ productId, quantity: 1 }) });
      if (!response.ok) throw new Error("Không thể thêm sản phẩm vào giỏ.");
      setCart(await response.json());
    } catch (cause) { setError((cause as Error).message); } finally { setBusy(false); }
  }

  async function checkout(retry = false) {
    if (!cartId || busy || !cart?.items.length || !isCustomer) return;
    const key = retry && checkoutKey ? checkoutKey : crypto.randomUUID();
    setCheckoutKey(key); setBusy(true); setError("");
    try {
      const response = await fetch("/api/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ checkoutKey: key, cartId }) });
      if (!response.ok) throw new Error(response.status === 409 ? "Sản phẩm đã hết hàng hoặc yêu cầu không hợp lệ." : "Checkout chưa thành công. Bạn có thể thử lại với cùng mã yêu cầu.");
      setOrder(await response.json());
      const catalogResponse = await fetch("/api/catalog");
      if (catalogResponse.ok) setProducts(await catalogResponse.json());
    } catch (cause) { setError((cause as Error).message); } finally { setBusy(false); }
  }

  function newCart() {
    const id = crypto.randomUUID();
    localStorage.setItem("shop-cart-id", id);
    setCartId(id); setCart({ cartId: id, items: [] }); setOrder(null); setCheckoutKey(""); setError("");
  }

  const itemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const cartTotal = cart?.items.reduce((sum, item) => sum + (products.find(product => product.id === item.productId)?.price ?? 0) * item.quantity, 0) ?? 0;

  return <div className="shop-grid">
    <div className="product-grid">
      {loading && <div className="state-card">Đang tải danh mục…</div>}
      {!loading && products.map((product) => <article className="product-card" key={product.id}>
        <div className={`product-art product-art-${product.id}`}><span className="art-label">MICROSHOP / 0{product.id}</span><ProductArtwork id={product.id}/></div>
        <div className="product-info"><div><h3>{product.name}</h3><p>{product.description}</p></div><span className="price">{product.price.toLocaleString("vi-VN")} ₫</span></div>
        <div className="product-bottom"><span className={`stock ${product.available === 0 ? "out" : ""}`}><i/>{product.available > 0 ? `Còn ${product.available} sản phẩm` : "Hết hàng"}</span><button disabled={busy || product.available === 0 || Boolean(order)} onClick={() => addItem(product.id)} aria-label={`Thêm ${product.name} vào giỏ`}>Thêm vào giỏ <span>↗</span></button></div>
      </article>)}
    </div>
    <aside className="cart-panel"><div className="cart-heading"><span className="eyebrow">GIỎ HÀNG CỦA BẠN</span><span className="cart-count">{itemCount}</span></div><h2>Sẵn sàng chưa?</h2><p className="cart-intro">Chọn sản phẩm, rồi xem một đơn hàng đi qua hệ thống.</p>
      <div className="cart-items">{cart?.items.length ? cart.items.map(item => { const product = products.find(p => p.id === item.productId); return <div className="cart-item" key={item.productId}><span>{product?.name ?? `Sản phẩm #${item.productId}`}<small>Số lượng: {item.quantity}</small></span><strong>{((product?.price ?? 0) * item.quantity).toLocaleString("vi-VN")} ₫</strong></div>; }) : <div className="empty-cart"><span>◎</span><p>Giỏ hàng đang trống.</p></div>}</div>
      <div className="cart-total"><span>Tạm tính</span><strong>{cartTotal.toLocaleString("vi-VN")} ₫</strong></div>
      {error && <p className="error-message" role="alert">{error}</p>}
      {order ? <div className="success-box"><b>Đơn hàng đã được tạo ✓</b><code>{order.orderId}</code><button onClick={() => checkout(true)} disabled={busy}>Gửi lại cùng checkout key</button><button className="text-button" onClick={newCart}>Bắt đầu giỏ mới</button></div> : <>
        <button className="button button-accent checkout-button" onClick={() => checkout()} disabled={busy || !itemCount || !isCustomer}>{busy ? "Đang xử lý…" : "Tạo đơn hàng →"}</button>
        {!signedIn && <p className="cart-note">Đăng nhập để hoàn tất checkout.</p>}
        {signedIn && !isCustomer && <p className="cart-note">Tài khoản này không có vai trò khách hàng.</p>}
      </>}
      <div className="cart-footnote">🔒 Checkout được xác thực bằng Keycloak</div>
    </aside>
  </div>;
}
