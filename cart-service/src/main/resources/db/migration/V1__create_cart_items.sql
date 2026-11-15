CREATE TABLE cart_items (
    cart_id UUID NOT NULL,
    product_id BIGINT NOT NULL CHECK (product_id > 0),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    PRIMARY KEY (cart_id, product_id)
);
