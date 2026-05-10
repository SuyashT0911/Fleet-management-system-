package com.fms.controller;

import com.fms.model.LeaveRequest;
import com.fms.repository.LeaveRequestRepository;
import com.fms.model.Driver;
import com.fms.repository.DriverRepository;
import com.fms.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.scheduling.annotation.Scheduled;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/leaves")
public class LeaveRequestController {

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<LeaveRequest>> getAll() {
        return ResponseEntity.ok(leaveRequestRepository.findAll());
    }

    @GetMapping("/driver/{driverId}")
    public ResponseEntity<List<LeaveRequest>> getByDriver(@PathVariable Integer driverId) {
        return ResponseEntity.ok(leaveRequestRepository.findByDriver_DriverId(driverId));
    }

    @PostMapping
    public ResponseEntity<LeaveRequest> create(@RequestBody LeaveRequest leaveRequest) {
        if (leaveRequest.getDriver() != null && leaveRequest.getDriver().getDriverId() != null) {
            Driver driver = driverRepository.findById(leaveRequest.getDriver().getDriverId()).orElse(null);
            leaveRequest.setDriver(driver);
        }
        LeaveRequest created = leaveRequestRepository.save(leaveRequest);

        String driverName = leaveRequest.getDriver() != null && leaveRequest.getDriver().getName() != null 
                            ? leaveRequest.getDriver().getName() : "A driver";
        
        notificationService.createForRole(
            "ROLE_ADMIN",
            "New Leave Request",
            driverName + " has requested leave from " + created.getFromDate() + " to " + created.getToDate(),
            "info",
            "leave_request",
            created.getId()
        );

        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LeaveRequest> update(@PathVariable Integer id, @RequestBody LeaveRequest details) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(id).orElse(null);
        if (leaveRequest == null) {
            return ResponseEntity.notFound().build();
        }
        
        leaveRequest.setStatus(details.getStatus());
        if (details.getRejectionReason() != null) {
            leaveRequest.setRejectionReason(details.getRejectionReason());
        }
        
        // If approved, update driver status to 'on_leave'
        if ("approved".equalsIgnoreCase(details.getStatus()) && leaveRequest.getDriver() != null) {
            Driver driver = leaveRequest.getDriver();
            driver.setStatus("on_leave");
            driverRepository.save(driver);
        }

        LeaveRequest updated = leaveRequestRepository.save(leaveRequest);
        
        // Notify Driver
        String statusLabel = "approved".equalsIgnoreCase(updated.getStatus()) ? "Approved" : "Rejected";
        notificationService.create(
            "Leave Request " + statusLabel,
            "Your leave request from " + updated.getFromDate() + " has been " + updated.getStatus() + 
            (updated.getRejectionReason() != null ? ". Reason: " + updated.getRejectionReason() : ""),
            "approved".equalsIgnoreCase(updated.getStatus()) ? "success" : "danger",
            "leave_request", updated.getId()
        );
        
        return ResponseEntity.ok(updated);
    }

    @Scheduled(cron = "0 0 0 * * *") // Runs every day at midnight
    public void autoUpdateDriverStatuses() {
        LocalDate today = LocalDate.now();
        List<LeaveRequest> allRequests = leaveRequestRepository.findAll();
        for (LeaveRequest req : allRequests) {
            if ("approved".equalsIgnoreCase(req.getStatus()) && req.getToDate().isBefore(today)) {
                // The leave has ended
                req.setStatus("completed");
                leaveRequestRepository.save(req);
                
                if (req.getDriver() != null) {
                    Driver driver = req.getDriver();
                    if ("on_leave".equalsIgnoreCase(driver.getStatus())) {
                        driver.setStatus("active");
                        driverRepository.save(driver);
                    }
                }
            }
        }
    }
}
