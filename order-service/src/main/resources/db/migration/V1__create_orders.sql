CREATE TABLE orders (
    id UUID PRIMARY KEY,
    checkout_key UUID NOT NULL UNIQUE,
    cart_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE order_items (
    order_id UUID NOT NULL REFERENCES orders(id),
    product_id BIGINT NOT NULL CHECK (product_id > 0),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    PRIMARY KEY (order_id, product_id)
);
