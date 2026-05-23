package com.sharpshadow.service;

import com.sharpshadow.entity.Product;
import com.sharpshadow.exception.AccessDeniedException;
import com.sharpshadow.exception.ResourceNotFoundException;
import com.sharpshadow.repository.OrderItemRepository;
import com.sharpshadow.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DownloadService {

    private static final Logger log = LoggerFactory.getLogger(DownloadService.class);

    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final StorageService storageService;

    public DownloadService(OrderItemRepository orderItemRepository,
                           ProductRepository productRepository,
                           StorageService storageService) {
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
        this.storageService = storageService;
    }

    @Transactional
    public String getSecureDownloadUrl(Long userId, Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        // Verify user has purchased this product
        boolean hasPurchased = !orderItemRepository
                .findPurchasedByUserAndProduct(userId, productId).isEmpty();

        if (!hasPurchased) {
            throw new AccessDeniedException("You have not purchased this product");
        }

        // Generate secure Firebase signed URL (expires in 15 minutes)
        String presignedUrl = storageService.generatePresignedUrl(product.getFileKey());
        log.info("Generated secure download URL for user {} product {}", userId, productId);

        return presignedUrl;
    }
}
