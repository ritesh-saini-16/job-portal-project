import React, { useContext } from "react";
import logo from "../assets/logo.svg";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout, setShowRecruiterLogin, setShowUserLogin } = useContext(AppContext);

  return (
    <div className="shadow py-4">
      <div className="container px-4 2xl:px-20 mx-auto flex justify-between items-center">
        <img className='cursor-pointer' onClick={() => navigate('/')} src={logo} alt="Logo" />
        {user ? (
          <div className='flex items-center gap-3'>
            <Link to={'/applications'}>Applied Jobs</Link>
            <p>|</p>
            <p className='max-sm:hidden'>Hi, {user.name} </p>
            <button className='text-sm text-red-500' onClick={logout}>
              Logout
            </button>
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
