import React, { useState, useContext } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

// Icons
import { 
  HomeIcon, 
  UsersIcon, 
  PhoneIcon, 
  ClipboardDocumentListIcon, 
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const DashboardLayout = () => {
  const { user, logout, hasRole } = useContext(AuthContext);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
    { name: 'Customers', path: '/dashboard/customers', icon: UsersIcon },
    { name: 'Interactions', path: '/dashboard/interactions', icon: PhoneIcon },
    { name: 'Tasks', path: '/dashboard/tasks', icon: ClipboardDocumentListIcon },
    // Only show Users link for admin users
    ...(hasRole('admin') 
      ? [{ name: 'Users', path: '/dashboard/users', icon: UsersIcon }] 
      : []
    ),
    { name: 'Profile', path: '/dashboard/profile', icon: UserCircleIcon },
  ];

  return (
    <div className="flex h-screen bg-[#111827]">
      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-[#1a1f2e] transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-700/30">
          <span className="text-xl font-semibold text-white">Web4</span>
          <button 
            className="lg:hidden text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <nav className="py-4">
          <ul>
            {navigation.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => 
                    `flex items-center px-6 py-3 text-sm ${
                      isActive 
                        ? 'bg-gray-700/50 text-white' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                    }`
                  }
                  end={item.path === '/dashboard'}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </NavLink>
              </li>
            ))}
            <li>
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-6 py-3 text-sm text-gray-400 hover:text-white hover:bg-gray-700/30"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-0 lg:ml-64 transition-all duration-300">
        {/* Top Navigation */}
        <header className="bg-[#1a1f2e] border-b border-gray-700/30 shadow-sm z-10">
          <div className="flex items-center justify-between h-16 px-4">
            <button 
              className="lg:hidden text-gray-400 hover:text-white"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            <div className="flex items-center ml-auto space-x-4">
              <button className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700/50">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-white">
                <span className="text-sm">{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout; 