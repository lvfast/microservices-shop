CREATE TABLE stock (
    product_id BIGINT PRIMARY KEY,
    available INTEGER NOT NULL CHECK (available >= 0)
);

CREATE TABLE reservations (
    checkout_key UUID PRIMARY KEY,
    item_fingerprint VARCHAR(64) NOT NULL
);

INSERT INTO stock (product_id, available) VALUES (1, 10), (2, 5);
