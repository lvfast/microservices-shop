package com.lvfast.shop.order;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CheckoutService {
    private final CartGateway carts;
    private final InventoryGateway inventory;
    private final JdbcTemplate jdbc;
    private final TransactionTemplate transactions;

    public CheckoutService(CartGateway carts, InventoryGateway inventory, JdbcTemplate jdbc,
            TransactionTemplate transactions) {
        this.carts = carts;
        this.inventory = inventory;
        this.jdbc = jdbc;
        this.transactions = transactions;
    }

    public Order checkout(CheckoutRequest request) {
        if (request == null || request.checkoutKey() == null || request.cartId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "checkoutKey and cartId are required");
        }
        Order previous = findByCheckoutKey(request.checkoutKey());
        if (previous != null) {
            return checkCart(previous, request.cartId());
        }
        CartGateway.CartSnapshot cart = carts.getCart(request.cartId());
        if (cart.items() == null || cart.items().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cart is empty");
        }
        List<CartGateway.Item> items = cart.items();
        if (items.stream().anyMatch(item -> item == null || item.productId() == null || item.productId() <= 0
                || item.quantity() == null || item.quantity() <= 0)
                || items.stream().map(CartGateway.Item::productId).distinct().count() != items.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Cart Service returned invalid items");
        }
        inventory.reserve(request.checkoutKey(), items);
        return transactions.execute(status -> {
            UUID orderId = UUID.randomUUID();
            List<UUID> inserted = jdbc.query("""
                    INSERT INTO orders (id, checkout_key, cart_id) VALUES (?, ?, ?)
                    ON CONFLICT (checkout_key) DO NOTHING RETURNING id
                    """, (rs, row) -> (UUID) rs.getObject("id"), orderId, request.checkoutKey(), request.cartId());
            if (inserted.isEmpty()) {
                return checkCart(findByCheckoutKey(request.checkoutKey()), request.cartId());
            }
            for (CartGateway.Item item : items) {
                jdbc.update("INSERT INTO order_items (order_id, product_id, quantity) VALUES (?, ?, ?)",
                        orderId, item.productId(), item.quantity());
            }
            return new Order(orderId, request.checkoutKey(), request.cartId(), items);
        });
    }

    public Order getOrder(UUID orderId) {
        List<Order> orders = jdbc.query("SELECT id, checkout_key, cart_id FROM orders WHERE id = ?",
                (rs, row) -> new Order((UUID) rs.getObject("id"), (UUID) rs.getObject("checkout_key"),
                        (UUID) rs.getObject("cart_id"), getItems((UUID) rs.getObject("id"))), orderId);
        return orders.stream().findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
    }

    private Order findByCheckoutKey(UUID key) {
        return jdbc.query("SELECT id FROM orders WHERE checkout_key = ?",
                (rs, row) -> getOrder((UUID) rs.getObject("id")), key).stream().findFirst().orElse(null);
    }

    private List<CartGateway.Item> getItems(UUID orderId) {
        return jdbc.query("SELECT product_id, quantity FROM order_items WHERE order_id = ? ORDER BY product_id",
                (rs, row) -> new CartGateway.Item(rs.getLong("product_id"), rs.getInt("quantity")), orderId);
    }

    private Order checkCart(Order order, UUID cartId) {
        if (order == null || !order.cartId().equals(cartId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Checkout key was used for another cart");
        }
        return order;
    }

    public record CheckoutRequest(UUID checkoutKey, UUID cartId) {}
    public record Order(UUID orderId, UUID checkoutKey, UUID cartId, List<CartGateway.Item> items) {}
}
