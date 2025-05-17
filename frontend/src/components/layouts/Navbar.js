import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 px-4 py-2.5">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-xl font-semibold text-blue-700">Brahamand CRM</span>
        </div>
        
        <div className="flex items-center space-x-4">
          {user && (
            <>
              <div className="hidden md:flex items-center space-x-1">
                <span className="text-sm text-gray-700">Welcome,</span>
                <span className="text-sm font-medium text-gray-900">{user.name}</span>
              </div>
              <div className="relative group">
                <button className="flex items-center text-gray-700 hover:text-blue-600 focus:outline-none">
                  <img
                    className="h-8 w-8 rounded-full object-cover"
                    src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                    alt={user.name}
                  />
                  <svg className="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                  <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</Link>
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 