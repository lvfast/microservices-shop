package com.lvfast.shop.product;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ProductController {
    private final ProductRepository repository;

    public ProductController(ProductRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/products")
    public List<ProductResponse> listProducts() {
        return repository.findAllByOrderByIdAsc().stream().map(ProductResponse::from).toList();
    }
}
