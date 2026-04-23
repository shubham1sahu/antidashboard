package com.rtrom.backend.repository;

import com.rtrom.backend.domain.model.MenuCategory;
import com.rtrom.backend.domain.model.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    List<MenuItem> findByIsArchivedFalse();
    List<MenuItem> findByCategoryAndIsArchivedFalse(MenuCategory category);
    List<MenuItem> findByIsAvailableTrueAndIsArchivedFalse();
}
