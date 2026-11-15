package com.lvfast.shop.inventory;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Comparator;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ReservationService {
    private final JdbcTemplate jdbc;
    private final TransactionTemplate transactions;

    public ReservationService(JdbcTemplate jdbc, TransactionTemplate transactions) {
        this.jdbc = jdbc;
        this.transactions = transactions;
    }

    public Reservation reserve(ReservationRequest request) {
        if (request == null || request.checkoutKey() == null || request.items() == null || request.items().isEmpty()
                || request.items().size() > 100 || request.items().stream().anyMatch(item -> item == null
                || item.productId() == null || item.productId() <= 0 || item.quantity() == null || item.quantity() <= 0)
                || request.items().stream().map(Item::productId).distinct().count() != request.items().size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid reservation request");
        }
        String fingerprint = fingerprint(request.items());
        return transactions.execute(status -> {
            boolean inserted = jdbc.query("""
                    INSERT INTO reservations (checkout_key, item_fingerprint) VALUES (?, ?)
                    ON CONFLICT (checkout_key) DO NOTHING RETURNING checkout_key
                    """, (ResultSetExtractor<Boolean>) rs -> rs.next(), request.checkoutKey(), fingerprint);
            if (!inserted) {
                String existing = jdbc.queryForObject(
                        "SELECT item_fingerprint FROM reservations WHERE checkout_key = ?",
                        String.class, request.checkoutKey());
                if (!fingerprint.equals(existing)) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Checkout key was used for different items");
                }
                return new Reservation(request.checkoutKey(), "RESERVED");
            }
            for (Item item : request.items().stream().sorted(Comparator.comparing(Item::productId)).toList()) {
                int changed = jdbc.update("""
                        UPDATE stock SET available = available - ?
                        WHERE product_id = ? AND available >= ?
                        """, item.quantity(), item.productId(), item.quantity());
                if (changed != 1) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Insufficient stock for product " + item.productId());
                }
            }
            return new Reservation(request.checkoutKey(), "RESERVED");
        });
    }

    private String fingerprint(List<Item> items) {
        String canonical = items.stream().sorted(Comparator.comparing(Item::productId))
                .map(item -> item.productId() + ":" + item.quantity())
                .collect(Collectors.joining(","));
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(canonical.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 is unavailable", e);
        }
    }

    public record Item(Long productId, Integer quantity) {}
    public record ReservationRequest(UUID checkoutKey, List<Item> items) {}
    public record Reservation(UUID checkoutKey, String status) {}
}
