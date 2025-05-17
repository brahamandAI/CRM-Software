import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import PrivateRoute from './components/auth/PrivateRoute';
import CustomerList from './pages/customers/CustomerList';
import CustomerDetail from './pages/customers/CustomerDetail';
import CustomerForm from './pages/customers/CustomerForm';
import InteractionDetail from './pages/customers/InteractionDetail';
import TaskList from './pages/tasks/TaskList';
import TaskDetail from './pages/tasks/TaskDetail';
import Navbar from './components/layouts/Navbar';
import Sidebar from './components/layouts/Sidebar';
import Profile from './pages/auth/Profile';
import Settings from './pages/settings/Settings';

// Layout component for authenticated pages
const AuthenticatedLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-6 flex">
        <Sidebar />
        <main className="flex-1 ml-0 lg:ml-64 mt-16 pb-8">
          {children}
        </main>
      </div>
    </div>
  );
};

// Root component that handles routing
function AppRoutes() {
  const { isAuthenticated, loading } = useContext(AuthContext);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected routes - wrap in AuthenticatedLayout */}
      <Route 
        path="/" 
        element={
          <PrivateRoute>
            <AuthenticatedLayout>
              <Dashboard />
            </AuthenticatedLayout>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          <PrivateRoute>
            <AuthenticatedLayout>
              <Dashboard />
            </AuthenticatedLayout>
          </PrivateRoute>
        } 
      />
      
      {/* Customer routes */}
      <Route 
        path="/customers" 
        element={
          <PrivateRoute>
            <AuthenticatedLayout>
              <CustomerList />
            </AuthenticatedLayout>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/customers/new" 
        element={
          <PrivateRoute>
            <AuthenticatedLayout>
              <CustomerForm />
            </AuthenticatedLayout>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/customers/:id" 
        element={
          <PrivateRoute>
            <AuthenticatedLayout>
              <CustomerDetail />
            </AuthenticatedLayout>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/customers/:id/edit" 
        element={
          <PrivateRoute>
            <AuthenticatedLayout>
              <CustomerForm />
            </AuthenticatedLayout>
          </PrivateRoute>
        } 
      />
      
      {/* Interaction routes */}
      <Route 
        path="/interactions/:id" 
        element={
          <PrivateRoute>
            <AuthenticatedLayout>
              <InteractionDetail />
            </AuthenticatedLayout>
          </PrivateRoute>
        } 
      />
      
      {/* Task routes */}
      <Route 
        path="/tasks" 
        element={
          <PrivateRoute>
            <AuthenticatedLayout>
              <TaskList />
            </AuthenticatedLayout>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/tasks/:id" 
        element={
          <PrivateRoute>
            <AuthenticatedLayout>
              <TaskDetail />
            </AuthenticatedLayout>
          </PrivateRoute>
        } 
      />
      
      {/* Profile route */}
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <AuthenticatedLayout>
              <Profile />
            </AuthenticatedLayout>
          </PrivateRoute>
        }
      />
      
      {/* Settings route */}
      <Route
        path="/settings"
        element={
          <PrivateRoute>
            <AuthenticatedLayout>
              <Settings />
            </AuthenticatedLayout>
          </PrivateRoute>
        }
      />
      
      {/* Default redirect - send to login if not authenticated, otherwise dashboard */}
      <Route path="*" element={isAuthenticated ? <Navigate to="/" /> : <Navigate to="/login" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <AppRoutes />
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App; 