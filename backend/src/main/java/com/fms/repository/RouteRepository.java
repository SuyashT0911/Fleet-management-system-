package com.fms.repository;

import com.fms.model.Route;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RouteRepository extends JpaRepository<Route, Integer> {
    List<Route> findByPublicRouteTrue();
}
