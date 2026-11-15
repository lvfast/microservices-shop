# Microservices Shop

Dự án thương mại điện tử cá nhân, lấy cảm hứng từ [YAS của NashTech Garage](https://github.com/nashtech-garage/yas). Mốc hiện tại: luồng checkout qua bốn Java service, Storefront và Backoffice bằng Next.js, đăng nhập với Keycloak.

## Yêu cầu

- JDK 25
- Maven 3.6.3+
- Docker và Docker Compose
- Node.js 24 và npm

## Chạy local

Tại thư mục gốc:

```powershell
docker compose up -d
mvn clean verify
```

Chạy mỗi service trong một terminal riêng từ thư mục gốc:

```powershell
mvn -f product-service/pom.xml spring-boot:run
mvn -f cart-service/pom.xml spring-boot:run
mvn -f inventory-service/pom.xml spring-boot:run
mvn -f order-service/pom.xml spring-boot:run
```

Mỗi lệnh trên cần một terminal riêng. Product, Cart, Inventory và Order lần lượt dùng cổng HTTP `8080`–`8083`. PostgreSQL của từng service dùng cổng `5432`–`5435`. Flyway tự tạo bảng và dữ liệu mẫu khi service kết nối database lần đầu.

## Chạy Storefront và Backoffice

Sau khi bốn Java service và Keycloak đã chạy, ở thư mục gốc:

```powershell
npm.cmd ci
npm.cmd run setup:local
npm.cmd test
npm.cmd run build
```

Chạy hai lệnh này trong hai terminal riêng:

```powershell
npm.cmd run dev:storefront
npm.cmd run dev:backoffice
```

- Storefront: <http://localhost:3000>. Khách có thể xem sản phẩm và tồn kho, thêm vào giỏ, đăng nhập rồi checkout.
- Backoffice: <http://localhost:3001>. Chỉ tài khoản có role `shop-admin` mới xem được dữ liệu và tra cứu đơn.
- Keycloak Admin Console: <http://localhost:8090/admin> (`admin` / `admin`, chỉ dùng local).

Tài khoản demo trong realm `shop`:

| Giao diện | Tài khoản | Mật khẩu local | Vai trò |
| --- | --- | --- | --- |
| Storefront | `customer` | `Customer123!` | `shop-customer` |
| Backoffice | `shopadmin` | `Admin123!` | `shop-admin` |

`npm.cmd run setup:local` tạo `apps/*/.env.local` với `AUTH_SECRET` ngẫu nhiên từ các `.env.example`; các file này không được commit. Nếu đã có `.env.local`, script giữ nguyên. Dùng `npm.cmd` trên PowerShell khi `npm.ps1` bị chặn bởi execution policy.

Storefront có BFF `/api/catalog` gộp Product và Inventory; `/api/checkout` kiểm tra phiên đăng nhập cùng role khách hàng trước khi gọi Order. Backoffice có BFF `/api/overview` và `/api/orders/{orderId}`, đều kiểm tra role admin ở server. Ở mốc này các Java API vẫn mở trên localhost để demo; trước khi triển khai public cần giới hạn mạng nội bộ hoặc xác thực JWT ở từng service.

Kiểm tra sản phẩm:

```powershell
curl.exe -i http://localhost:8080/products
```

Kỳ vọng: `HTTP/1.1 200` và JSON chứa `Áo thun` (`199000.00`) cùng `Túi vải` (`99000.00`).

## Demo checkout gửi lại

Chạy khi Cart, Inventory và Order đang hoạt động:

```powershell
$cartId = [guid]::NewGuid().ToString()
$key = [guid]::NewGuid().ToString()
$item = @{ productId = 1; quantity = 2 } | ConvertTo-Json -Compress
Invoke-RestMethod -Method Post -Uri "http://localhost:8081/carts/$cartId/items" -ContentType 'application/json' -Body $item
$body = @{ checkoutKey = $key; cartId = $cartId } | ConvertTo-Json -Compress
Invoke-RestMethod -Method Post -Uri 'http://localhost:8083/checkouts' -ContentType 'application/json' -Body $body
Invoke-RestMethod -Method Post -Uri 'http://localhost:8083/checkouts' -ContentType 'application/json' -Body $body
Invoke-RestMethod -Uri 'http://localhost:8082/inventory/1'
```

Hai phản hồi checkout phải có cùng `orderId`. Tồn kho của sản phẩm 1 ban đầu là 10 và chỉ giảm 2 sau hai lần gọi. Nếu đã chạy demo trước đó, xem giá trị tồn kho trước lần gọi đầu để so sánh. Dùng `docker compose down -v` để xóa toàn bộ dữ liệu local và tạo lại từ đầu.

## Cấu trúc hiện tại

- `product-service`: danh mục sản phẩm, JPA và Flyway.
- `cart-service`: giỏ hàng; mỗi lần thêm cộng dồn số lượng.
- `inventory-service`: tồn kho và đặt giữ theo `checkoutKey`, trừ kho trong transaction.
- `order-service`: đọc giỏ, yêu cầu đặt giữ kho và lưu đơn; gửi lại cùng `checkoutKey` trả về đơn cũ.
- `apps/storefront`: giao diện khách và BFF cho danh mục, giỏ hàng, checkout.
- `apps/backoffice`: giao diện quản trị và BFF cho tồn kho, tra cứu đơn.
- `keycloak/shop-realm.json`: realm, hai OIDC client và tài khoản demo.
- `compose.yaml`: một PostgreSQL database riêng cho từng service và Keycloak local.

## Các mốc tiếp theo

Thanh toán sandbox, giao hàng, khuyến mãi, đánh giá, đề xuất, Kafka và Elasticsearch; tiếp theo là CI/CD, Kubernetes và observability.
