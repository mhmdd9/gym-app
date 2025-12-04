package com.github.mhmdd9.auth.controller;

import com.github.mhmdd9.auth.dto.RoleDto;
import com.github.mhmdd9.auth.dto.UpdateUserRolesRequest;
import com.github.mhmdd9.auth.dto.UpdateUserStatusRequest;
import com.github.mhmdd9.auth.dto.UserDto;
import com.github.mhmdd9.auth.service.UserManagementService;
import com.github.mhmdd9.common.dto.ApiResponse;
import com.github.mhmdd9.common.dto.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UserManagementController {

    private final UserManagementService userManagementService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<UserDto>>> getAllUsers(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<UserDto> users = userManagementService.getAllUsers(search, pageable);
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDto>> getUserById(@PathVariable Long id) {
        UserDto user = userManagementService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @PutMapping("/{id}/roles")
    public ResponseEntity<ApiResponse<UserDto>> updateUserRoles(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRolesRequest request) {
        UserDto user = userManagementService.updateUserRoles(id, request);
        return ResponseEntity.ok(ApiResponse.success(user, "User roles updated successfully."));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<UserDto>> updateUserStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserStatusRequest request) {
        UserDto user = userManagementService.updateUserStatus(id, request);
        String message = request.getIsActive() ? "User activated successfully." : "User deactivated successfully.";
        return ResponseEntity.ok(ApiResponse.success(user, message));
    }

    @GetMapping("/roles")
    public ResponseEntity<ApiResponse<List<RoleDto>>> getAllRoles() {
        List<RoleDto> roles = userManagementService.getAllRoles();
        return ResponseEntity.ok(ApiResponse.success(roles));
    }
}
