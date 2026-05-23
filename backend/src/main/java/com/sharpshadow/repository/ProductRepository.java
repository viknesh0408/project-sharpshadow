package com.sharpshadow.repository;

import com.sharpshadow.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Page<Product> findByActiveTrue(Pageable pageable);

    Page<Product> findByCategoryIdAndActiveTrue(Long categoryId, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.active = true AND " +
           "(LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Product> searchProducts(@Param("query") String query, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.active = true AND p.category.id = :categoryId AND " +
           "(LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Product> searchProductsByCategory(@Param("query") String query,
                                           @Param("categoryId") Long categoryId,
                                           Pageable pageable);

    List<Product> findTop8ByActiveTrueAndFeaturedTrueOrderByCreatedAtDesc();

    List<Product> findTop12ByActiveTrueOrderByCreatedAtDesc();

    List<Product> findTop8ByActiveTrueOrderByDownloadCountDesc();

    List<Product> findByCategoryIdAndActiveTrueAndIdNot(Long categoryId, Long productId, Pageable pageable);
}
