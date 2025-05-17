# Brahamand CRM

A comprehensive CRM (Customer Relationship Management) system with role-based access control, JWT authentication, and a modern responsive UI.

## Features

- **JWT Authentication**: Secure API with token-based authentication
- **Role-Based Access Control**: Admin, Manager, and Agent roles with appropriate permissions
- **Customer Management**: Track leads, customers, and interactions
- **Task Management**: Assign and manage tasks with due dates and priorities
- **Dashboard**: Role-specific dashboards with relevant metrics and activities
- **Modern UI/UX**: Responsive interface with clean design
  - Toast notifications for feedback
  - Modal forms for quick add/edit operations
  - Sidebar navigation

## Architecture

### Authentication & Authorization

- JWT (JSON Web Token) based authentication
- All API routes are protected with authentication middleware
- Role-based access control for different user levels:
  - **Admin**: Full system access, can manage users and all data
  - **Manager**: Can view all customers and assign tasks to agents
  - **Agent**: Can only view and manage assigned customers

### Frontend

- React.js with React Router for navigation
- Context API for state management (Auth, Toast notifications)
- Responsive UI with Tailwind CSS
- Modal dialogs for forms

### Backend

- Node.js + Express
- MongoDB with Mongoose ODM
- RESTful API design
- JWT authentication middleware

## Authentication Flow

1. User logs in with email/password
2. Server validates credentials and issues a JWT token
3. Client stores token in local storage
4. Token is included in the Authorization header for all API requests
5. Server validates token and extracts user information
6. Authorization middleware checks user role for protected routes

## Role-Based Dashboard

Different dashboard views based on user roles:

- **Admin**: Full system overview, all metrics and data
- **Manager**: Team performance, all customer data
- **Agent**: Only assigned customers and tasks

## UI Components

- **Toast Notifications**: Provide feedback for user actions (success/error)
- **Modal Forms**: Quick add/edit without page navigation
- **Responsive Sidebar**: Navigation menu that adapts to screen size

## Getting Started

### Prerequisites

- Node.js
- MongoDB

### Installation

1. Clone the repository
2. Install dependencies for backend and frontend:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Configure environment variables:
   - Create `.env` file in the backend folder with:
     ```
     PORT=5000
     MONGODB_URI=mongodb://localhost:27017/brahamand-crm
     JWT_SECRET=your_jwt_secret_key
     JWT_EXPIRES_IN=30d
     ```

4. Start the development servers:

```bash
# Start backend server
cd backend
npm run dev

# Start frontend server
cd ../frontend
npm start
```

## License

[MIT](LICENSE) 