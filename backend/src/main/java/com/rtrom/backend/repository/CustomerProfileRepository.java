package com.rtrom.backend.repository;

import com.rtrom.backend.domain.model.CustomerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerProfileRepository extends JpaRepository<CustomerProfile, Long> {
    Optional<CustomerProfile> findByUserId(Long userId);
    Optional<CustomerProfile> findByUserEmail(String email);
    void deleteByUserId(Long userId);
}
