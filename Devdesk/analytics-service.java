// backend/src/main/java/com/devdesk/service/AnalyticsService.java
package com.devdesk.service;

import com.devdesk.entity.*;
import com.devdesk.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {
    
    @Autowired
    private ProjectRepository projectRepository;
    
    @Autowired
    private IssueRepository issueRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public Map<String, Object> getAnalyticsData() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Project> accessibleProjects = projectRepository.findAccessibleProjects(currentUser);
        List<Issue> accessibleIssues = issueRepository.findByProjectsIn(accessibleProjects);
        
        Map<String, Object> analyticsData = new HashMap<>();
        
        // Issues by status
        Map<String, Long> issuesByStatus = new LinkedHashMap<>();
        for (IssueStatus status : IssueStatus.values()) {
            issuesByStatus.put(status.name(), accessibleIssues.stream()
                .filter(i -> i.getStatus() == status).count());
        }
        analyticsData.put("issuesByStatus", issuesByStatus);
        
        // Issues by priority
        Map<String, Long> issuesByPriority = new LinkedHashMap<>();
        for (IssuePriority priority : IssuePriority.values()) {
            issuesByPriority.put(priority.name(), accessibleIssues.stream()
                .filter(i -> i.getPriority() == priority).count());
        }
        analyticsData.put("issuesByPriority", issuesByPriority);
        
        // Issues by type
        Map<String, Long> issuesByType = new LinkedHashMap<>();
        for (IssueType type : IssueType.values()) {
            issuesByType.put(type.name(), accessibleIssues.stream()
                .filter(i -> i.getType() == type).count());
        }
        analyticsData.put("issuesByType", issuesByType);
        
        // Project progress
        List<Map<String, Object>> projectProgress = accessibleProjects.stream()
            .map(p -> {
                List<Issue> projectIssues = issueRepository.findByProject(p);
                long totalIssues = projectIssues.size();
                long completedIssues = projectIssues.stream()
                    .filter(i -> i.getStatus() == IssueStatus.CLOSED || i.getStatus() == IssueStatus.RESOLVED)
                    .count();
                double progress = totalIssues > 0 ? (completedIssues * 100.0 / totalIssues) : 0;
                
                Map<String, Object> progressMap = new HashMap<>();
                progressMap.put("projectId", p.getId());
                progressMap.put("projectName", p.getName());
                progressMap.put("totalIssues", totalIssues);
                progressMap.put("completedIssues", completedIssues);
                progressMap.put("progressPercentage", Math.round(progress * 10) / 10.0);
                return progressMap;
            })
            .collect(Collectors.toList());
        analyticsData.put("projectProgress", projectProgress);
        
        // Team workload
        Map<String, Map<String, Object>> teamWorkload = new HashMap<>();
        for (User user : accessibleProjects.stream()
                .flatMap(p -> p.getTeamMembers().stream())
                .collect(Collectors.toSet())) {
            List<Issue> assignedIssues = issueRepository.findByProjectsInAndAssignee(accessibleProjects, user);
            Map<String, Object> workload = new HashMap<>();
            workload.put("userId", user.getId());
            workload.put("userName", user.getFirstName() + " " + user.getLastName());
            workload.put("totalAssigned", assignedIssues.size());
            workload.put("openIssues", assignedIssues.stream()
                .filter(i -> i.getStatus() == IssueStatus.OPEN).count());
            workload.put("inProgressIssues", assignedIssues.stream()
                .filter(i -> i.getStatus() == IssueStatus.IN_PROGRESS).count());
            workload.put("completedIssues", assignedIssues.stream()
                .filter(i -> i.getStatus() == IssueStatus.CLOSED || i.getStatus() == IssueStatus.RESOLVED).count());
            workload.put("criticalIssues", assignedIssues.stream()
                .filter(i -> i.getPriority() == IssuePriority.CRITICAL && 
                        i.getStatus() != IssueStatus.CLOSED && 
                        i.getStatus() != IssueStatus.RESOLVED).count());
            teamWorkload.put(user.getEmail(), workload);
        }
        analyticsData.put("teamWorkload", teamWorkload.values());
        
        return analyticsData;
    }
}
