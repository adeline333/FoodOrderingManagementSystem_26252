package com.example.OnlineFoodOrdering.controller;

import com.example.OnlineFoodOrdering.dto.SearchResult.GlobalSearchResponse;
import com.example.OnlineFoodOrdering.service.GlobalSearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/search")
@CrossOrigin(origins = "*")
public class SearchController {

    @Autowired
    private GlobalSearchService globalSearchService;

    @GetMapping
    public ResponseEntity<GlobalSearchResponse> globalSearch(@RequestParam String q) {
        GlobalSearchResponse results = globalSearchService.search(q);
        return ResponseEntity.ok(results);
    }
}
