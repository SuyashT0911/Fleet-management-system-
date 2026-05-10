package com.fms.repository;

import com.fms.model.VehicleTracking;
import com.fms.model.Vehicle;
import com.fms.model.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VehicleTrackingRepository extends JpaRepository<VehicleTracking, Integer> {
    List<VehicleTracking> findByVehicleOrderByTimestampDesc(Vehicle vehicle);
    List<VehicleTracking> findByTrip(Trip trip);
}
