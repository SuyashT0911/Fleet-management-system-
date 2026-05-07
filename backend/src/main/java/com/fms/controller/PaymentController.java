package com.fms.controller;

import com.fms.model.Payment;
import com.fms.repository.PaymentRepository;
import com.fms.service.NotificationService;
import com.fms.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<Payment>> getAll() {
        return ResponseEntity.ok(paymentRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<Payment> create(@RequestBody Payment payment) {
        Payment saved = paymentRepository.save(payment);
        notificationService.create(
            "Payment Recorded",
            "₹" + saved.getAmount() + " payment (" + saved.getMethod() + ") for Trip #" + 
            (saved.getTrip() != null ? saved.getTrip().getTripId() : "N/A"),
            "paid".equals(saved.getStatus()) ? "success" : "warning",
            "payment", saved.getPaymentId()
        );
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Payment> update(@PathVariable Integer id, @RequestBody Payment details) {
        Payment p = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found: " + id));
        if (details.getAmount() != null) p.setAmount(details.getAmount());
        if (details.getStatus() != null) p.setStatus(details.getStatus());
        if (details.getMethod() != null) p.setMethod(details.getMethod());
        if (details.getPaymentDate() != null) p.setPaymentDate(details.getPaymentDate());
        Payment saved = paymentRepository.save(p);
        notificationService.create(
            "Payment Updated",
            "Payment #" + id + " status: " + saved.getStatus(),
            "paid".equals(saved.getStatus()) ? "success" : "warning",
            "payment", id
        );
        return ResponseEntity.ok(saved);
    }
}
