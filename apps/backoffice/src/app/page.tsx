import { auth, signIn, signOut } from "@/auth";
import { backofficeAccess } from "@/lib/access";
import Dashboard from "./dashboard";

export default async function BackofficePage() {
  const session = await auth();
  const status = backofficeAccess(session);
  if (status === 401) return <main className="auth-page"><div className="auth-card"><span className="eyebrow">MICROSERVICES SHOP / BACKOFFICE</span><div className="auth-icon">◈</div><h1>Quản lý cửa hàng<br/><em>trong một nơi.</em></h1><p>Đăng nhập bằng tài khoản quản trị Keycloak để xem danh mục, tồn kho và tra cứu đơn hàng.</p><form action={async () => { "use server"; await signIn("keycloak"); }}><button className="primary-button">Đăng nhập với Keycloak <span>↗</span></button></form><a href="http://localhost:3000">← Quay lại Storefront</a></div></main>;
  if (status === 403) return <main className="auth-page"><div className="auth-card"><span className="eyebrow">KHÔNG CÓ QUYỀN TRUY CẬP</span><div className="auth-icon">⊘</div><h1>Trang này dành cho<br/><em>quản trị viên.</em></h1><p>Tài khoản của bạn chưa có vai trò <code>shop-admin</code> trong Keycloak.</p><form action={async () => { "use server"; await signOut(); }}><button className="primary-button">Đăng xuất để đổi tài khoản <span>↗</span></button></form><a href="http://localhost:3000">← Quay lại Storefront</a></div></main>;
  return <div className="dashboard-layout">
    <aside className="sidebar"><a className="sidebar-brand" href="/"><span className="sidebar-logo">S</span><span>microshop<small>BACKOFFICE</small></span></a><nav><span className="nav-caption">WORKSPACE</span><a className="selected" href="/">▦ <span>Tổng quan</span></a><a href="#products">◫ <span>Sản phẩm & tồn kho</span></a><a href="#orders">▤ <span>Tra cứu đơn hàng</span></a><span className="nav-caption nav-caption-lower">LIÊN KẾT</span><a href="http://localhost:3000">↗ <span>Storefront</span></a><a href="http://localhost:8090/admin">↗ <span>Keycloak</span></a></nav><div className="sidebar-bottom"><div className="avatar">{session?.user?.name?.charAt(0) ?? "A"}</div><div><strong>{session?.user?.name ?? "Admin"}</strong><small>Quản trị viên</small></div><form action={async () => { "use server"; await signOut(); }}><button aria-label="Đăng xuất" title="Đăng xuất">↪</button></form></div></aside>
    <main className="dashboard-main"><div className="topbar"><div><span className="eyebrow">MICROSERVICES SHOP</span><h1>Tổng quan cửa hàng</h1></div><span className="environment-badge"><i/> LOCAL DEMO</span></div><Dashboard /></main>
  </div>;
}
