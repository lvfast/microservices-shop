package com.lvfast.shop.order;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Testcontainers
@SpringBootTest
@AutoConfigureMockMvc
@Import(CheckoutIntegrationTest.TestClients.class)
class CheckoutIntegrationTest {
    @Container @ServiceConnection
    static PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:17-alpine");

    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;
    @Autowired FakeCartGateway carts;
    @Autowired FakeInventoryGateway inventory;

    @BeforeEach
    void reset() {
        jdbc.update("DELETE FROM order_items");
        jdbc.update("DELETE FROM orders");
        carts.items = List.of(new CartGateway.Item(1L, 2));
        inventory.calls.set(0);
    }

    @Test
    void repeatedCheckoutReturnsSameOrderWithoutReservingAgain() throws Exception {
        UUID key = UUID.randomUUID();
        UUID cartId = UUID.randomUUID();
        String body = body(key, cartId);
        String first = mvc.perform(post("/checkouts").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        String second = mvc.perform(post("/checkouts").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        assertEquals((String) JsonPath.read(first, "$.orderId"), (String) JsonPath.read(second, "$.orderId"));
        assertEquals(1, inventory.calls.get());
        assertEquals(1L, jdbc.queryForObject("SELECT count(*) FROM orders", Long.class));
    }

    @Test
    void rejectsReusedKeyForAnotherCart() throws Exception {
        UUID key = UUID.randomUUID();
        mvc.perform(post("/checkouts").contentType(MediaType.APPLICATION_JSON).content(body(key, UUID.randomUUID())))
                .andExpect(status().isOk());
        mvc.perform(post("/checkouts").contentType(MediaType.APPLICATION_JSON).content(body(key, UUID.randomUUID())))
                .andExpect(status().isConflict());
        assertEquals(1, inventory.calls.get());
    }

    @Test
    void emptyCartCreatesNoOrder() throws Exception {
        carts.items = List.of();
        mvc.perform(post("/checkouts").contentType(MediaType.APPLICATION_JSON)
                .content(body(UUID.randomUUID(), UUID.randomUUID())))
                .andExpect(status().isBadRequest());
        assertEquals(0, inventory.calls.get());
        assertEquals(0L, jdbc.queryForObject("SELECT count(*) FROM orders", Long.class));
    }

    private static String body(UUID key, UUID cartId) {
        return "{\"checkoutKey\":\"" + key + "\",\"cartId\":\"" + cartId + "\"}";
    }

    static class FakeCartGateway implements CartGateway {
        List<Item> items = List.of();
        @Override public CartSnapshot getCart(UUID cartId) { return new CartSnapshot(cartId, items); }
    }

    static class FakeInventoryGateway implements InventoryGateway {
        final AtomicInteger calls = new AtomicInteger();
        @Override public void reserve(UUID key, List<CartGateway.Item> items) { calls.incrementAndGet(); }
    }

    @TestConfiguration
    static class TestClients {
        @Bean @Primary FakeCartGateway fakeCartGateway() { return new FakeCartGateway(); }
        @Bean @Primary FakeInventoryGateway fakeInventoryGateway() { return new FakeInventoryGateway(); }
    }
}
