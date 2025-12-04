package com.github.mhmdd9.auth.service;

import com.github.mhmdd9.auth.entity.User;
import com.github.mhmdd9.auth.repository.UserRepository;
import com.github.mhmdd9.auth.security.UserPrincipal;
import com.github.mhmdd9.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String phoneNumber) throws UsernameNotFoundException {
        User user = userRepository.findByPhoneNumberWithRoles(phoneNumber)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "User not found with phone number: " + phoneNumber));
        
        return UserPrincipal.from(user);
    }

    @Transactional(readOnly = true)
    public UserDetails loadUserById(Long id) {
        User user = userRepository.findByIdWithRoles(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        
        return UserPrincipal.from(user);
    }
}

