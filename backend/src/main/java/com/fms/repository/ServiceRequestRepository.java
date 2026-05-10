package com.fms.repository;

import com.fms.model.ServiceRequest;
import com.fms.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Integer> {
    List<ServiceRequest> findByVehicle(Vehicle vehicle);
}
