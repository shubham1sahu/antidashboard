package com.rtrom.backend.controller;

import com.rtrom.backend.domain.model.MenuCategory;
import com.rtrom.backend.repository.MenuCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class MenuCategoryController {

    private final MenuCategoryRepository repository;

    @Autowired
    public MenuCategoryController(MenuCategoryRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<List<MenuCategory>> getAllCategories() {
        return ResponseEntity.ok(repository.findAll());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MenuCategory> createCategory(@RequestBody MenuCategory category) {
        return ResponseEntity.ok(repository.save(category));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        // Warning: Requires soft-delete architecture to cascade properly in production
        repository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
