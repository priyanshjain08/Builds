// backend/src/main/java/com/devdesk/controller/UserController.java
package com.devdesk.controller;

import com.devdesk.dto.AuthDTOs;
import com.devdesk.entity.User;
import com.devdesk.repository.UserRepository;
import com.devdesk.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private AuthService authService;
    
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(authService.convertToDTO(user));
    }
    
    @PutMapping("/me")
    public ResponseEntity<?> updateCurrentUser(@RequestBody AuthDTOs.UserDTO updateRequest) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (updateRequest.getFirstName() != null) {
            user.setFirstName(updateRequest.getFirstName());
        }
        if (updateRequest.getLastName() != null) {
            user.setLastName(updateRequest.getLastName());
        }
        if (updateRequest.getBio() != null) {
            user.setBio(updateRequest.getBio());
        }
        
        user = userRepository.save(user);
        return ResponseEntity.ok(authService.convertToDTO(user));
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<AuthDTOs.UserDTO>> searchUsers(@RequestParam String query) {
        List<AuthDTOs.UserDTO> users = userRepository.findAll().stream()
            .filter(u -> u.getEmail().toLowerCase().contains(query.toLowerCase()) ||
                        u.getFirstName().toLowerCase().contains(query.toLowerCase()) ||
                        u.getLastName().toLowerCase().contains(query.toLowerCase()))
            .limit(10)
            .map(authService::convertToDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }
}
