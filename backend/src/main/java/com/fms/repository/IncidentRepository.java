package com.fms.repository;

import com.fms.model.Incident;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface IncidentRepository extends JpaRepository<Incident, Integer> {
    List<Incident> findByTripTripId(Integer tripId);
    List<Incident> findByDriverDriverId(Integer driverId);
}
