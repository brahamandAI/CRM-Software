import React from 'react';

const LoadingSpinner = ({ size = 'md', light = true }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`${sizes[size]} animate-spin`}>
        <svg className="w-full h-full" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke={light ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill={light ? 'rgba(255, 255, 255)' : 'rgba(0, 0, 0)'}
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    </div>
  );
};

export default LoadingSpinner; 