// backend/src/main/java/com/devdesk/repository/IssueRepository.java
package com.devdesk.repository;

import com.devdesk.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IssueRepository extends JpaRepository<Issue, Long> {
    List<Issue> findByProject(Project project);
    List<Issue> findByAssignee(User assignee);
    List<Issue> findByReporter(User reporter);
    List<Issue> findByStatus(IssueStatus status);
    List<Issue> findByPriority(IssuePriority priority);
    List<Issue> findByType(IssueType type);
    List<Issue> findByTitleContainingIgnoreCase(String title);
    
    @Query("SELECT i FROM Issue i WHERE i.project IN :projects")
    List<Issue> findByProjectsIn(@Param("projects") List<Project> projects);
    
    @Query("SELECT COUNT(i) FROM Issue i WHERE i.project IN :projects")
    Long countByProjectsIn(@Param("projects") List<Project> projects);
    
    @Query("SELECT COUNT(i) FROM Issue i WHERE i.project IN :projects AND i.status = :status")
    Long countByProjectsInAndStatus(@Param("projects") List<Project> projects, @Param("status") IssueStatus status);
    
    @Query("SELECT COUNT(i) FROM Issue i WHERE i.project IN :projects AND i.priority = :priority")
    Long countByProjectsInAndPriority(@Param("projects") List<Project> projects, @Param("priority") IssuePriority priority);
    
    @Query("SELECT i FROM Issue i WHERE i.project IN :projects AND i.assignee = :assignee")
    List<Issue> findByProjectsInAndAssignee(@Param("projects") List<Project> projects, @Param("assignee") User assignee);
}
