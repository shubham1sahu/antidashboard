package com.rtrom.backend.service;

import com.rtrom.backend.domain.model.Review;
import com.rtrom.backend.repository.ReviewRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;

    public ReviewService(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    public List<Review> getApprovedReviews() {
        return reviewRepository.findByApprovedTrueOrderByCreatedAtDesc();
    }

    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    public Review submitReview(Review review) {
        review.setApproved(false);
        return reviewRepository.save(review);
    }

    public Review approveReview(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found with id: " + id));
        review.setApproved(true);
        return reviewRepository.save(review);
    }

    public void deleteReview(Long id) {
        reviewRepository.deleteById(id);
    }
}
