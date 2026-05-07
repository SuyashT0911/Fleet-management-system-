package com.fms.controller;

import com.fms.dto.DashboardStats;
import com.fms.service.DashboardService;
import com.fms.service.NotificationService;
import com.fms.model.Notification;
import com.fms.repository.TripRepository;
import com.fms.model.Trip;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private TripRepository tripRepository;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStats> getStats() {
        return ResponseEntity.ok(dashboardService.getStats());
    }

    @GetMapping("/live-trips")
    public ResponseEntity<List<Trip>> getLiveTrips() {
        return ResponseEntity.ok(tripRepository.findByTripStatus("ongoing"));
    }

    @GetMapping("/recent-activity")
    public ResponseEntity<List<Notification>> getRecentActivity() {
        List<Notification> all = notificationService.getAll();
        // Return last 20 notifications as recent activity
        return ResponseEntity.ok(all.size() > 20 ? all.subList(0, 20) : all);
    }

    /**
     * Public endpoint — no auth required.
     * Returns real-time platform stats for the landing page.
     */
    @Autowired
    private com.fms.repository.PaymentRepository paymentRepository;

    @Autowired
    private com.fms.repository.VehicleRepository vehicleRepository;

    @Autowired
    private com.fms.repository.DriverRepository driverRepository;

    @Autowired
    private com.fms.repository.UserRepository userRepository;

    @GetMapping("/public-stats")
    public ResponseEntity<java.util.Map<String, Object>> getPublicStats() {
        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("totalTrips", tripRepository.count());
        stats.put("completedTrips", tripRepository.countByTripStatus("completed"));
        stats.put("totalVehicles", vehicleRepository.count());
        stats.put("activeDrivers", driverRepository.count());
        stats.put("totalRevenue", paymentRepository.getTotalRevenue());
        stats.put("totalDistance", tripRepository.getTotalDistance());
        stats.put("totalCustomers", userRepository.countByRoleRoleName("ROLE_CUSTOMER"));
        stats.put("ongoingTrips", tripRepository.countByTripStatus("ongoing"));
        return ResponseEntity.ok(stats);
    }
}
