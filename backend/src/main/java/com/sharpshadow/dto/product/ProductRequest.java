package com.sharpshadow.dto.product;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

public class ProductRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = true)
    private BigDecimal price;

    @NotNull(message = "Category is required")
    private Long categoryId;

    private List<String> tags;

    private boolean featured;

    // Getters
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public BigDecimal getPrice() { return price; }
    public Long getCategoryId() { return categoryId; }
    public List<String> getTags() { return tags; }
    public boolean isFeatured() { return featured; }

    // Setters
    public void setTitle(String title) { this.title = title; }
    public void setDescription(String description) { this.description = description; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public void setTags(List<String> tags) { this.tags = tags; }
    public void setFeatured(boolean featured) { this.featured = featured; }
}
