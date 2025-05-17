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
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-blue-600 text-white transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-blue-500">
          <span className="text-xl font-semibold">Brahamand CRM</span>
          <button 
            className="lg:hidden text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="px-4 py-2 border-b border-blue-500">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center">
              <span className="text-white font-semibold">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <div className="text-sm font-medium">{user?.name || 'User'}</div>
              <div className="text-xs text-blue-200 capitalize">{user?.role || 'User'}</div>
            </div>
          </div>
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
                        ? 'bg-blue-700 text-white' 
                        : 'text-blue-100 hover:bg-blue-700'
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
                className="w-full flex items-center px-6 py-3 text-sm text-blue-100 hover:bg-blue-700"
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
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between h-16 px-4">
            <button 
              className="lg:hidden text-gray-600"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            <div className="flex items-center ml-auto">
              <div className="text-right mr-4">
                <div className="text-sm font-medium text-gray-700">{user?.name || 'User'}</div>
                <div className="text-xs text-gray-500 capitalize">{user?.role || 'User'}</div>
              </div>
              <button
                onClick={() => navigate('/dashboard/profile')}
                className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white"
              >
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4">
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