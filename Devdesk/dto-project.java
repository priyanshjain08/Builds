// backend/src/main/java/com/devdesk/dto/ProjectDTOs.java
package com.devdesk.dto;

import com.devdesk.entity.ProjectStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

public class ProjectDTOs {
    
    @Data
    public static class ProjectRequest {
        @NotBlank(message = "Project name is required")
        private String name;
        
        private String description;
        private ProjectStatus status;
        private LocalDate deadline;
        private Set<Long> teamMemberIds;
    }
    
    @Data
    public static class ProjectResponse {
        private Long id;
        private String name;
        private String description;
        private ProjectStatus status;
        private LocalDate deadline;
        private AuthDTOs.UserDTO createdBy;
        private Set<AuthDTOs.UserDTO> teamMembers;
        private int totalIssues;
        private int openIssues;
        private int inProgressIssues;
        private int resolvedIssues;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
    
    @Data
    public static class ProjectProgressDTO {
        private Long projectId;
        private String projectName;
        private int totalIssues;
        private int completedIssues;
        private double progressPercentage;
    }
}
