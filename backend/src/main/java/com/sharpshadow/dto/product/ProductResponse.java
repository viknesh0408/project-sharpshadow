package com.sharpshadow.dto.product;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class ProductResponse {

    private Long id;
    private String title;
    private String description;
    private BigDecimal price;
    private String previewImageUrl;
    private Long categoryId;
    private String categoryName;
    private List<String> tags;
    private boolean featured;
    private Long downloadCount;
    private LocalDateTime createdAt;

    // Getters
    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public BigDecimal getPrice() { return price; }
    public String getPreviewImageUrl() { return previewImageUrl; }
    public Long getCategoryId() { return categoryId; }
    public String getCategoryName() { return categoryName; }
    public List<String> getTags() { return tags; }
    public boolean isFeatured() { return featured; }
    public Long getDownloadCount() { return downloadCount; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setTitle(String title) { this.title = title; }
    public void setDescription(String description) { this.description = description; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public void setPreviewImageUrl(String previewImageUrl) { this.previewImageUrl = previewImageUrl; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    public void setTags(List<String> tags) { this.tags = tags; }
    public void setFeatured(boolean featured) { this.featured = featured; }
    public void setDownloadCount(Long downloadCount) { this.downloadCount = downloadCount; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Builder
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private String title;
        private String description;
        private BigDecimal price;
        private String previewImageUrl;
        private Long categoryId;
        private String categoryName;
        private List<String> tags;
        private boolean featured;
        private Long downloadCount;
        private LocalDateTime createdAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder title(String title) { this.title = title; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder price(BigDecimal price) { this.price = price; return this; }
        public Builder previewImageUrl(String previewImageUrl) { this.previewImageUrl = previewImageUrl; return this; }
        public Builder categoryId(Long categoryId) { this.categoryId = categoryId; return this; }
        public Builder categoryName(String categoryName) { this.categoryName = categoryName; return this; }
        public Builder tags(List<String> tags) { this.tags = tags; return this; }
        public Builder featured(boolean featured) { this.featured = featured; return this; }
        public Builder downloadCount(Long downloadCount) { this.downloadCount = downloadCount; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public ProductResponse build() {
            ProductResponse r = new ProductResponse();
            r.id = this.id;
            r.title = this.title;
            r.description = this.description;
            r.price = this.price;
            r.previewImageUrl = this.previewImageUrl;
            r.categoryId = this.categoryId;
            r.categoryName = this.categoryName;
            r.tags = this.tags;
            r.featured = this.featured;
            r.downloadCount = this.downloadCount;
            r.createdAt = this.createdAt;
            return r;
        }
    }
}
