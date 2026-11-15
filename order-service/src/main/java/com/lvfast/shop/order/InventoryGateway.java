package com.lvfast.shop.order;

import java.util.List;
import java.util.UUID;

public interface InventoryGateway {
    void reserve(UUID checkoutKey, List<CartGateway.Item> items);
}
