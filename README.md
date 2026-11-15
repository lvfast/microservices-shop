# Microservices Shop

Dự án thương mại điện tử cá nhân, lấy cảm hứng từ [YAS của NashTech Garage](https://github.com/nashtech-garage/yas). Mốc hiện tại: Product Service đọc hai sản phẩm mẫu từ PostgreSQL.

## Yêu cầu

- JDK 25
- Maven 3.6.3+
- Docker và Docker Compose

## Chạy Product Service

Tại thư mục gốc:

```powershell
docker compose up -d product-db
cd product-service
mvn test
mvn spring-boot:run
```

Ở terminal khác:

```powershell
curl.exe -i http://localhost:8080/products
```

Kỳ vọng: `HTTP/1.1 200` và JSON chứa hai sản phẩm `Áo thun` (`199000.00`) và `Túi vải` (`99000.00`). Dữ liệu được tạo bởi Flyway khi service kết nối database lần đầu. Nếu cổng `5432` đang được dùng, đổi mapping trong `compose.yaml` và đặt biến `PRODUCT_DB_URL` cho phù hợp.

## Cấu trúc hiện tại

- `product-service`: REST API, JPA và Flyway migration.
- `compose.yaml`: PostgreSQL cho Product Service.

## Các mốc tiếp theo

Cart, Order và Inventory sẽ tạo luồng checkout; tiếp đó là giao diện, xác thực, các nghiệp vụ mở rộng, CI/CD và observability theo thứ tự dự án.
