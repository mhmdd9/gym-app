package com.github.mhmdd9.auth.service;

import com.github.mhmdd9.auth.dto.RoleDto;
import com.github.mhmdd9.auth.dto.UpdateUserRolesRequest;
import com.github.mhmdd9.auth.dto.UpdateUserStatusRequest;
import com.github.mhmdd9.auth.dto.UserDto;
import com.github.mhmdd9.auth.entity.Role;
import com.github.mhmdd9.auth.entity.User;
import com.github.mhmdd9.auth.repository.RoleRepository;
import com.github.mhmdd9.auth.repository.UserRepository;
import com.github.mhmdd9.common.dto.PageResponse;
import com.github.mhmdd9.common.exception.BusinessException;
import com.github.mhmdd9.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserManagementService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Transactional(readOnly = true)
    public PageResponse<UserDto> getAllUsers(String search, Pageable pageable) {
        Page<User> users;
        if (search != null && !search.trim().isEmpty()) {
            users = userRepository.searchUsers(search.trim(), pageable);
        } else {
            users = userRepository.findAllWithRoles(pageable);
        }
        
        List<UserDto> userDtos = users.getContent().stream()
                .map(UserDto::from)
                .collect(Collectors.toList());
        
        return PageResponse.from(users, userDtos);
    }

    @Transactional(readOnly = true)
    public UserDto getUserById(Long userId) {
        User user = userRepository.findByIdWithRoles(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        return UserDto.from(user);
    }

    @Transactional
    public UserDto updateUserRoles(Long userId, UpdateUserRolesRequest request) {
        User user = userRepository.findByIdWithRoles(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        // Validate all requested roles exist
        Set<Role> newRoles = new HashSet<>();
        for (String roleName : request.getRoles()) {
            Role role = roleRepository.findByName(roleName)
                    .orElseThrow(() -> new BusinessException(
                            "Role not found: " + roleName, "INVALID_ROLE"));
            newRoles.add(role);
        }

        // Update roles
        user.getRoles().clear();
        user.getRoles().addAll(newRoles);
        userRepository.save(user);

        log.info("Updated roles for user {}: {}", user.getPhoneNumber(), request.getRoles());
        return UserDto.from(user);
    }

    @Transactional
    public UserDto updateUserStatus(Long userId, UpdateUserStatusRequest request) {
        User user = userRepository.findByIdWithRoles(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        user.setIsActive(request.getIsActive());
        userRepository.save(user);

        log.info("Updated status for user {}: isActive={}", user.getPhoneNumber(), request.getIsActive());
        return UserDto.from(user);
    }

    @Transactional(readOnly = true)
    public List<RoleDto> getAllRoles() {
        return roleRepository.findAll().stream()
                .map(RoleDto::from)
                .collect(Collectors.toList());
    }
}
