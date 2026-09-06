// backend/src/main/java/com/devdesk/service/ProjectService.java
package com.devdesk.service;

import com.devdesk.dto.AuthDTOs;
import com.devdesk.dto.ProjectDTOs;
import com.devdesk.entity.*;
import com.devdesk.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ProjectService {
    
    @Autowired
    private ProjectRepository projectRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private IssueRepository issueRepository;
    
    @Autowired
    private ActivityRepository activityRepository;
    
    @Autowired
    private AuthService authService;
    
    @Transactional
    public ProjectDTOs.ProjectResponse createProject(ProjectDTOs.ProjectRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Project project = new Project();
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setStatus(request.getStatus() != null ? request.getStatus() : ProjectStatus.PLANNING);
        project.setDeadline(request.getDeadline());
        project.setCreatedBy(currentUser);
        project.getTeamMembers().add(currentUser);
        
        if (request.getTeamMemberIds() != null) {
            for (Long userId : request.getTeamMemberIds()) {
                User member = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found: " + userId));
                project.getTeamMembers().add(member);
            }
        }
        
        project = projectRepository.save(project);
        
        // Log activity
        Activity activity = new Activity();
        activity.setAction("PROJECT_CREATED");
        activity.setDetails("Created project: " + project.getName());
        activity.setUser(currentUser);
        activity.setProject(project);
        activityRepository.save(activity);
        
        return convertToDTO(project);
    }
    
    public List<ProjectDTOs.ProjectResponse> getAccessibleProjects() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        return projectRepository.findAccessibleProjects(currentUser)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public ProjectDTOs.ProjectResponse getProject(Long id) {
        Project project = getAccessibleProject(id);
        return convertToDTO(project);
    }
    
    @Transactional
    public ProjectDTOs.ProjectResponse updateProject(Long id, ProjectDTOs.ProjectRequest request) {
        Project project = getAccessibleProject(id);
        
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        if (request.getStatus() != null) {
            project.setStatus(request.getStatus());
        }
        project.setDeadline(request.getDeadline());
        
        if (request.getTeamMemberIds() != null) {
            Set<User> newMembers = request.getTeamMemberIds().stream()
                .map(userId -> userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found: " + userId)))
                .collect(Collectors.toSet());
            project.setTeamMembers(newMembers);
            project.getTeamMembers().add(project.getCreatedBy());
        }
        
        project = projectRepository.save(project);
        
        // Log activity
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email).orElse(null);
        Activity activity = new Activity();
        activity.setAction("PROJECT_UPDATED");
        activity.setDetails("Updated project: " + project.getName());
        activity.setUser(currentUser);
        activity.setProject(project);
        activityRepository.save(activity);
        
        return convertToDTO(project);
    }
    
    @Transactional
    public void deleteProject(Long id) {
        Project project = getAccessibleProject(id);
        
        // Check if user is the creator
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!project.getCreatedBy().equals(currentUser)) {
            throw new RuntimeException("Only the project creator can delete this project");
        }
        
        projectRepository.delete(project);
    }
    
    @Transactional
    public void addTeamMember(Long projectId, Long userId) {
        Project project = getAccessibleProject(projectId);
        User userToAdd = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        project.getTeamMembers().add(userToAdd);
        projectRepository.save(project);
        
        // Log activity
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email).orElse(null);
        Activity activity = new Activity();
        activity.setAction("TEAM_MEMBER_ADDED");
        activity.setDetails("Added " + userToAdd.getFirstName() + " " + userToAdd.getLastName() + " to project: " + project.getName());
        activity.setUser(currentUser);
        activity.setProject(project);
        activityRepository.save(activity);
    }
    
    @Transactional
    public void removeTeamMember(Long projectId, Long userId) {
        Project project = getAccessibleProject(projectId);
        User userToRemove = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (project.getCreatedBy().equals(userToRemove)) {
            throw new RuntimeException("Cannot remove project creator from team");
        }
        
        project.getTeamMembers().remove(userToRemove);
        projectRepository.save(project);
    }
    
    private Project getAccessibleProject(Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        return projectRepository.findById(id)
            .filter(p -> p.getCreatedBy().equals(currentUser) || p.getTeamMembers().contains(currentUser))
            .orElseThrow(() -> new RuntimeException("Project not found or access denied"));
    }
    
    private ProjectDTOs.ProjectResponse convertToDTO(Project project) {
        ProjectDTOs.ProjectResponse dto = new ProjectDTOs.ProjectResponse();
        dto.setId(project.getId());
        dto.setName(project.getName());
        dto.setDescription(project.getDescription());
        dto.setStatus(project.getStatus());
        dto.setDeadline(project.getDeadline());
        dto.setCreatedBy(authService.convertToDTO(project.getCreatedBy()));
        dto.setTeamMembers(project.getTeamMembers().stream()
            .map(authService::convertToDTO)
            .collect(Collectors.toSet()));
        
        List<Issue> issues = issueRepository.findByProject(project);
        dto.setTotalIssues(issues.size());
        dto.setOpenIssues((int) issues.stream().filter(i -> i.getStatus() == IssueStatus.OPEN).count());
        dto.setInProgressIssues((int) issues.stream().filter(i -> i.getStatus() == IssueStatus.IN_PROGRESS).count());
        dto.setResolvedIssues((int) issues.stream().filter(i -> 
            i.getStatus() == IssueStatus.RESOLVED || i.getStatus() == IssueStatus.CLOSED).count());
        dto.setCreatedAt(project.getCreatedAt());
        dto.setUpdatedAt(project.getUpdatedAt());
        
        return dto;
    }
}
