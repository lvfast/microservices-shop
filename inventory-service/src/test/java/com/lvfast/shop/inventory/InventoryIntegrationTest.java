package com.lvfast.shop.inventory;

import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Testcontainers
@SpringBootTest
@AutoConfigureMockMvc
class InventoryIntegrationTest {
    @Container @ServiceConnection
    static PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:17-alpine");

    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;

    @BeforeEach
    void resetStock() {
        jdbc.update("DELETE FROM reservations");
        jdbc.update("UPDATE stock SET available = CASE product_id WHEN 1 THEN 10 ELSE 5 END");
    }

    @Test
    void retryReservesStockOnlyOnce() throws Exception {
        UUID key = UUID.randomUUID();
        String body = "{\"checkoutKey\":\"" + key + "\",\"items\":[{\"productId\":1,\"quantity\":2}]}";
        for (int i = 0; i < 2; i++) {
            mvc.perform(post("/reservations").contentType(MediaType.APPLICATION_JSON).content(body))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.checkoutKey").value(key.toString()));
        }
        mvc.perform(get("/inventory/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available").value(8));
    }

    @Test
    void rejectsSameKeyWithDifferentItems() throws Exception {
        UUID key = UUID.randomUUID();
        mvc.perform(post("/reservations").contentType(MediaType.APPLICATION_JSON)
                .content("{\"checkoutKey\":\"" + key + "\",\"items\":[{\"productId\":1,\"quantity\":2}]}"))
                .andExpect(status().isOk());
        mvc.perform(post("/reservations").contentType(MediaType.APPLICATION_JSON)
                .content("{\"checkoutKey\":\"" + key + "\",\"items\":[{\"productId\":1,\"quantity\":3}]}"))
                .andExpect(status().isConflict());
        mvc.perform(get("/inventory/1")).andExpect(jsonPath("$.available").value(8));
    }

    @Test
    void insufficientStockRollsBackAllItems() throws Exception {
        UUID key = UUID.randomUUID();
        mvc.perform(post("/reservations").contentType(MediaType.APPLICATION_JSON)
                .content("{\"checkoutKey\":\"" + key + "\",\"items\":[{\"productId\":1,\"quantity\":2},{\"productId\":2,\"quantity\":99}]}"))
                .andExpect(status().isConflict());
        mvc.perform(get("/inventory/1")).andExpect(jsonPath("$.available").value(10));
        mvc.perform(get("/inventory/2")).andExpect(jsonPath("$.available").value(5));
    }
}
