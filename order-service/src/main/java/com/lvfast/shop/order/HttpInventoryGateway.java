package com.lvfast.shop.order;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

@Component
public class HttpInventoryGateway implements InventoryGateway {
    private final RestClient client;

    public HttpInventoryGateway(RestClient.Builder builder, @Value("${shop.inventory-url}") String baseUrl) {
        this.client = builder.baseUrl(baseUrl).build();
    }

    @Override
    public void reserve(UUID checkoutKey, List<CartGateway.Item> items) {
        try {
            client.post().uri("/reservations").body(new ReservationRequest(checkoutKey, items))
                    .retrieve().toBodilessEntity();
        } catch (RestClientResponseException e) {
            if (e.getStatusCode().value() == 409) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Inventory rejected reservation", e);
            }
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Inventory Service error", e);
        } catch (RestClientException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Inventory Service unavailable", e);
        }
    }

    private record ReservationRequest(UUID checkoutKey, List<CartGateway.Item> items) {}
}
