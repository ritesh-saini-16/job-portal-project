import React, { useContext, useState, useRef, useEffect } from "react";
import logo from "../assets/logo.svg";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout, setShowRecruiterLogin, setShowUserLogin, companyData, logoutCompany } = useContext(AppContext);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  const recruiterLogout = () => {
    logoutCompany();
    navigate('/');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  return (
    <div className="shadow py-4">
      <div className="container px-4 2xl:px-20 mx-auto flex justify-between items-center">
        <img className='cursor-pointer' onClick={() => navigate('/')} src={logo} alt="Logo" />

        {user ? (
          <div className='flex items-center gap-4'>
            <Link to={'/applications'} className="text-gray-600 hover:text-gray-900">Applied Jobs</Link>
            <div className='relative' ref={profileMenuRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className='flex items-center gap-2 cursor-pointer hover:opacity-80 transition'
              >
                {user.image ? (
                  <img className='w-8 h-8 rounded-full border border-gray-200 object-cover' src={user.image} alt='profile' />
                ) : (
                  <div className='w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold'>
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
                <span className='max-sm:hidden text-sm font-medium'>{user.name}</span>
              </button>
              {showProfileMenu && (
                <div className='absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-48'>
                  <div className='px-4 py-3 border-b border-gray-100'>
                    <p className='font-semibold text-gray-900'>{user.name}</p>
                    <p className='text-xs text-gray-500'>{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setShowProfileMenu(false);
                    }}
                    className='w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 text-sm font-medium'
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : companyData ? (
          <div className='flex items-center gap-4'>
            <Link to={'/dashboard'} className="text-gray-600 hover:text-gray-900">Dashboard</Link>
            <div className='relative' ref={profileMenuRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className='flex items-center gap-2 cursor-pointer hover:opacity-80 transition'
              >
                {companyData.image ? (
                  <img className='w-8 h-8 rounded-full border border-gray-200 object-cover' src={companyData.image} alt='company' />
                ) : (
                  <div className='w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm font-bold'>
                    {companyData.name?.charAt(0)?.toUpperCase() || 'C'}
                  </div>
                )}
                <span className='max-sm:hidden text-sm font-medium'>{companyData.name}</span>
              </button>
              {showProfileMenu && (
                <div className='absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-48'>
                  <div className='px-4 py-3 border-b border-gray-100'>
                    <p className='font-semibold text-gray-900'>{companyData.name}</p>
                    <p className='text-xs text-gray-500'>{companyData.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      recruiterLogout();
                      setShowProfileMenu(false);
                    }}
                    className='w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 text-sm font-medium'
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex gap-4 max-sm:text-xs">
            <button onClick={() => setShowRecruiterLogin(true)} className="text-gray-600">Recruiter login</button>
            <button
              onClick={() => setShowUserLogin(true)}
              className="bg-blue-600 text-white px-6 sm:px-9 py-2 rounded-full"
            >
              login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
