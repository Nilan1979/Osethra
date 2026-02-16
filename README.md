# Osethra - Hospital Management System

## Project Overview
Osethra is a Full Stack Hospital Management System designed to streamline hospital operations.
The system is built with React.js and Material UI on the frontend, Node.js and Express.js on the backend,
and MongoDB as the database. It supports role-based access for hospital staff and does not provide direct
patient access.

## System Architecture
- **Frontend:** React.js + Material UI for the user interface and client-side workflows.
- **Backend:** Node.js + Express.js for REST API endpoints and business logic.
- **Database:** MongoDB for data persistence and flexible schema modeling.

## Features
- **User Management (Role-based access)**
- **Doctor Management**
- **Appointment Management** (handled by receptionist)
- **Pharmacy and Inventory Management**
- **Patient Admit Management**
- **Billing and Payment Management**

## Technologies Used
- **Frontend:** React.js, Material UI
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Tooling:** Vite, ESLint

## Project Structure
```
Osethra  Web App/
├── client/                 # React frontend
│   ├── public/
│   └── src/
│       ├── api/            # API client helpers
│       ├── assets/         # Images and static assets
│       ├── components/     # Reusable UI components
│       ├── context/        # React context providers
│       ├── pages/          # Route-level pages
│       ├── services/       # Service abstractions
│       └── theme/          # MUI theme configuration
├── server/                 # Node.js + Express backend
│   ├── Controllers/        # Request handlers and business logic
│   ├── Middleware/         # Auth, validation, and other middleware
│   ├── Model/              # Mongoose models
│   ├── Routes/             # API route definitions
│   └── Utils/              # Helpers and utilities
└── README.md
```

## Installation and Setup
1. Clone the repository.
2. Install frontend dependencies.
3. Install backend dependencies.
4. Configure environment variables.
5. Start the backend server and the frontend app.

## How to Run the Project
### Backend
```bash
cd server
npm install
npm run dev
```

### Frontend
```bash
cd client
npm install
npm run dev
```

## API Endpoints Overview
> Replace or expand these with your actual routes as needed.

- **Auth and Users**: `/api/users`, `/api/auth`
- **Doctors**: `/api/doctors`
- **Appointments**: `/api/appointments`
- **Patients**: `/api/patients`
- **Inventory and Pharmacy**: `/api/inventory`
- **Billing**: `/api/billing`

## Future Enhancements
- Advanced analytics and reports dashboard
- Notifications and reminders (email or SMS)
- Multi-branch hospital support
- Audit logs for compliance


