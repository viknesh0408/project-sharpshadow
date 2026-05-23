package com.sharpshadow.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private String previewImageKey;

    @Column(nullable = false)
    private String fileKey;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @ElementCollection
    @CollectionTable(name = "product_tags", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "tag")
    private List<String> tags;

    @Column(nullable = false)
    private boolean featured = false;

    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false)
    private Long downloadCount = 0L;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column
    private LocalDateTime updatedAt;

    public Product() {}

    // ─── Getters ────────────────────────────────────────────────────────────────
    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public BigDecimal getPrice() { return price; }
    public String getPreviewImageKey() { return previewImageKey; }
    public String getFileKey() { return fileKey; }
    public Category getCategory() { return category; }
    public List<String> getTags() { return tags; }
    public boolean isFeatured() { return featured; }
    public boolean isActive() { return active; }
    public Long getDownloadCount() { return downloadCount; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    // ─── Setters ────────────────────────────────────────────────────────────────
    public void setId(Long id) { this.id = id; }
    public void setTitle(String title) { this.title = title; }
    public void setDescription(String description) { this.description = description; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public void setPreviewImageKey(String previewImageKey) { this.previewImageKey = previewImageKey; }
    public void setFileKey(String fileKey) { this.fileKey = fileKey; }
    public void setCategory(Category category) { this.category = category; }
    public void setTags(List<String> tags) { this.tags = tags; }
    public void setFeatured(boolean featured) { this.featured = featured; }
    public void setActive(boolean active) { this.active = active; }
    public void setDownloadCount(Long downloadCount) { this.downloadCount = downloadCount; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // ─── Builder ─────────────────────────────────────────────────────────────────
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private String title;
        private String description;
        private BigDecimal price;
        private String previewImageKey;
        private String fileKey;
        private Category category;
        private List<String> tags;
        private boolean featured = false;
        private boolean active = true;
        private Long downloadCount = 0L;
        private LocalDateTime createdAt = LocalDateTime.now();

        public Builder id(Long id) { this.id = id; return this; }
        public Builder title(String title) { this.title = title; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder price(BigDecimal price) { this.price = price; return this; }
        public Builder previewImageKey(String previewImageKey) { this.previewImageKey = previewImageKey; return this; }
        public Builder fileKey(String fileKey) { this.fileKey = fileKey; return this; }
        public Builder category(Category category) { this.category = category; return this; }
        public Builder tags(List<String> tags) { this.tags = tags; return this; }
        public Builder featured(boolean featured) { this.featured = featured; return this; }
        public Builder active(boolean active) { this.active = active; return this; }
        public Builder downloadCount(Long downloadCount) { this.downloadCount = downloadCount; return this; }

        public Product build() {
            Product p = new Product();
            p.id = this.id;
            p.title = this.title;
            p.description = this.description;
            p.price = this.price;
            p.previewImageKey = this.previewImageKey;
            p.fileKey = this.fileKey;
            p.category = this.category;
            p.tags = this.tags;
            p.featured = this.featured;
            p.active = this.active;
            p.downloadCount = this.downloadCount;
            p.createdAt = this.createdAt;
            return p;
        }
    }
}
