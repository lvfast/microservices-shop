"use client";

import { useEffect, useState } from "react";
import type { Overview } from "@/lib/overview";

type Order = { orderId: string; checkoutKey: string; cartId: string; items: { productId: number; quantity: number }[] };

export default function Dashboard() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [orderError, setOrderError] = useState("");
  const [loadingOrder, setLoadingOrder] = useState(false);

  useEffect(() => {
    fetch("/api/overview", { cache: "no-store" })
      .then(async response => { if (!response.ok) throw new Error("Không tải được dữ liệu từ Product và Inventory Service."); return response.json(); })
      .then(setOverview)
      .catch(cause => setError(cause.message));
  }, []);

  async function lookup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setOrder(null); setOrderError(""); setLoadingOrder(true);
    try {
      const response = await fetch(`/api/orders/${encodeURIComponent(orderId.trim())}`, { cache: "no-store" });
      if (!response.ok) throw new Error(response.status === 404 ? "Không tìm thấy đơn hàng." : "Không thể tra cứu đơn hàng.");
      setOrder(await response.json());
    } catch (cause) { setOrderError((cause as Error).message); } finally { setLoadingOrder(false); }
  }

  return <>
    <div className="welcome-card"><div><span className="eyebrow">CHÀO MỪNG TRỞ LẠI</span><h2>Mọi thứ đang trong tầm mắt.</h2><p>Theo dõi danh mục và lượng hàng khả dụng, cập nhật trực tiếp từ các service.</p></div><div className="welcome-art" aria-hidden="true"><div className="art-ring ring-one"/><div className="art-ring ring-two"/><span>◈</span></div></div>
    {error && <div className="error-banner" role="alert">{error} Hãy kiểm tra các Java service đang chạy.</div>}
    <div className="metric-grid"><div className="metric-card"><span>SẢN PHẨM</span><strong>{overview?.totalProducts ?? "—"}</strong><small>trong danh mục</small><b>◫</b></div><div className="metric-card"><span>TỒN KHO</span><strong>{overview?.totalUnits ?? "—"}</strong><small>đơn vị khả dụng</small><b>▤</b></div><div className="metric-card metric-note"><span>TRẠNG THÁI</span><strong>{error ? "Lỗi" : overview ? "Sẵn sàng" : "Đang tải"}</strong><small>đồng bộ từ backend</small><b>◉</b></div></div>
    <section className="table-section" id="products"><div className="section-heading"><div><span className="eyebrow">DỮ LIỆU TRỰC TIẾP</span><h2>Sản phẩm & tồn kho</h2></div><span className="section-count">{overview?.products.length ?? 0} sản phẩm</span></div><div className="table-wrap"><table><thead><tr><th>SẢN PHẨM</th><th>MÃ</th><th>GIÁ</th><th>TỒN KHO</th><th>TRẠNG THÁI</th></tr></thead><tbody>{overview?.products.map(product => <tr key={product.id}><td><span className={`product-symbol symbol-${product.id}`}>{product.id === 1 ? "✳" : "◈"}</span><span className="product-name"><strong>{product.name}</strong><small>{product.description}</small></span></td><td>#{String(product.id).padStart(3,"0")}</td><td>{product.price.toLocaleString("vi-VN")} ₫</td><td>{product.available}</td><td><span className={`status-pill ${product.available ? "available" : "soldout"}`}><i/>{product.available ? "Còn hàng" : "Hết hàng"}</span></td></tr>)}</tbody></table>{!overview && !error && <div className="table-loading">Đang tải dữ liệu…</div>}</div></section>
    <section className="order-section" id="orders"><div><span className="eyebrow">KIỂM TRA LUỒNG MUA HÀNG</span><h2>Tra cứu đơn hàng</h2><p>Nhập mã đơn từ Storefront để xem dữ liệu lưu trong Order Service.</p></div><form onSubmit={lookup}><label htmlFor="order-id">Mã đơn hàng</label><div><input id="order-id" value={orderId} onChange={event => setOrderId(event.target.value)} placeholder="Ví dụ: e12100e9-f584-..." required/><button disabled={loadingOrder}>{loadingOrder ? "Đang tìm…" : "Tra cứu →"}</button></div></form>{orderError && <p className="order-error" role="alert">{orderError}</p>}{order && <div className="order-result"><div><span>ĐƠN HÀNG</span><strong>{order.orderId}</strong></div><div><span>CHECKOUT KEY</span><strong>{order.checkoutKey}</strong></div><div><span>GIỎ HÀNG</span><strong>{order.cartId}</strong></div><div><span>SỐ DÒNG</span><strong>{order.items.length}</strong></div></div>}</section>
    <footer>Microservices Shop · Backoffice demo · 2026</footer>
  </>;
}
