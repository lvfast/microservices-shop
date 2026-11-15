package com.lvfast.shop.order;

import java.util.List;
import java.util.UUID;

public interface CartGateway {
    CartSnapshot getCart(UUID cartId);

    record Item(Long productId, Integer quantity) {}
    record CartSnapshot(UUID cartId, List<Item> items) {}
}
