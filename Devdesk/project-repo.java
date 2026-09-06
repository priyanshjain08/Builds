// backend/src/main/java/com/devdesk/repository/ProjectRepository.java
package com.devdesk.repository;

import com.devdesk.entity.Project;
import com.devdesk.entity.ProjectStatus;
import com.devdesk.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByStatus(ProjectStatus status);
    List<Project> findByNameContainingIgnoreCase(String name);
    List<Project> findByCreatedByOrTeamMembersContaining(User createdBy, User teamMember);
    
    @Query("SELECT p FROM Project p WHERE p.createdBy = :user OR :user MEMBER OF p.teamMembers")
    List<Project> findAccessibleProjects(@Param("user") User user);
    
    @Query("SELECT COUNT(p) FROM Project p WHERE p.createdBy = :user OR :user MEMBER OF p.teamMembers")
    Long countAccessibleProjects(@Param("user") User user);
    
    @Query("SELECT COUNT(p) FROM Project p WHERE (p.createdBy = :user OR :user MEMBER OF p.teamMembers) AND p.status = :status")
    Long countAccessibleProjectsByStatus(@Param("user") User user, @Param("status") ProjectStatus status);
}
