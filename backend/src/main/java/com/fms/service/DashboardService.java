package com.fms.service;

import com.fms.dto.DashboardStats;
import com.fms.model.Analytics;
import com.fms.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;

@Service
public class DashboardService {

    @Autowired private VehicleRepository vehicleRepository;
    @Autowired private DriverRepository driverRepository;
    @Autowired private TripRepository tripRepository;
    @Autowired private FuelLogRepository fuelLogRepository;
    @Autowired private MaintenanceRepository maintenanceRepository;

    @Autowired private PaymentRepository paymentRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private AnalyticsRepository analyticsRepository;

    public DashboardStats getStats() {
        DashboardStats stats = new DashboardStats(
                vehicleRepository.count(),
                driverRepository.count(), 
                tripRepository.getTotalTripCount(),
                tripRepository.countByTripStatus("ongoing"),
                paymentRepository.getTotalRevenue(),
                fuelLogRepository.getTotalFuelCost(),
                maintenanceRepository.countByStatusNot("completed"),
                userRepository.countByRoleRoleName("ROLE_CUSTOMER")
        );
        
        
        // Save to Analytics table for tracking trends
        saveMetric("total_vehicles", BigDecimal.valueOf(stats.getTotalVehicles()));
        saveMetric("total_drivers", BigDecimal.valueOf(stats.getActiveDrivers()));
        saveMetric("total_revenue", stats.getTotalRevenue());
        
        return stats;
    }

    private void saveMetric(String name, BigDecimal value) {
        Analytics analytics = new Analytics();
        analytics.setMetricName(name);
        analytics.setValue(value != null ? value : BigDecimal.ZERO);
        analytics.setDate(LocalDate.now());
        analyticsRepository.save(analytics);
    }
}
