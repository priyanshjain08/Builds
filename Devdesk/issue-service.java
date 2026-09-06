// backend/src/main/java/com/devdesk/service/IssueService.java
package com.devdesk.service;

import com.devdesk.dto.AuthDTOs;
import com.devdesk.dto.IssueDTOs;
import com.devdesk.entity.*;
import com.devdesk.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class IssueService {
    
    @Autowired
    private IssueRepository issueRepository;
    
    @Autowired
    private ProjectRepository projectRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CommentRepository commentRepository;
    
    @Autowired
    private ActivityRepository activityRepository;
    
    @Autowired
    private AuthService authService;
    
    @Transactional
    public IssueDTOs.IssueResponse createIssue(IssueDTOs.IssueRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Project project = projectRepository.findById(request.getProjectId())
            .orElseThrow(() -> new RuntimeException("Project not found"));
        
        // Check access
        if (!project.getCreatedBy().equals(currentUser) && !project.getTeamMembers().contains(currentUser)) {
            throw new RuntimeException("Access denied to this project");
        }
        
        Issue issue = new Issue();
        issue.setTitle(request.getTitle());
        issue.setDescription(request.getDescription());
        issue.setType(request.getType() != null ? request.getType() : IssueType.TASK);
        issue.setPriority(request.getPriority() != null ? request.getPriority() : IssuePriority.MEDIUM);
        issue.setStatus(request.getStatus() != null ? request.getStatus() : IssueStatus.OPEN);
        issue.setDeadline(request.getDeadline());
        issue.setProject(project);
        issue.setReporter(currentUser);
        
        if (request.getAssigneeId() != null) {
            User assignee = userRepository.findById(request.getAssigneeId())
                .orElseThrow(() -> new RuntimeException("Assignee not found"));
            issue.setAssignee(assignee);
        }
        
        issue = issueRepository.save(issue);
        
        // Log activity
        Activity activity = new Activity();
        activity.setAction("ISSUE_CREATED");
        activity.setDetails("Created issue: " + issue.getTitle());
        activity.setUser(currentUser);
        activity.setProject(project);
        activity.setIssue(issue);
        activityRepository.save(activity);
        
        return convertToDTO(issue);
    }
    
    public List<IssueDTOs.IssueResponse> getAccessibleIssues() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Project> accessibleProjects = projectRepository.findAccessibleProjects(currentUser);
        return issueRepository.findByProjectsIn(accessibleProjects)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public List<IssueDTOs.IssueResponse> getIssuesByProject(Long projectId) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new RuntimeException("Project not found"));
        
        // Check access
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!project.getCreatedBy().equals(currentUser) && !project.getTeamMembers().contains(currentUser)) {
            throw new RuntimeException("Access denied to this project");
        }
        
        return issueRepository.findByProject(project)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public IssueDTOs.IssueResponse getIssue(Long id) {
        Issue issue = getAccessibleIssue(id);
        return convertToDTO(issue);
    }
    
    @Transactional
    public IssueDTOs.IssueResponse updateIssue(Long id, IssueDTOs.IssueRequest request) {
        Issue issue = getAccessibleIssue(id);
        IssueStatus oldStatus = issue.getStatus();
        
        issue.setTitle(request.getTitle());
        issue.setDescription(request.getDescription());
        issue.setType(request.getType());
        issue.setPriority(request.getPriority());
        issue.setStatus(request.getStatus());
        issue.setDeadline(request.getDeadline());
        
        if (request.getProjectId() != null) {
            Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));
            issue.setProject(project);
        }
        
        if (request.getAssigneeId() != null) {
            User assignee = userRepository.findById(request.getAssigneeId())
                .orElseThrow(() -> new RuntimeException("Assignee not found"));
            issue.setAssignee(assignee);
        } else {
            issue.setAssignee(null);
        }
        
        issue = issueRepository.save(issue);
        
        // Log activity
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Activity activity = new Activity();
        activity.setAction("ISSUE_UPDATED");
        activity.setDetails("Updated issue: " + issue.getTitle());
        activity.setUser(currentUser);
        activity.setProject(issue.getProject());
        activity.setIssue(issue);
        activityRepository.save(activity);
        
        if (oldStatus != issue.getStatus()) {
            Activity statusActivity = new Activity();
            statusActivity.setAction("ISSUE_STATUS_CHANGED");
            statusActivity.setDetails("Changed status from " + oldStatus + " to " + issue.getStatus() + ": " + issue.getTitle());
            statusActivity.setUser(currentUser);
            statusActivity.setProject(issue.getProject());
            statusActivity.setIssue(issue);
            activityRepository.save(statusActivity);
        }
        
        return convertToDTO(issue);
    }
    
    @Transactional
    public void deleteIssue(Long id) {
        Issue issue = getAccessibleIssue(id);
        issueRepository.delete(issue);
    }
    
    @Transactional
    public IssueDTOs.CommentResponse addComment(Long issueId, IssueDTOs.CommentRequest request) {
        Issue issue = getAccessibleIssue(issueId);
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Comment comment = new Comment();
        comment.setContent(request.getContent());
        comment.setIssue(issue);
        comment.setAuthor(currentUser);
        
        comment = commentRepository.save(comment);
        
        // Log activity
        Activity activity = new Activity();
        activity.setAction("COMMENT_ADDED");
        activity.setDetails("Commented on issue: " + issue.getTitle());
        activity.setUser(currentUser);
        activity.setProject(issue.getProject());
        activity.setIssue(issue);
        activityRepository.save(activity);
        
        return convertToCommentDTO(comment);
    }
    
    public List<IssueDTOs.CommentResponse> getComments(Long issueId) {
        Issue issue = getAccessibleIssue(issueId);
        return commentRepository.findByIssueOrderByCreatedAtAsc(issue)
            .stream()
            .map(this::convertToCommentDTO)
            .collect(Collectors.toList());
    }
    
    @Transactional
    public void deleteComment(Long issueId, Long commentId) {
        Issue issue = getAccessibleIssue(issueId);
        Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!comment.getAuthor().equals(currentUser)) {
            throw new RuntimeException("You can only delete your own comments");
        }
        
        commentRepository.delete(comment);
    }
    
    private Issue getAccessibleIssue(Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Issue issue = issueRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Issue not found"));
        
        Project project = issue.getProject();
        if (!project.getCreatedBy().equals(currentUser) && !project.getTeamMembers().contains(currentUser)) {
            throw new RuntimeException("Access denied to this issue");
        }
        
        return issue;
    }
    
    private IssueDTOs.IssueResponse convertToDTO(Issue issue) {
        IssueDTOs.IssueResponse dto = new IssueDTOs.IssueResponse();
        dto.setId(issue.getId());
        dto.setTitle(issue.getTitle());
        dto.setDescription(issue.getDescription());
        dto.setType(issue.getType());
        dto.setPriority(issue.getPriority());
        dto.setStatus(issue.getStatus());
        dto.setDeadline(issue.getDeadline());
        dto.setProjectId(issue.getProject().getId());
        dto.setProjectName(issue.getProject().getName());
        if (issue.getAssignee() != null) {
            dto.setAssignee(authService.convertToDTO(issue.getAssignee()));
        }
        dto.setReporter(authService.convertToDTO(issue.getReporter()));
        dto.setCommentCount(commentRepository.findByIssue(issue).size());
        dto.setCreatedAt(issue.getCreatedAt());
        dto.setUpdatedAt(issue.getUpdatedAt());
        return dto;
    }
    
    private IssueDTOs.CommentResponse convertToCommentDTO(Comment comment) {
        IssueDTOs.CommentResponse dto = new IssueDTOs.CommentResponse();
        dto.setId(comment.getId());
        dto.setContent(comment.getContent());
        dto.setAuthor(authService.convertToDTO(comment.getAuthor()));
        dto.setCreatedAt(comment.getCreatedAt());
        return dto;
    }
}
