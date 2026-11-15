import { auth, signIn, signOut } from "@/auth";
import ShopClient from "./shop-client";

export default async function StorefrontPage() {
  const session = await auth();
  const isCustomer = session?.user?.roles.includes("shop-customer") ?? false;

  return <>
    <header className="site-header">
      <div className="shell header-inner">
        <a className="brand" href="/"><span className="brand-mark">S</span><span>micro<span className="brand-light">shop</span></span></a>
        <nav aria-label="Điều hướng chính"><a href="#products">Sản phẩm</a><a href="#how-it-works">Cách hoạt động</a><a href="http://localhost:3001">Backoffice ↗</a></nav>
        <div className="header-actions">
          {session ? <>
            <span className="account-name">Xin chào, {session.user.name ?? "bạn"}</span>
            <form action={async () => { "use server"; await signOut(); }}><button className="text-button">Đăng xuất</button></form>
          </> : <form action={async () => { "use server"; await signIn("keycloak"); }}><button className="button button-dark">Đăng nhập</button></form>}
        </div>
      </div>
    </header>
    <main>
      <section className="hero shell">
        <div className="hero-copy">
          <span className="eyebrow">MICROSERVICES SHOP · BẢN DEMO</span>
          <h1>Những món đồ nhỏ.<br/><em>Trải nghiệm thật.</em></h1>
          <p>Khám phá bộ sưu tập tối giản. Mỗi sản phẩm bạn thấy được đọc trực tiếp từ Product Service, cùng tồn kho hiện tại từ Inventory Service.</p>
          <a className="button button-dark hero-button" href="#products">Khám phá sản phẩm <span>↗</span></a>
        </div>
        <div className="hero-art" aria-hidden="true"><div className="hero-orbit orbit-one"/><div className="hero-orbit orbit-two"/><div className="hero-bag"><div className="bag-handle"/><div className="bag-body"><span>SHOP<br/>GOOD.</span></div></div><div className="floating-tag">made for everyday ✳</div></div>
      </section>
      <section className="catalog-section" id="products"><div className="shell">
        <div className="section-top"><div><span className="eyebrow">01 / BỘ SƯU TẬP</span><h2>Chọn món bạn thích</h2></div><p>Thiết kế gọn gàng, giá rõ ràng, tồn kho cập nhật theo thời gian thực.</p></div>
        <ShopClient signedIn={Boolean(session)} isCustomer={isCustomer} />
      </div></section>
      <section className="info-section shell" id="how-it-works"><span className="eyebrow">PHÍA SAU MỘT CÚ NHẤP</span><h2>Một cửa hàng, nhiều dịch vụ.</h2><div className="info-grid"><div><b>01</b><h3>Danh mục sống</h3><p>Product và Inventory cùng tạo nên thông tin bạn thấy trên mỗi thẻ sản phẩm.</p></div><div><b>02</b><h3>Giỏ hàng riêng</h3><p>Cart Service lưu lựa chọn và số lượng của từng sản phẩm.</p></div><div><b>03</b><h3>Checkout an toàn</h3><p>Order giữ cùng một mã yêu cầu khi thử lại, để tồn kho chỉ giảm một lần.</p></div></div></section>
    </main>
    <footer><div className="shell footer-inner"><span>microshop © 2026</span><span>Built with Next.js · Spring Boot · PostgreSQL</span></div></footer>
  </>;
}
