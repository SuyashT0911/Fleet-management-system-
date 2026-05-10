package com.fms.repository;

import com.fms.model.Insurance;
import com.fms.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InsuranceRepository extends JpaRepository<Insurance, Integer> {
    List<Insurance> findByVehicle(Vehicle vehicle);
}
