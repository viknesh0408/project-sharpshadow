package com.sharpshadow.controller;

import com.sharpshadow.dto.order.CreateOrderRequest;
import com.sharpshadow.dto.order.OrderResponse;
import com.sharpshadow.dto.order.VerifyPaymentRequest;
import com.sharpshadow.security.UserPrincipal;
import com.sharpshadow.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/create")
    public ResponseEntity<OrderResponse> createOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateOrderRequest request) {
        return ResponseEntity.ok(orderService.createRazorpayOrder(principal.getId(), request));
    }

    @PostMapping("/verify")
    public ResponseEntity<Map<String, String>> verifyPayment(
            @RequestBody VerifyPaymentRequest request) {
        orderService.verifyPayment(request);
        return ResponseEntity.ok(Map.of("message", "Payment verified successfully"));
    }

    @GetMapping("/history")
    public ResponseEntity<List<OrderResponse>> getOrderHistory(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(orderService.getUserOrderHistory(principal.getId()));
    }
}
