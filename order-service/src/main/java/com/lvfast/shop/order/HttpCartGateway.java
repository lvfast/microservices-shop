package com.lvfast.shop.order;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;

@Component
public class HttpCartGateway implements CartGateway {
    private final RestClient client;

    public HttpCartGateway(RestClient.Builder builder, @Value("${shop.cart-url}") String baseUrl) {
        this.client = builder.baseUrl(baseUrl).build();
    }

    @Override
    public CartSnapshot getCart(UUID cartId) {
        try {
            CartSnapshot cart = client.get().uri("/carts/{cartId}", cartId).retrieve().body(CartSnapshot.class);
            if (cart == null) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Cart Service returned no body");
            }
            return cart;
        } catch (RestClientException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Cart Service unavailable", e);
        }
    }
}
