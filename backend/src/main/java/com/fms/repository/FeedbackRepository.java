package com.fms.repository;

import com.fms.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Integer> {
    List<Feedback> findByRating(Integer rating);
    List<Feedback> findAllByOrderByCreatedAtDesc();
    List<Feedback> findByTripDriverDriverId(Integer driverId);
    List<Feedback> findByShowPublicTrueOrderByCreatedAtDesc();
}
