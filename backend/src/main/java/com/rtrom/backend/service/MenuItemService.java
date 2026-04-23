package com.rtrom.backend.service;

import com.rtrom.backend.domain.model.MenuCategory;
import com.rtrom.backend.domain.model.MenuItem;
import com.rtrom.backend.repository.MenuItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MenuItemService {

    private final MenuItemRepository repository;

    @Autowired
    public MenuItemService(MenuItemRepository repository) {
        this.repository = repository;
    }

    public List<MenuItem> getAllMenuItems() {
        return repository.findByIsArchivedFalse();
    }

    public List<MenuItem> getAvailableMenuItems() {
        return repository.findByIsAvailableTrueAndIsArchivedFalse();
    }

    public List<MenuItem> getMenuItemsByCategory(MenuCategory category) {
        return repository.findByCategoryAndIsArchivedFalse(category);
    }

    public Optional<MenuItem> getMenuItemById(Long id) {
        return repository.findById(id).filter(item -> !item.isArchived());
    }

    public MenuItem createMenuItem(MenuItem item) {
        return repository.save(item);
    }

    public MenuItem updateMenuItem(Long id, MenuItem updatedData) {
        return repository.findById(id).map(existingItem -> {
            existingItem.setName(updatedData.getName());
            existingItem.setDescription(updatedData.getDescription());
            existingItem.setPrice(updatedData.getPrice());
            existingItem.setImageUrl(updatedData.getImageUrl());
            existingItem.setCategory(updatedData.getCategory());
            existingItem.setAvailable(updatedData.isAvailable());
            existingItem.setSpecial(updatedData.isSpecial());
            return repository.save(existingItem);
        }).orElseThrow(() -> new RuntimeException("MenuItem not found with id " + id));
    }

    public void deleteMenuItem(Long id) {
        repository.findById(id).ifPresent(item -> {
            item.setArchived(true);
            repository.save(item);
        });
    }

    public MenuItem toggleAvailability(Long id) {
        return repository.findById(id).map(item -> {
            item.setAvailable(!item.isAvailable());
            return repository.save(item);
        }).orElseThrow(() -> new RuntimeException("MenuItem not found with id " + id));
    }
}
