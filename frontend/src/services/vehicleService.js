import api from './api';

// Vehicles
export const getVehicles = () => api.get('/vehicles');
export const getVehicle = (id) => api.get(`/vehicles/${id}`);
export const createVehicle = (data) => api.post('/vehicles', data);
export const updateVehicle = (id, data) => api.put(`/vehicles/${id}`, data);
export const deleteVehicle = (id) => api.delete(`/vehicles/${id}`);

// Drivers
export const getDrivers = () => api.get('/drivers');
export const getDriver = (id) => api.get(`/drivers/${id}`);
export const createDriver = (data) => api.post('/drivers', data);
export const updateDriver = (id, data) => api.put(`/drivers/${id}`, data);
export const deleteDriver = (id) => api.delete(`/drivers/${id}`);

// Trips
export const getTrips = () => api.get('/trips');
export const getTrip = (id) => api.get(`/trips/${id}`);
export const createTrip = (data) => api.post('/trips', data);
export const updateTrip = (id, data) => api.put(`/trips/${id}`, data);
export const deleteTrip = (id) => api.delete(`/trips/${id}`);

// Maintenance
export const getMaintenance = () => api.get('/maintenance');
export const createMaintenance = (data) => api.post('/maintenance', data);
export const updateMaintenance = (id, data) => api.put(`/maintenance/${id}`, data);

// Fuel
export const getFuelLogs = () => api.get('/fuel');
export const createFuelLog = (data) => api.post('/fuel', data);
export const updateFuelLog = (id, data) => api.put(`/fuel/${id}`, data);

// Payments
export const getPayments = () => api.get('/payments');
export const createPayment = (data) => api.post('/payments', data);
export const updatePayment = (id, data) => api.put(`/payments/${id}`, data);

// Routes
export const getRoutes = () => api.get('/routes');
export const createRoute = (data) => api.post('/routes', data);

// Incidents
export const getIncidents = () => api.get('/incidents');
export const createIncident = (data) => api.post('/incidents', data);
export const updateIncident = (id, data) => api.put(`/incidents/${id}`, data);

// Feedback
export const getFeedback = () => api.get('/feedback');
export const createFeedback = (data) => api.post('/feedback', data);
export const replyToFeedback = (id, reply) => api.put(`/feedback/${id}/reply`, { adminReply: reply });

// Dashboard Stats
export const getDashboardStats = () => api.get('/dashboard/stats');

// User management (Admin)
export const getUsers = () => api.get('/users');
export const updateUserRole = (id, role) => api.put(`/users/${id}/role`, { role });
export const updateUserStatus = (id, status) => api.put(`/users/${id}/status`, { status });
export const deleteUser = (id) => api.delete(`/users/${id}`);
