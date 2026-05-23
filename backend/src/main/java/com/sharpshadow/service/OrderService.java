package com.sharpshadow.service;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.sharpshadow.dto.order.CreateOrderRequest;
import com.sharpshadow.dto.order.OrderResponse;
import com.sharpshadow.dto.order.VerifyPaymentRequest;
import com.sharpshadow.entity.Order;
import com.sharpshadow.entity.OrderItem;
import com.sharpshadow.entity.Product;
import com.sharpshadow.entity.User;
import com.sharpshadow.exception.ResourceNotFoundException;
import com.sharpshadow.repository.OrderRepository;
import com.sharpshadow.repository.ProductRepository;
import com.sharpshadow.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public OrderService(OrderRepository orderRepository,
                        ProductRepository productRepository,
                        UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Value("${app.razorpay.key-id}")
    private String razorpayKeyId;

    @Value("${app.razorpay.key-secret}")
    private String razorpayKeySecret;

    @Value("${app.razorpay.webhook-secret}")
    private String webhookSecret;

    @Transactional
    public OrderResponse createRazorpayOrder(Long userId, CreateOrderRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        try {
            RazorpayClient client = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            // Amount in paise (INR)
            int amountInPaise = product.getPrice().multiply(BigDecimal.valueOf(100)).intValue();

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "ss_" + System.currentTimeMillis());
            orderRequest.put("payment_capture", 1);

            com.razorpay.Order razorpayOrder = client.orders.create(orderRequest);
            String razorpayOrderId = razorpayOrder.get("id");

            // Create pending order in DB
            Order order = Order.builder()
                    .user(user)
                    .razorpayOrderId(razorpayOrderId)
                    .totalAmount(product.getPrice())
                    .status(Order.OrderStatus.PENDING)
                    .build();

            OrderItem item = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .price(product.getPrice())
                    .build();

            order.setItems(new ArrayList<>(List.of(item)));
            orderRepository.save(order);

            return OrderResponse.builder()
                    .razorpayOrderId(razorpayOrderId)
                    .amount(amountInPaise)
                    .currency("INR")
                    .productTitle(product.getTitle())
                    .productId(product.getId())
                    .build();

        } catch (RazorpayException e) {
            log.error("Razorpay order creation failed: {}", e.getMessage());
            throw new RuntimeException("Payment initiation failed: " + e.getMessage());
        }
    }

    @Transactional
    public void verifyPayment(VerifyPaymentRequest request) {
        // HMAC-SHA256 verification
        String payload = request.getRazorpayOrderId() + "|" + request.getRazorpayPaymentId();
        if (!verifySignature(payload, request.getRazorpaySignature(), razorpayKeySecret)) {
            throw new RuntimeException("Payment verification failed: invalid signature");
        }

        Order order = orderRepository.findByRazorpayOrderId(request.getRazorpayOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        order.setPaymentId(request.getRazorpayPaymentId());
        order.setStatus(Order.OrderStatus.PAID);

        // Increment download counts
        order.getItems().forEach(item -> {
            Product product = item.getProduct();
            product.setDownloadCount(product.getDownloadCount() + 1);
            productRepository.save(product);
        });

        orderRepository.save(order);
        log.info("Payment verified for order: {}", order.getId());
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getUserOrderHistory(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private boolean verifySignature(String payload, String signature, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(
                    secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString().equals(signature);
        } catch (Exception e) {
            return false;
        }
    }

    private OrderResponse mapToResponse(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .razorpayOrderId(order.getRazorpayOrderId())
                .paymentId(order.getPaymentId())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus().name())
                .createdAt(order.getCreatedAt())
                .items(order.getItems() != null ? order.getItems().stream().map(item ->
                        OrderResponse.OrderItemResponse.builder()
                                .productId(item.getProduct().getId())
                                .productTitle(item.getProduct().getTitle())
                                .price(item.getPrice())
                                .build()
                ).collect(Collectors.toList()) : List.of())
                .build();
    }
}
