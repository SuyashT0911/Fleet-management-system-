import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { FiTruck, FiNavigation, FiDollarSign, FiDroplet, FiUsers, FiStar } from 'react-icons/fi';
import api from '../../services/api';

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6'];
const tooltipStyle = { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, color: '#0f172a', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' };

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState([]);
  const [vehicleUsage, setVehicleUsage] = useState([]);
  const [driverPerformance, setDriverPerformance] = useState([]);
  const [fuelTrend, setFuelTrend] = useState([]);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const [tripsRes, vehiclesRes, driversRes, fuelRes, feedbackRes, paymentsRes] = await Promise.all([
          api.get('/trips'),
          api.get('/vehicles'),
          api.get('/drivers'),
          api.get('/fuel'),
          api.get('/feedback'),
          api.get('/payments'),
        ]);

        const trips = tripsRes.data;
        const vehicles = vehiclesRes.data;
        const drivers = driversRes.data;
        const fuelLogs = fuelRes.data;
        const feedback = feedbackRes.data;
        const payments = paymentsRes.data;
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const revMap = {};
        payments.forEach(p => {
          if (!p.paymentDate && p.trip?.startTime) p.paymentDate = p.trip.startTime;
          if (!p.paymentDate) return;
          if (!['paid', 'completed', 'success'].includes(p.status?.toLowerCase())) return;
          
          const d = new Date(p.paymentDate);
          const year = d.getFullYear();
          const monthIndex = d.getMonth();
          
          if (year !== currentYear || monthIndex > currentMonth) return;

          const key = months[monthIndex];
          const sortKey = monthIndex;
          
          if (!revMap[key]) revMap[key] = { key, month: months[monthIndex], year, sortKey, revenue: 0, trips: 0 };
          revMap[key].revenue += parseFloat(p.amount || 0);
          revMap[key].trips += 1;
        });

        // Fuel cost by month
        const fuelMap = {};
        fuelLogs.forEach(f => {
          if (!f.date) return;
          const d = new Date(f.date);
          const year = d.getFullYear();
          const monthIndex = d.getMonth();

          if (year !== currentYear || monthIndex > currentMonth) return;

          const key = months[monthIndex];
          const sortKey = monthIndex;

          if (!fuelMap[key]) fuelMap[key] = { key, month: months[monthIndex], year, sortKey, cost: 0 };
          fuelMap[key].cost += parseFloat(f.cost || 0);
        });

        // Merge for only months up to now
        const mergedRevenue = months.slice(0, currentMonth + 1).map((m, i) => {
          const r = revMap[m];
          const f = fuelMap[m];
          return {
            month: m,
            revenue: r?.revenue || 0,
            expenses: f?.cost || 0,
            trips: r?.trips || 0,
            sortKey: i
          };
        });

        setRevenueData(mergedRevenue.length > 0 ? mergedRevenue : [{ month: 'No Data', revenue: 0, expenses: 0 }]);

        // Vehicle usage by type
        const typeMap = {};
        vehicles.forEach(v => {
          const type = v.vehicleType?.typeName || 'Other';
          typeMap[type] = (typeMap[type] || 0) + 1;
        });
        setVehicleUsage(Object.entries(typeMap).map(([name, value], i) => ({
          name, value, color: COLORS[i % COLORS.length]
        })));

        // Driver performance
        const driverMap = {};
        drivers.forEach(d => {
          driverMap[d.driverId] = { name: d.name, trips: 0, rating: 0, ratingCount: 0 };
        });
        trips.forEach(t => {
          if (!t.startTime) return;
          const d = new Date(t.startTime);
          if (d.getFullYear() !== currentYear || d.getMonth() > currentMonth) return;

          if (t.driver && driverMap[t.driver.driverId]) {
            driverMap[t.driver.driverId].trips += 1;
          }
        });
        // Add ratings from feedback
        feedback.forEach(fb => {
          if (!fb.createdAt) return;
          const fd = new Date(fb.createdAt);
          if (fd.getFullYear() !== currentYear || fd.getMonth() > currentMonth) return;

          const trip = trips.find(t => t.tripId === fb.trip?.tripId);
          if (trip?.driver && driverMap[trip.driver.driverId]) {
            driverMap[trip.driver.driverId].rating += fb.rating || 0;
            driverMap[trip.driver.driverId].ratingCount += 1;
          }
        });
        const driverArr = Object.values(driverMap)
          .map(d => ({
            ...d,
            rating: d.ratingCount > 0 ? (d.rating / d.ratingCount).toFixed(1) : 'N/A'
          }))
          .sort((a, b) => b.trips - a.trips)
          .slice(0, 8);
        setDriverPerformance(driverArr.length > 0 ? driverArr : [{ name: 'No Data', trips: 0 }]);

        // Fuel trend (sorted)
        const fuelTrendData = months.slice(0, currentMonth + 1).map((m, i) => {
          const f = fuelMap[m];
          return {
            month: m,
            cost: f?.cost || 0,
            sortKey: i
          };
        });
        setFuelTrend(fuelTrendData.length > 0 ? fuelTrendData : [{ month: 'No Data', cost: 0 }]);

      } catch (err) { console.error('Report data fetch error', err); }
      finally { setLoading(false); }
    };
    fetchReportData();
  }, []);

  if (loading) return (
    <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <p style={{ color: 'var(--text-muted)' }}>Generating reports...</p>
    </div>
  );

  return (
    <div className="page-content">
      <div className="page-header">
        <div><h1>Reports & Analytics</h1><p>Comprehensive fleet performance analysis from real-time data</p></div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Revenue vs Fuel Expenses</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 13 }} />
              <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} name="Revenue (₹)" />
              <Bar dataKey="expenses" fill="#ef4444" radius={[6, 6, 0, 0]} name="Fuel Cost (₹)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Fleet Composition by Type</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={vehicleUsage.length > 0 ? vehicleUsage : [{ name: 'No Data', value: 1, color: '#e2e8f0' }]}
                cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={5} dataKey="value">
                {(vehicleUsage.length > 0 ? vehicleUsage : [{ color: '#e2e8f0' }]).map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 13 }} formatter={(v) => <span style={{ color: '#475569' }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Driver Performance (Trips Completed)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={driverPerformance} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" stroke="#64748b" fontSize={12} />
              <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} width={80} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="trips" fill="#6366f1" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Fuel Cost Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={fuelTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="cost" stroke="#06b6d4" strokeWidth={2.5} dot={{ fill: '#06b6d4', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Reports;
