import React, { createContext, useState, useContext } from 'react';
import Toast from '../components/ui/Toast';

// Create context
export const ToastContext = createContext();

// Toast Hook for components to use
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({
    message: '',
    type: 'success',
    visible: false
  });

  // Show success toast
  const showSuccess = (message, duration = 5000) => {
    setToast({
      message,
      type: 'success',
      visible: true,
      duration
    });
  };

  // Show error toast
  const showError = (message, duration = 5000) => {
    setToast({
      message,
      type: 'error',
      visible: true,
      duration
    });
  };

  // Show warning toast
  const showWarning = (message, duration = 5000) => {
    setToast({
      message,
      type: 'warning',
      visible: true,
      duration
    });
  };

  // Show info toast
  const showInfo = (message, duration = 5000) => {
    setToast({
      message,
      type: 'info',
      visible: true,
      duration
    });
  };

  // Clear toast
  const clearToast = () => {
    setToast({
      ...toast,
      visible: false
    });
  };

  return (
    <ToastContext.Provider
      value={{
        showSuccess,
        showError,
        showWarning,
        showInfo,
        clearToast
      }}
    >
      {children}
      {toast.visible && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={clearToast}
        />
      )}
    </ToastContext.Provider>
  );
}; 