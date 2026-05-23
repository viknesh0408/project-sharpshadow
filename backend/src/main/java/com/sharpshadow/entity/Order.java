package com.sharpshadow.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column
    private String razorpayOrderId;

    @Column
    private String paymentId;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status = OrderStatus.PENDING;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<OrderItem> items;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Order() {}

    public enum OrderStatus {
        PENDING, PAID, FAILED, REFUNDED
    }

    // Getters
    public Long getId() { return id; }
    public User getUser() { return user; }
    public String getRazorpayOrderId() { return razorpayOrderId; }
    public String getPaymentId() { return paymentId; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public OrderStatus getStatus() { return status; }
    public List<OrderItem> getItems() { return items; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setUser(User user) { this.user = user; }
    public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }
    public void setPaymentId(String paymentId) { this.paymentId = paymentId; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public void setStatus(OrderStatus status) { this.status = status; }
    public void setItems(List<OrderItem> items) { this.items = items; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Builder
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private User user;
        private String razorpayOrderId;
        private String paymentId;
        private BigDecimal totalAmount;
        private OrderStatus status = OrderStatus.PENDING;
        private List<OrderItem> items;
        private LocalDateTime createdAt = LocalDateTime.now();

        public Builder id(Long id) { this.id = id; return this; }
        public Builder user(User user) { this.user = user; return this; }
        public Builder razorpayOrderId(String v) { this.razorpayOrderId = v; return this; }
        public Builder paymentId(String v) { this.paymentId = v; return this; }
        public Builder totalAmount(BigDecimal v) { this.totalAmount = v; return this; }
        public Builder status(OrderStatus v) { this.status = v; return this; }
        public Builder items(List<OrderItem> v) { this.items = v; return this; }
        public Builder createdAt(LocalDateTime v) { this.createdAt = v; return this; }

        public Order build() {
            Order o = new Order();
            o.id = this.id;
            o.user = this.user;
            o.razorpayOrderId = this.razorpayOrderId;
            o.paymentId = this.paymentId;
            o.totalAmount = this.totalAmount;
            o.status = this.status;
            o.items = this.items;
            o.createdAt = this.createdAt;
            return o;
        }
    }
}
