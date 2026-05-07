package com.fms.repository;

import com.fms.model.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface DriverRepository extends JpaRepository<Driver, Integer> {
    List<Driver> findByStatus(String status);
    long countByStatus(String status);
    boolean existsByUser(com.fms.model.User user);
    Optional<Driver> findByUser(com.fms.model.User user);
}
