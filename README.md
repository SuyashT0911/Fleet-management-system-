# FleetPro - Comprehensive Fleet Management System 🚛

FleetPro is a state-of-the-art Fleet Management System designed to streamline logistics, transport, and fleet operations. Built with a robust Spring Boot backend and a dynamic React frontend, it provides a seamless experience for administrators, drivers, and customers alike.

## 🚀 Project Status
Currently in **Active Development / Beta Phase**. Core modules for fleet tracking, trip management, and personnel dashboards are fully functional.

## 🛠 Tech Stack
### Frontend
- **React 18** (Vite-powered)
- **State Management**: React Hooks & Context API
- **Routing**: React Router DOM
- **Data Visualization**: Recharts
- **Maps & Tracking**: Leaflet (React-Leaflet)
- **Styling**: Vanilla CSS (Premium Dark/Light UI)
- **API Client**: Axios

### Backend
- **Java 17**
- **Framework**: Spring Boot 3.2.x
- **Security**: Spring Security with JWT (JSON Web Tokens)
- **ORM**: Spring Data JPA
- **Database**: MySQL 8.0

### DevOps & Tools
- **Containerization**: Docker (Docker Compose included)
- **API Documentation**: Swagger/OpenAPI
- **Build Tools**: Maven (Backend), NPM/Vite (Frontend)

## 📦 Core Modules
- **User Authentication**: Secure JWT-based login with role-based access control (Admin, Driver, Customer).
- **Fleet Management**: Comprehensive vehicle lifecycle management, including health scoring and distance tracking.
- **Trip & Dispatch**: End-to-end trip scheduling, route assignment, and real-time status updates.
- **Personnel Management**: Dedicated modules for managing Drivers and Customers.
- **Maintenance & Fuel**: Automated logs for vehicle maintenance, service requests, and fuel consumption tracking.
- **Financials**: Integrated expense tracking, automated invoicing, and payment history.
- **Logistics Tools**: Incident reporting, insurance tracking, and vehicle tracking data.

## 📐 Database Design & Relationships
The system uses a relational database schema optimized for logistics. Key entities include:

- **User & Role**: Authentication and authorization.
- **Trip (Central Hub)**: Connects `Vehicle`, `Driver`, `Route`, and `Customer`.
- **Vehicle Tracking**: Stores telemetry data for active vehicles.
- **Maintenance/Fuel**: One-to-Many relationships with `Vehicle`.
- **Invoice/Payment**: Linked to `Trip` and `Customer`.

### Entity Relationships
- `Trip` -> `Vehicle` (M:1)
- `Trip` -> `Driver` (M:1)
- `Trip` -> `Route` (M:1)
- `Trip` -> `Customer` (M:1)
- `Vehicle` -> `VehicleType` (M:1)
- `Maintenance` -> `Vehicle` (M:1)

## 🔄 Workflow
1. **Administrative Setup**: Admin registers vehicles, drivers, and defines routes.
2. **Scheduling**: A trip is scheduled, assigning a specific vehicle and driver to a customer request.
3. **Execution**: Drivers receive trip details on their dashboard and update statuses (Scheduled -> In Progress -> Completed).
4. **Monitoring**: Real-time tracking and health score updates for vehicles based on trip performance.
5. **Closure**: Automated invoice generation upon trip completion and payment processing.

## 📂 Project Structure
```bash
FleetPro/
├── backend/            # Spring Boot Application
│   ├── src/            # Source code (Java)
│   ├── pom.xml         # Maven dependencies
│   └── .env            # Backend configuration
├── frontend/           # React Application
│   ├── src/            # Components, Hooks, Assets
│   ├── package.json    # Frontend dependencies
│   └── vite.config.js  # Vite configuration
├── database/           # SQL scripts & ERD
│   ├── schema.sql      # Database schema
│   ├── seed.sql        # Initial data
│   └── ERD.png         # Database Diagram
└── docker-compose.yml  # Docker orchestration
```

## 🔮 Future Enhancements
- [ ] AI-powered route optimization.
- [ ] Mobile application for Drivers (Android/iOS).
- [ ] Real-time GPS integration via IoT devices.
- [ ] Predictive maintenance alerts using machine learning.
- [ ] Advanced analytics dashboard with deeper business insights.

## 🤝 Contributing
This project is **open source**. Feel free to fork, report issues, or submit pull requests to help improve the Fleet Management ecosystem.

---
*Developed by Suyash Tiwari*
