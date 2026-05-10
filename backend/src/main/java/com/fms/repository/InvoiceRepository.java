package com.fms.repository;

import com.fms.model.Invoice;
import com.fms.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Integer> {
    Optional<Invoice> findByPayment(Payment payment);
}
