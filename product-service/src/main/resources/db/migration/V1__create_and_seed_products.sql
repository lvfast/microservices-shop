CREATE TABLE products (
    id BIGINT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description VARCHAR(1000) NOT NULL,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0)
);

INSERT INTO products (id, name, description, price) VALUES
    (1, 'Áo thun', 'Áo thun cotton', 199000.00),
    (2, 'Túi vải', 'Túi vải canvas', 99000.00);
