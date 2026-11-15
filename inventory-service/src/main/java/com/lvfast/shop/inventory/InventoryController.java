package com.lvfast.shop.inventory;

import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
public class InventoryController {
    private final JdbcTemplate jdbc;
    private final ReservationService reservations;

    public InventoryController(JdbcTemplate jdbc, ReservationService reservations) {
        this.jdbc = jdbc;
        this.reservations = reservations;
    }

    @GetMapping("/inventory/{productId}")
    public Stock getStock(@PathVariable long productId) {
        return jdbc.query("SELECT available FROM stock WHERE product_id = ?",
                (rs, row) -> new Stock(productId, rs.getInt("available")), productId)
                .stream().findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Unknown product"));
    }

    @PostMapping("/reservations")
    public ReservationService.Reservation reserve(@RequestBody ReservationService.ReservationRequest request) {
        return reservations.reserve(request);
    }

    public record Stock(long productId, int available) {}
}
