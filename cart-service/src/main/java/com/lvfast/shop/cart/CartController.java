package com.lvfast.shop.cart;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/carts")
public class CartController {
    private final JdbcTemplate jdbc;

    public CartController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @PostMapping("/{cartId}/items")
    public Cart addItem(@PathVariable UUID cartId, @RequestBody AddItem request) {
        if (request.productId() == null || request.productId() <= 0 || request.quantity() == null || request.quantity() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "productId and quantity must be positive");
        }
        jdbc.update("""
                INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)
                ON CONFLICT (cart_id, product_id)
                DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
                """, cartId, request.productId(), request.quantity());
        return getCart(cartId);
    }

    @GetMapping("/{cartId}")
    public Cart getCart(@PathVariable UUID cartId) {
        List<CartItem> items = jdbc.query(
                "SELECT product_id, quantity FROM cart_items WHERE cart_id = ? ORDER BY product_id",
                (rs, row) -> new CartItem(rs.getLong("product_id"), rs.getInt("quantity")), cartId);
        return new Cart(cartId, items);
    }

    public record AddItem(Long productId, Integer quantity) {}
    public record Cart(UUID cartId, List<CartItem> items) {}
    public record CartItem(Long productId, Integer quantity) {}
}
