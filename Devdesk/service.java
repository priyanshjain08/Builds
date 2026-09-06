// backend/src/main/java/com/devdesk/service/AuthService.java
package com.devdesk.service;

import com.devdesk.dto.AuthDTOs;
import com.devdesk.entity.User;
import com.devdesk.repository.UserRepository;
import com.devdesk.security.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtService jwtService;
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private UserDetailsService userDetailsService;
    
    @Transactional
    public AuthDTOs.AuthResponse register(AuthDTOs.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRole("ROLE_USER");
        
        user = userRepository.save(user);
        
        String token = jwtService.generateToken(userDetailsService.loadUserByUsername(user.getEmail()));
        return new AuthDTOs.AuthResponse(token, convertToDTO(user));
    }
    
    public AuthDTOs.AuthResponse login(AuthDTOs.LoginRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        String token = jwtService.generateToken(userDetailsService.loadUserByUsername(user.getEmail()));
        return new AuthDTOs.AuthResponse(token, convertToDTO(user));
    }
    
    public AuthDTOs.UserDTO convertToDTO(User user) {
        AuthDTOs.UserDTO dto = new AuthDTOs.UserDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setRole(user.getRole());
        dto.setBio(user.getBio());
        dto.setAvatarUrl(user.getAvatarUrl());
        return dto;
    }
}
