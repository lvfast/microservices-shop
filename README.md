# Microservices Shop

Dự án thương mại điện tử cá nhân, lấy cảm hứng từ [YAS của NashTech Garage](https://github.com/nashtech-garage/yas). Mốc hiện tại: Product Service, Cart Service, Inventory Service và Order Service chạy được luồng checkout.

## Yêu cầu

- JDK 25
- Maven 3.6.3+
- Docker và Docker Compose

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
- `compose.yaml`: một PostgreSQL database riêng cho từng service.

## Các mốc tiếp theo

Storefront, Backoffice và Keycloak sẽ là mốc kế tiếp. Sau đó là nghiệp vụ mở rộng, CI/CD và observability.
