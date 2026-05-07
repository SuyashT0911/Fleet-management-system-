package com.fms.controller;

import com.fms.model.Route;
import com.fms.repository.RouteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/routes")
public class RouteController {

    @Autowired
    private RouteRepository routeRepository;

    @GetMapping
    @CrossOrigin
    public ResponseEntity<List<Route>> getAll() {
        return ResponseEntity.ok(routeRepository.findByPublicRouteTrue());
    }

    @GetMapping("/all")
    public ResponseEntity<List<Route>> getAllForAdmin() {
        return ResponseEntity.ok(routeRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<Route> create(@RequestBody Route route) {
        return ResponseEntity.ok(routeRepository.save(route));
    }

    @PutMapping("/{id}/visibility")
    public ResponseEntity<Route> toggleVisibility(@PathVariable Integer id) {
        return routeRepository.findById(id).map(route -> {
            boolean current = route.getPublicRoute() != null && route.getPublicRoute();
            route.setPublicRoute(!current);
            return ResponseEntity.ok(routeRepository.save(route));
        }).orElse(ResponseEntity.notFound().build());
    }
}
