// backend/src/main/java/com/devdesk/service/DashboardService.java
package com.devdesk.service;

import com.devdesk.entity.*;
import com.devdesk.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {
    
    @Autowired
    private ProjectRepository projectRepository;
    
    @Autowired
    private IssueRepository issueRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ActivityRepository activityRepository;
    
    public Map<String, Object> getDashboardData() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Project> accessibleProjects = projectRepository.findAccessibleProjects(currentUser);
        List<Issue> accessibleIssues = issueRepository.findByProjectsIn(accessibleProjects);
        
        Map<String, Object> dashboardData = new HashMap<>();
        
        // Project statistics
        dashboardData.put("totalProjects", accessibleProjects.size());
        dashboardData.put("activeProjects", accessibleProjects.stream()
            .filter(p -> p.getStatus() == ProjectStatus.ACTIVE).count());
        dashboardData.put("planningProjects", accessibleProjects.stream()
            .filter(p -> p.getStatus() == ProjectStatus.PLANNING).count());
        dashboardData.put("onHoldProjects", accessibleProjects.stream()
            .filter(p -> p.getStatus() == ProjectStatus.ON_HOLD).count());
        dashboardData.put("completedProjects", accessibleProjects.stream()
            .filter(p -> p.getStatus() == ProjectStatus.COMPLETED).count());
        
        // Issue statistics
        dashboardData.put("totalIssues", accessibleIssues.size());
        dashboardData.put("openIssues", accessibleIssues.stream()
            .filter(i -> i.getStatus() == IssueStatus.OPEN).count());
        dashboardData.put("inProgressIssues", accessibleIssues.stream()
            .filter(i -> i.getStatus() == IssueStatus.IN_PROGRESS).count());
        dashboardData.put("inReviewIssues", accessibleIssues.stream()
            .filter(i -> i.getStatus() == IssueStatus.IN_REVIEW).count());
        dashboardData.put("resolvedIssues", accessibleIssues.stream()
            .filter(i -> i.getStatus() == IssueStatus.RESOLVED).count());
        dashboardData.put("closedIssues", accessibleIssues.stream()
            .filter(i -> i.getStatus() == IssueStatus.CLOSED).count());
        
        // Critical issues
        dashboardData.put("criticalIssues", accessibleIssues.stream()
            .filter(i -> i.getPriority() == IssuePriority.CRITICAL && 
                    i.getStatus() != IssueStatus.CLOSED && 
                    i.getStatus() != IssueStatus.RESOLVED)
            .count());
        
        // Upcoming deadlines (next 7 days)
        LocalDate today = LocalDate.now();
        LocalDate nextWeek = today.plusDays(7);
        
        List<Map<String, Object>> upcomingDeadlines = accessibleProjects.stream()
            .filter(p -> p.getDeadline() != null && 
                    !p.getDeadline().isBefore(today) && 
                    !p.getDeadline().isAfter(nextWeek) &&
                    p.getStatus() != ProjectStatus.COMPLETED)
            .map(p -> {
                Map<String, Object> deadline = new HashMap<>();
                deadline.put("id", p.getId());
                deadline.put("name", p.getName());
                deadline.put("deadline", p.getDeadline().toString());
                deadline.put("type", "PROJECT");
                return deadline;
            })
            .collect(Collectors.toList());
        
        accessibleIssues.stream()
            .filter(i -> i.getDeadline() != null && 
                    !i.getDeadline().isBefore(today) && 
                    !i.getDeadline().isAfter(nextWeek) &&
                    i.getStatus() != IssueStatus.CLOSED && 
                    i.getStatus() != IssueStatus.RESOLVED)
            .forEach(i -> {
                Map<String, Object> deadline = new HashMap<>();
                deadline.put("id", i.getId());
                deadline.put("name", i.getTitle());
                deadline.put("deadline", i.getDeadline().toString());
                deadline.put("type", "ISSUE");
                deadline.put("projectName", i.getProject().getName());
                upcomingDeadlines.add(deadline);
            });
        
        upcomingDeadlines.sort(Comparator.comparing(d -> d.get("deadline").toString()));
        dashboardData.put("upcomingDeadlines", upcomingDeadlines);
        
        // Recent activity
        List<Activity> recentActivities = activityRepository.findTop10ByUserOrderByCreatedAtDesc(currentUser);
        List<Map<String, Object>> activities = recentActivities.stream()
            .map(a -> {
                Map<String, Object> activity = new HashMap<>();
                activity.put("id", a.getId());
                activity.put("action", a.getAction());
                activity.put("details", a.getDetails());
                activity.put("createdAt", a.getCreatedAt().toString());
                return activity;
            })
            .collect(Collectors.toList());
        dashboardData.put("recentActivities", activities);
        
        return dashboardData;
    }
}
