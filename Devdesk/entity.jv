// backend/src/main/java/com/devdesk/entity/User.java
package com.devdesk.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    @Column(nullable = false)
    private String firstName;
    
    @Column(nullable = false)
    private String lastName;
    
    private String role;
    private String avatarUrl;
    
    @Column(length = 500)
    private String bio;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @ManyToMany(mappedBy = "teamMembers")
    private Set<Project> projects = new HashSet<>();
    
    @OneToMany(mappedBy = "assignee")
    private Set<Issue> assignedIssues = new HashSet<>();
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (role == null) role = "ROLE_USER";
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
