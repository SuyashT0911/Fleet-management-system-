package com.fms.repository;

import com.fms.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Integer> {
    List<Expense> findByVehicleVehicleId(Integer vehicleId);
    List<Expense> findByTripTripId(Integer tripId);
}
