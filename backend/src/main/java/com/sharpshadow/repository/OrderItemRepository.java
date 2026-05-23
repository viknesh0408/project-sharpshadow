package com.sharpshadow.repository;

import com.sharpshadow.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    @Query("SELECT oi FROM OrderItem oi JOIN oi.order o " +
           "WHERE o.user.id = :userId AND o.status = 'PAID' AND oi.product.id = :productId")
    List<OrderItem> findPurchasedByUserAndProduct(@Param("userId") Long userId,
                                                   @Param("productId") Long productId);

    @Query("SELECT oi FROM OrderItem oi JOIN oi.order o " +
           "WHERE o.user.id = :userId AND o.status = 'PAID'")
    List<OrderItem> findAllPurchasedByUser(@Param("userId") Long userId);
}
