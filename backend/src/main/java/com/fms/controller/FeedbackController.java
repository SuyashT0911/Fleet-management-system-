package com.fms.controller;

import com.fms.model.Feedback;
import com.fms.repository.FeedbackRepository;
import com.fms.repository.DriverRepository;
import com.fms.repository.TripRepository;
import com.fms.service.NotificationService;
import com.fms.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<Feedback>> getAll() {
        return ResponseEntity.ok(feedbackRepository.findAllByOrderByCreatedAtDesc());
    }

    @GetMapping("/rating/{rating}")
    public ResponseEntity<List<Feedback>> getByRating(@PathVariable Integer rating) {
        return ResponseEntity.ok(feedbackRepository.findByRating(rating));
    }

    @Autowired
    private DriverRepository driverRepository;
    @Autowired
    private TripRepository tripRepository;

    @PostMapping
    public ResponseEntity<Feedback> create(@RequestBody Feedback feedback) {
        Feedback saved = feedbackRepository.save(feedback);
        Feedback fullFeedback = feedbackRepository.findById(saved.getFeedbackId()).orElse(saved);
        String userName = fullFeedback.getUser() != null ? fullFeedback.getUser().getName() : 
                         (fullFeedback.getCustomer() != null ? fullFeedback.getCustomer().getName() : "Unknown");
        notificationService.create(
            "New Feedback Received",
            userName + " gave " + fullFeedback.getRating() + "★ rating" + 
            (fullFeedback.getTrip() != null ? " for Trip #" + fullFeedback.getTrip().getTripId() : ""),
            fullFeedback.getRating() >= 4 ? "success" : (fullFeedback.getRating() >= 3 ? "warning" : "danger"),
            "feedback", saved.getFeedbackId()
        );

        if (fullFeedback.getTrip() != null && fullFeedback.getTrip().getTripId() != null) {
            // Explicitly flush to ensure the new feedback is in the database for the query
            feedbackRepository.flush();
            
            com.fms.model.Trip fullTrip = tripRepository.findById(fullFeedback.getTrip().getTripId()).orElse(null);
            if (fullTrip != null && fullTrip.getDriver() != null) {
                // Fetch the driver directly to ensure we have a fresh managed entity
                com.fms.model.Driver driver = driverRepository.findById(fullTrip.getDriver().getDriverId()).orElse(null);
                
                if (driver != null) {
                    // Fetch all feedbacks for this driver to calculate a true average
                    List<Feedback> driverFeedbacks = feedbackRepository.findByTripDriverDriverId(driver.getDriverId());
                    
                    if (!driverFeedbacks.isEmpty()) {
                        double totalRating = 0;
                        int count = 0;
                        for (Feedback f : driverFeedbacks) {
                            if (f.getRating() != null) {
                                totalRating += f.getRating();
                                count++;
                            }
                        }
                        
                        if (count > 0) {
                            double average = totalRating / count;
                            driver.setRating(java.math.BigDecimal.valueOf(average).setScale(1, java.math.RoundingMode.HALF_UP));
                            driverRepository.saveAndFlush(driver);
                        }
                    }
                    
                    if (driver.getUser() != null) {
                        notificationService.create(
                            "New Rating Received",
                            "You received a " + fullFeedback.getRating() + "★ rating for Trip #" + fullTrip.getTripId(),
                            fullFeedback.getRating() >= 4 ? "success" : "warning", 
                            "profile", 
                            driver.getUser().getUserId()
                        );
                    }
                }
            }
        }

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/reply")
    public ResponseEntity<Feedback> adminReply(@PathVariable Integer id, @RequestBody java.util.Map<String, String> body) {
        Feedback f = feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found: " + id));
        f.setAdminReply(body.get("adminReply"));
        Feedback saved = feedbackRepository.save(f);
        notificationService.create(
            "Admin Reply on Feedback",
            "Admin replied to feedback #" + id,
            "info", "feedback", id
        );
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/visibility")
    public ResponseEntity<Feedback> toggleVisibility(@PathVariable Integer id) {
        Feedback f = feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found: " + id));
        f.setShowPublic(!Boolean.TRUE.equals(f.getShowPublic()));
        Feedback saved = feedbackRepository.save(f);
        return ResponseEntity.ok(saved);
    }

    /**
     * Public endpoint for landing page testimonials.
     * Returns only reviews explicitly marked as public by an admin.
     */
    @GetMapping("/public/testimonials")
    public ResponseEntity<List<Feedback>> getPublicTestimonials() {
        return ResponseEntity.ok(feedbackRepository.findByShowPublicTrueOrderByCreatedAtDesc());
    }
}
