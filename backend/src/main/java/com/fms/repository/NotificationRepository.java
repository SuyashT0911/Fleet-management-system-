package com.fms.repository;

import com.fms.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    List<Notification> findAllByOrderByCreatedAtDesc();
    List<Notification> findByIsReadFalseOrderByCreatedAtDesc();
    long countByIsReadFalse();
    List<Notification> findByUserOrUserIsNullOrderByCreatedAtDesc(com.fms.model.User user);
    List<Notification> findByUserOrderByCreatedAtDesc(com.fms.model.User user);
}
