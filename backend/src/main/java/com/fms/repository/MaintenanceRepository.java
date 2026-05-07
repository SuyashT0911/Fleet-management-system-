package com.fms.repository;

import com.fms.model.Maintenance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MaintenanceRepository extends JpaRepository<Maintenance, Integer> {
    List<Maintenance> findByStatus(String status);
    List<Maintenance> findByVehicleVehicleId(Integer vehicleId);
    long countByStatus(String status);
    long countByStatusNot(String status);
}
