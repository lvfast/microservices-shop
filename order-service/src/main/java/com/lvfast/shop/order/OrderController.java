package com.lvfast.shop.order;

import java.util.UUID;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class OrderController {
    private final CheckoutService checkout;

    public OrderController(CheckoutService checkout) {
        this.checkout = checkout;
    }

    @PostMapping("/checkouts")
    public CheckoutService.Order checkout(@RequestBody CheckoutService.CheckoutRequest request) {
        return checkout.checkout(request);
    }

    @GetMapping("/orders/{orderId}")
    public CheckoutService.Order getOrder(@PathVariable UUID orderId) {
        return checkout.getOrder(orderId);
    }
}
