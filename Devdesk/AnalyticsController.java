// backend/src/main/java/com/devdesk/controller/AnalyticsController.java
package com.devdesk.controller;

import com.devdesk.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {
    
    @Autowired
    private AnalyticsService analyticsService;
    
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAnalyticsData() {
        return ResponseEntity.ok(analyticsService.getAnalyticsData());
    }
}
