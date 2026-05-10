package com.fms.repository;

import com.fms.model.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface TripRepository extends JpaRepository<Trip, Integer> {
    List<Trip> findAllByOrderByTripIdDesc();
    List<Trip> findByTripStatus(String tripStatus);
    long countByTripStatus(String tripStatus);

    @Query("SELECT COALESCE(SUM(t.profit), 0) FROM Trip t WHERE t.tripStatus = 'completed'")
    java.math.BigDecimal getTotalRevenue();

    @Query("SELECT COALESCE(SUM(t.distance), 0) FROM Trip t")
    java.math.BigDecimal getTotalDistance();

    @Query("SELECT t FROM Trip t WHERE t.driver.driverId = :driverId ORDER BY t.startTime DESC")
    List<Trip> findByDriverId(Integer driverId);

    @Query("SELECT t FROM Trip t LEFT JOIN t.customer c WHERE c.customerId = :customerId ORDER BY t.startTime DESC")
    List<Trip> findByCustomerId(Integer customerId);

    @Query("SELECT COUNT(t) FROM Trip t")
    long getTotalTripCount();
}
