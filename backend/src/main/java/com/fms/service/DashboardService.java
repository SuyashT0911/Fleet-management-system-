package com.fms.service;

import com.fms.dto.DashboardStats;
import com.fms.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    @Autowired private VehicleRepository vehicleRepository;
    @Autowired private DriverRepository driverRepository;
    @Autowired private TripRepository tripRepository;
    @Autowired private FuelLogRepository fuelLogRepository;
    @Autowired private MaintenanceRepository maintenanceRepository;

    @Autowired private PaymentRepository paymentRepository;
    @Autowired private UserRepository userRepository;

    public DashboardStats getStats() {
        return new DashboardStats(
                vehicleRepository.count(),
                driverRepository.count(), 
                tripRepository.count(),
                tripRepository.countByTripStatus("ongoing"),
                paymentRepository.getTotalRevenue(),
                fuelLogRepository.getTotalFuelCost(),
                maintenanceRepository.countByStatusNot("completed"),
                userRepository.countByRoleRoleName("ROLE_CUSTOMER")
        );
    }
}
