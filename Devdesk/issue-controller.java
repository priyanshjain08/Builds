// backend/src/main/java/com/devdesk/controller/IssueController.java
package com.devdesk.controller;

import com.devdesk.dto.IssueDTOs;
import com.devdesk.service.IssueService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/issues")
public class IssueController {
    
    @Autowired
    private IssueService issueService;
    
    @GetMapping
    public ResponseEntity<List<IssueDTOs.IssueResponse>> getAllIssues() {
        return ResponseEntity.ok(issueService.getAccessibleIssues());
    }
    
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<IssueDTOs.IssueResponse>> getIssuesByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(issueService.getIssuesByProject(projectId));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getIssue(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(issueService.getIssue(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PostMapping
    public ResponseEntity<?> createIssue(@Valid @RequestBody IssueDTOs.IssueRequest request) {
        try {
            return ResponseEntity.ok(issueService.createIssue(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateIssue(@PathVariable Long id, 
                                        @Valid @RequestBody IssueDTOs.IssueRequest request) {
        try {
            return ResponseEntity.ok(issueService.updateIssue(id, request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteIssue(@PathVariable Long id) {
        try {
            issueService.deleteIssue(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/{id}/comments")
    public ResponseEntity<List<IssueDTOs.CommentResponse>> getComments(@PathVariable Long id) {
        return ResponseEntity.ok(issueService.getComments(id));
    }
    
    @PostMapping("/{id}/comments")
    public ResponseEntity<?> addComment(@PathVariable Long id, 
                                       @Valid @RequestBody IssueDTOs.CommentRequest request) {
        try {
            return ResponseEntity.ok(issueService.addComment(id, request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}/comments/{commentId}")
    public ResponseEntity<?> deleteComment(@PathVariable Long id, @PathVariable Long commentId) {
        try {
            issueService.deleteComment(id, commentId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
