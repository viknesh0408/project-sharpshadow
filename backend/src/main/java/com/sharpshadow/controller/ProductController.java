package com.sharpshadow.controller;

import com.sharpshadow.dto.product.PagedResponse;
import com.sharpshadow.dto.product.ProductResponse;
import com.sharpshadow.entity.Category;
import com.sharpshadow.repository.CategoryRepository;
import com.sharpshadow.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final CategoryRepository categoryRepository;

    @GetMapping("/products")
    public ResponseEntity<PagedResponse<ProductResponse>> getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "newest") String sortBy) {
        return ResponseEntity.ok(productService.getProducts(page, size, categoryId, search, sortBy));
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<ProductResponse> getProduct(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @GetMapping("/products/featured")
    public ResponseEntity<List<ProductResponse>> getFeatured() {
        return ResponseEntity.ok(productService.getFeaturedProducts());
    }

    @GetMapping("/products/latest")
    public ResponseEntity<List<ProductResponse>> getLatest() {
        return ResponseEntity.ok(productService.getLatestProducts());
    }

    @GetMapping("/products/trending")
    public ResponseEntity<List<ProductResponse>> getTrending() {
        return ResponseEntity.ok(productService.getTrendingProducts());
    }

    @GetMapping("/products/{id}/related")
    public ResponseEntity<List<ProductResponse>> getRelated(
            @PathVariable Long id,
            @RequestParam(required = false) Long categoryId) {
        return ResponseEntity.ok(productService.getRelatedProducts(id, categoryId));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getCategories() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }
}
