package com.rtrom.backend.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class RoleProtectedController {

    @GetMapping("/admin/ping")
    @PreAuthorize("hasRole('ADMIN')")
    public String admin() {
        return "ADMIN access granted";
    }

    @GetMapping("/customer/ping")
    @PreAuthorize("hasRole('CUSTOMER')")
    public String customer() {
        return "CUSTOMER access granted";
    }

    @GetMapping("/kitchen/ping")
    @PreAuthorize("hasRole('KITCHEN_STAFF')")
    public String kitchen() {
        return "KITCHEN_STAFF access granted";
    }

    @GetMapping("/waiter/ping")
    @PreAuthorize("hasRole('WAITER')")
    public String waiter() {
        return "WAITER access granted";
    }
}
