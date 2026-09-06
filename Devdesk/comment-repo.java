// backend/src/main/java/com/devdesk/repository/CommentRepository.java
package com.devdesk.repository;

import com.devdesk.entity.Comment;
import com.devdesk.entity.Issue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByIssueOrderByCreatedAtAsc(Issue issue);
    List<Comment> findByIssue(Issue issue);
}

// backend/src/main/java/com/devdesk/repository/ActivityRepository.java
package com.devdesk.repository;

import com.devdesk.entity.Activity;
import com.devdesk.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {
    List<Activity> findTop20ByOrderByCreatedAtDesc();
    List<Activity> findByUserOrderByCreatedAtDesc(User user);
    List<Activity> findTop10ByUserOrderByCreatedAtDesc(User user);
}
