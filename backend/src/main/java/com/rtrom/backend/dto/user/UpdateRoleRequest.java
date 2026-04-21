package com.rtrom.backend.dto.user;

import com.rtrom.backend.domain.model.Role;
import jakarta.validation.constraints.NotNull;

public record UpdateRoleRequest(
    @NotNull Role role
) {}
