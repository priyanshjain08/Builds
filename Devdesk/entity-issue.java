// backend/src/main/java/com/devdesk/entity/Issue.java
package com.devdesk.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "issues")
public class Issue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(length = 2000)
    private String description;
    
    @Enumerated(EnumType.STRING)
    private IssueType type = IssueType.TASK;
    
    @Enumerated(EnumType.STRING)
    private IssuePriority priority = IssuePriority.MEDIUM;
    
    @Enumerated(EnumType.STRING)
    private IssueStatus status = IssueStatus.OPEN;
    
    private LocalDate deadline;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignee_id")
    private User assignee;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id")
    private User reporter;
    
    @OneToMany(mappedBy = "issue", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments = new ArrayList<>();
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

public enum IssueType {
    BUG, FEATURE, TASK, IMPROVEMENT
}

public enum IssuePriority {
    LOW, MEDIUM, HIGH, CRITICAL
}

public enum IssueStatus {
    OPEN, IN_PROGRESS, IN_REVIEW, RESOLVED, CLOSED
}
