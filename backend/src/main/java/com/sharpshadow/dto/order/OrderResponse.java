package com.sharpshadow.dto.order;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderResponse {

    private Long id;
    private String razorpayOrderId;
    private String paymentId;
    private BigDecimal totalAmount;
    private Integer amount; // in paise for Razorpay
    private String currency;
    private String status;
    private String productTitle;
    private Long productId;
    private LocalDateTime createdAt;
    private List<OrderItemResponse> items;

    // Getters
    public Long getId() { return id; }
    public String getRazorpayOrderId() { return razorpayOrderId; }
    public String getPaymentId() { return paymentId; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public Integer getAmount() { return amount; }
    public String getCurrency() { return currency; }
    public String getStatus() { return status; }
    public String getProductTitle() { return productTitle; }
    public Long getProductId() { return productId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public List<OrderItemResponse> getItems() { return items; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }
    public void setPaymentId(String paymentId) { this.paymentId = paymentId; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public void setAmount(Integer amount) { this.amount = amount; }
    public void setCurrency(String currency) { this.currency = currency; }
    public void setStatus(String status) { this.status = status; }
    public void setProductTitle(String productTitle) { this.productTitle = productTitle; }
    public void setProductId(Long productId) { this.productId = productId; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setItems(List<OrderItemResponse> items) { this.items = items; }

    // Builder
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private String razorpayOrderId;
        private String paymentId;
        private BigDecimal totalAmount;
        private Integer amount;
        private String currency;
        private String status;
        private String productTitle;
        private Long productId;
        private LocalDateTime createdAt;
        private List<OrderItemResponse> items;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder razorpayOrderId(String v) { this.razorpayOrderId = v; return this; }
        public Builder paymentId(String v) { this.paymentId = v; return this; }
        public Builder totalAmount(BigDecimal v) { this.totalAmount = v; return this; }
        public Builder amount(Integer v) { this.amount = v; return this; }
        public Builder currency(String v) { this.currency = v; return this; }
        public Builder status(String v) { this.status = v; return this; }
        public Builder productTitle(String v) { this.productTitle = v; return this; }
        public Builder productId(Long v) { this.productId = v; return this; }
        public Builder createdAt(LocalDateTime v) { this.createdAt = v; return this; }
        public Builder items(List<OrderItemResponse> v) { this.items = v; return this; }

        public OrderResponse build() {
            OrderResponse r = new OrderResponse();
            r.id = this.id;
            r.razorpayOrderId = this.razorpayOrderId;
            r.paymentId = this.paymentId;
            r.totalAmount = this.totalAmount;
            r.amount = this.amount;
            r.currency = this.currency;
            r.status = this.status;
            r.productTitle = this.productTitle;
            r.productId = this.productId;
            r.createdAt = this.createdAt;
            r.items = this.items;
            return r;
        }
    }

    // ─── Nested OrderItemResponse ─────────────────────────────────────────────
    public static class OrderItemResponse {
        private Long productId;
        private String productTitle;
        private BigDecimal price;

        public Long getProductId() { return productId; }
        public String getProductTitle() { return productTitle; }
        public BigDecimal getPrice() { return price; }

        public void setProductId(Long productId) { this.productId = productId; }
        public void setProductTitle(String productTitle) { this.productTitle = productTitle; }
        public void setPrice(BigDecimal price) { this.price = price; }

        public static ItemBuilder builder() { return new ItemBuilder(); }

        public static class ItemBuilder {
            private Long productId;
            private String productTitle;
            private BigDecimal price;

            public ItemBuilder productId(Long v) { this.productId = v; return this; }
            public ItemBuilder productTitle(String v) { this.productTitle = v; return this; }
            public ItemBuilder price(BigDecimal v) { this.price = v; return this; }

            public OrderItemResponse build() {
                OrderItemResponse r = new OrderItemResponse();
                r.productId = this.productId;
                r.productTitle = this.productTitle;
                r.price = this.price;
                return r;
            }
        }
    }
}
