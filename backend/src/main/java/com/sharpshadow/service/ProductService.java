package com.sharpshadow.service;

import com.sharpshadow.dto.product.ProductRequest;
import com.sharpshadow.dto.product.ProductResponse;
import com.sharpshadow.dto.product.PagedResponse;
import com.sharpshadow.entity.Category;
import com.sharpshadow.entity.Product;
import com.sharpshadow.exception.ResourceNotFoundException;
import com.sharpshadow.repository.CategoryRepository;
import com.sharpshadow.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final StorageService storageService;

    public ProductService(ProductRepository productRepository,
                          CategoryRepository categoryRepository,
                          StorageService storageService) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.storageService = storageService;
    }

    @Transactional(readOnly = true)
    public PagedResponse<ProductResponse> getProducts(int page, int size, Long categoryId,
                                                       String search, String sortBy) {
        Sort sort = buildSort(sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Product> productPage;

        if (search != null && !search.isBlank()) {
            if (categoryId != null) {
                productPage = productRepository.searchProductsByCategory(search, categoryId, pageable);
            } else {
                productPage = productRepository.searchProducts(search, pageable);
            }
        } else if (categoryId != null) {
            productPage = productRepository.findByCategoryIdAndActiveTrue(categoryId, pageable);
        } else {
            productPage = productRepository.findByActiveTrue(pageable);
        }

        return buildPagedResponse(productPage);
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return mapToResponse(product);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getFeaturedProducts() {
        return productRepository.findTop8ByActiveTrueAndFeaturedTrueOrderByCreatedAtDesc()
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getLatestProducts() {
        return productRepository.findTop12ByActiveTrueOrderByCreatedAtDesc()
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getTrendingProducts() {
        return productRepository.findTop8ByActiveTrueOrderByDownloadCountDesc()
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getRelatedProducts(Long productId, Long categoryId) {
        Pageable pageable = PageRequest.of(0, 4);
        return productRepository.findByCategoryIdAndActiveTrueAndIdNot(categoryId, productId, pageable)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest request,
                                          MultipartFile previewImage,
                                          MultipartFile downloadFile) throws IOException {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        String previewKey = uploadFile(previewImage, "previews");
        String fileKey = uploadFile(downloadFile, "files");

        Product product = Product.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .price(request.getPrice())
                .previewImageKey(previewKey)
                .fileKey(fileKey)
                .category(category)
                .tags(request.getTags())
                .featured(request.isFeatured())
                .build();

        return mapToResponse(productRepository.save(product));
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request,
                                          MultipartFile previewImage,
                                          MultipartFile downloadFile) throws IOException {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        product.setTitle(request.getTitle());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setCategory(category);
        product.setTags(request.getTags());
        product.setFeatured(request.isFeatured());

        if (previewImage != null && !previewImage.isEmpty()) {
            storageService.deleteFile(product.getPreviewImageKey());
            product.setPreviewImageKey(uploadFile(previewImage, "previews"));
        }
        if (downloadFile != null && !downloadFile.isEmpty()) {
            storageService.deleteFile(product.getFileKey());
            product.setFileKey(uploadFile(downloadFile, "files"));
        }

        return mapToResponse(productRepository.save(product));
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        storageService.deleteFile(product.getPreviewImageKey());
        storageService.deleteFile(product.getFileKey());
        productRepository.delete(product);
    }

    private String uploadFile(MultipartFile file, String folder) throws IOException {
        String key = folder + "/" + UUID.randomUUID() + "_" + file.getOriginalFilename();
        storageService.uploadFile(key, file.getInputStream(), file.getSize(), file.getContentType());
        return key;
    }

    private Sort buildSort(String sortBy) {
        return switch (sortBy != null ? sortBy : "newest") {
            case "price_asc" -> Sort.by(Sort.Direction.ASC, "price");
            case "price_desc" -> Sort.by(Sort.Direction.DESC, "price");
            case "popular" -> Sort.by(Sort.Direction.DESC, "downloadCount");
            default -> Sort.by(Sort.Direction.DESC, "createdAt");
        };
    }

    private PagedResponse<ProductResponse> buildPagedResponse(Page<Product> page) {
        List<ProductResponse> content = page.getContent().stream()
                .map(this::mapToResponse).collect(Collectors.toList());
        PagedResponse.Builder<ProductResponse> builder = PagedResponse.builder();
        return builder
                .content(content)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    public ProductResponse mapToResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .title(product.getTitle())
                .description(product.getDescription())
                .price(product.getPrice())
                .previewImageUrl(storageService.getPublicUrl(product.getPreviewImageKey()))
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .tags(product.getTags())
                .featured(product.isFeatured())
                .downloadCount(product.getDownloadCount())
                .createdAt(product.getCreatedAt())
                .build();
    }
}
