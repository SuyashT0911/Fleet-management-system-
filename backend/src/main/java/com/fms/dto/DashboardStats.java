package com.fms.dto;

import java.math.BigDecimal;
public class DashboardStats {
    private long totalVehicles;
    private long activeDrivers;
    private long totalTrips;
    private long ongoingTrips;
    private BigDecimal totalRevenue;
    private BigDecimal totalFuelCost;
    private long pendingMaintenance;
    private long totalCustomers;

    public DashboardStats() {}
    public DashboardStats(long totalVehicles, long activeDrivers, long totalTrips, long ongoingTrips, BigDecimal totalRevenue, BigDecimal totalFuelCost, long pendingMaintenance, long totalCustomers) {
        this.totalVehicles = totalVehicles;
        this.activeDrivers = activeDrivers;
        this.totalTrips = totalTrips;
        this.ongoingTrips = ongoingTrips;
        this.totalRevenue = totalRevenue;
        this.totalFuelCost = totalFuelCost;
        this.pendingMaintenance = pendingMaintenance;
        this.totalCustomers = totalCustomers;
    }

    public long getTotalVehicles() {
        return totalVehicles;
    }

    public void setTotalVehicles(long totalVehicles) {
        this.totalVehicles = totalVehicles;
    }

    public long getActiveDrivers() {
        return activeDrivers;
    }

    public void setActiveDrivers(long activeDrivers) {
        this.activeDrivers = activeDrivers;
    }

    public long getTotalTrips() {
        return totalTrips;
    }

    public void setTotalTrips(long totalTrips) {
        this.totalTrips = totalTrips;
    }

    public long getOngoingTrips() {
        return ongoingTrips;
    }

    public void setOngoingTrips(long ongoingTrips) {
        this.ongoingTrips = ongoingTrips;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public BigDecimal getTotalFuelCost() {
        return totalFuelCost;
    }

    public void setTotalFuelCost(BigDecimal totalFuelCost) {
        this.totalFuelCost = totalFuelCost;
    }

    public long getPendingMaintenance() {
        return pendingMaintenance;
    }

    public void setPendingMaintenance(long pendingMaintenance) {
        this.pendingMaintenance = pendingMaintenance;
    }

    public long getTotalCustomers() {
        return totalCustomers;
    }

    public void setTotalCustomers(long totalCustomers) {
        this.totalCustomers = totalCustomers;
    }

}
