package com.fms.repository;

import com.fms.model.FuelLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface FuelLogRepository extends JpaRepository<FuelLog, Integer> {
    @Query("SELECT COALESCE(SUM(f.cost), 0) FROM FuelLog f")
    java.math.BigDecimal getTotalFuelCost();

    List<FuelLog> findByTripTripId(Integer tripId);
    List<FuelLog> findByDriverDriverId(Integer driverId);
}
