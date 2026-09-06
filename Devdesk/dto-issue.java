// backend/src/main/java/com/devdesk/dto/IssueDTOs.java
package com.devdesk.dto;

import com.devdesk.entity.IssuePriority;
import com.devdesk.entity.IssueStatus;
import com.devdesk.entity.IssueType;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class IssueDTOs {
    
    @Data
    public static class IssueRequest {
        @NotBlank(message = "Issue title is required")
        private String title;
        
        private String description;
        private IssueType type;
        private IssuePriority priority;
        private IssueStatus status;
        private LocalDate deadline;
        private Long projectId;
        private Long assigneeId;
    }
    
    @Data
    public static class IssueResponse {
        private Long id;
        private String title;
        private String description;
        private IssueType type;
        private IssuePriority priority;
        private IssueStatus status;
        private LocalDate deadline;
        private Long projectId;
        private String projectName;
        private AuthDTOs.UserDTO assignee;
        private AuthDTOs.UserDTO reporter;
        private int commentCount;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
    
    @Data
    public static class CommentRequest {
        @NotBlank(message = "Comment content is required")
        private String content;
    }
    
    @Data
    public static class CommentResponse {
        private Long id;
        private String content;
        private AuthDTOs.UserDTO author;
        private LocalDateTime createdAt;
    }
}
