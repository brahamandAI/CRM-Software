import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { hasRole, user } = useContext(AuthContext);

  const navItems = [
    { 
      path: '/', 
      name: 'Dashboard', 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      ) 
    },
    { 
      path: '/customers', 
      name: 'Customers', 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 12.094A5.973 5.973 0 004 15v1H1v-1a3 3 0 013.75-2.906z" />
        </svg>
      ) 
    },
    { 
      path: '/interactions', 
      name: 'Interactions', 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
          <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
        </svg>
      ) 
    },
    { 
      path: '/tasks', 
      name: 'Tasks', 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
        </svg>
      ) 
    },
    { 
      path: '/reports', 
      name: 'Reports', 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
      roles: ['admin', 'manager']
    },
    { 
      path: '/users', 
      name: 'Users', 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
      ),
      roles: ['admin']
    },
    { 
      path: '/settings', 
      name: 'Settings', 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
        </svg>
      ),
      roles: ['admin', 'manager']
    }
  ];

  const isAllowed = (item) => {
    // If no roles specified, everyone can access
    if (!item.roles) return true;
    
    // Check each allowed role
    return item.roles.some(role => hasRole(role));
  };

  return (
    <div className="bg-gradient-to-b from-blue-800 to-blue-900 text-white w-64 shrink-0 hidden md:block">
      <div className="p-6 text-center border-b border-blue-700">
        <h1 className="text-xl font-bold">Brahamand CRM</h1>
        {user && (
          <div className="mt-2 text-sm text-blue-200">
            Logged in as: {user.name}
          </div>
        )}
      </div>
      <nav className="mt-5">
        <div className="px-4 py-2 text-xs uppercase tracking-wider text-blue-300">
          Main Menu
        </div>
        <ul className="space-y-1 mb-6">
          {navItems.map((item) => {
            // Skip items the user can't access
            if (!isAllowed(item)) return null;
            
            const isActive = location.pathname === item.path || 
                            (item.path !== '/' && location.pathname.startsWith(item.path));
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 hover:bg-blue-700 transition-colors duration-150 ${
                    isActive ? 'bg-blue-700 border-l-4 border-white' : ''
                  }`}
                >
                  <span className="inline-flex items-center justify-center h-8 w-8">
                    {item.icon}
                  </span>
                  <span className="ml-3">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        
        <div className="px-4 py-2 text-xs uppercase tracking-wider text-blue-300">
          Account
        </div>
        <ul className="space-y-1">
          <li>
            <Link
              to="/profile"
              className={`flex items-center px-4 py-3 hover:bg-blue-700 transition-colors duration-150 ${
                location.pathname === '/profile' ? 'bg-blue-700 border-l-4 border-white' : ''
              }`}
            >
              <span className="inline-flex items-center justify-center h-8 w-8">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" clipRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                </svg>
              </span>
              <span className="ml-3">Profile</span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar; 