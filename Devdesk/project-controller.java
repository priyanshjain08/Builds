// backend/src/main/java/com/devdesk/controller/ProjectController.java
package com.devdesk.controller;

import com.devdesk.dto.ProjectDTOs;
import com.devdesk.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {
    
    @Autowired
    private ProjectService projectService;
    
    @GetMapping
    public ResponseEntity<List<ProjectDTOs.ProjectResponse>> getAllProjects() {
        return ResponseEntity.ok(projectService.getAccessibleProjects());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getProject(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(projectService.getProject(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PostMapping
    public ResponseEntity<?> createProject(@Valid @RequestBody ProjectDTOs.ProjectRequest request) {
        try {
            return ResponseEntity.ok(projectService.createProject(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProject(@PathVariable Long id, 
                                          @Valid @RequestBody ProjectDTOs.ProjectRequest request) {
        try {
            return ResponseEntity.ok(projectService.updateProject(id, request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProject(@PathVariable Long id) {
        try {
            projectService.deleteProject(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PostMapping("/{id}/members/{userId}")
    public ResponseEntity<?> addTeamMember(@PathVariable Long id, @PathVariable Long userId) {
        try {
            projectService.addTeamMember(id, userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}/members/{userId}")
    public ResponseEntity<?> removeTeamMember(@PathVariable Long id, @PathVariable Long userId) {
        try {
            projectService.removeTeamMember(id, userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
