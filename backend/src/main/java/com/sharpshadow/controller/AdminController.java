package com.sharpshadow.controller;

import com.sharpshadow.dto.product.ProductRequest;
import com.sharpshadow.dto.product.ProductResponse;
import com.sharpshadow.entity.Category;
import com.sharpshadow.entity.User;
import com.sharpshadow.repository.CategoryRepository;
import com.sharpshadow.repository.OrderRepository;
import com.sharpshadow.repository.UserRepository;
import com.sharpshadow.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final ProductService productService;
    private final CategoryRepository categoryRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    // === Product Management ===
    @PostMapping("/products")
    public ResponseEntity<ProductResponse> createProduct(
            @RequestPart("data") ProductRequest request,
            @RequestPart("previewImage") MultipartFile previewImage,
            @RequestPart("downloadFile") MultipartFile downloadFile) throws IOException {
        return ResponseEntity.ok(productService.createProduct(request, previewImage, downloadFile));
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @RequestPart("data") ProductRequest request,
            @RequestPart(value = "previewImage", required = false) MultipartFile previewImage,
            @RequestPart(value = "downloadFile", required = false) MultipartFile downloadFile) throws IOException {
        return ResponseEntity.ok(productService.updateProduct(id, request, previewImage, downloadFile));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    // === Category Management ===
    @PostMapping("/categories")
    public ResponseEntity<Category> createCategory(@RequestBody Map<String, String> body) {
        Category category = Category.builder()
                .name(body.get("name"))
                .slug(body.get("slug"))
                .icon(body.get("icon"))
                .build();
        return ResponseEntity.ok(categoryRepository.save(category));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<Category> updateCategory(
            @PathVariable Long id, @RequestBody Map<String, String> body) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        category.setName(body.get("name"));
        category.setSlug(body.get("slug"));
        category.setIcon(body.get("icon"));
        return ResponseEntity.ok(categoryRepository.save(category));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // === User Management ===
    @GetMapping("/users")
    public ResponseEntity<List<User>> getUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // === Analytics ===
    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        long totalUsers = userRepository.count();
        long totalProducts = productService.getProducts(0, Integer.MAX_VALUE, null, null, "newest").getTotalElements();
        long totalOrders = orderRepository.countPaidOrders();
        BigDecimal totalRevenue = orderRepository.sumRevenue();

        return ResponseEntity.ok(Map.of(
                "totalUsers", totalUsers,
                "totalProducts", totalProducts,
                "totalOrders", totalOrders,
                "totalRevenue", totalRevenue != null ? totalRevenue : BigDecimal.ZERO
        ));
    }
}
