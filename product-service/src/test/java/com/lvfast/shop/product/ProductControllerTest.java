package com.lvfast.shop.product;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ProductControllerTest {

    @Test
    void listsProductsFromRepository() throws Exception {
        ProductRepository repository = mock(ProductRepository.class);
        when(repository.findAllByOrderByIdAsc()).thenReturn(List.of(
                new Product(1L, "Áo thun", "Áo thun cotton", new BigDecimal("199000.00")),
                new Product(2L, "Túi vải", "Túi vải canvas", new BigDecimal("99000.00"))));
        MockMvc mvc = MockMvcBuilders.standaloneSetup(new ProductController(repository)).build();

        mvc.perform(get("/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("Áo thun"))
                .andExpect(jsonPath("$[0].price").value(199000.00))
                .andExpect(jsonPath("$[1].id").value(2))
                .andExpect(jsonPath("$[1].name").value("Túi vải"));
    }
}
