import React, { useContext, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'

const Dashboard = () => {
  const navigate = useNavigate()
  const { user, logout } = useContext(AppContext)

  useEffect(() => {
    if (!user) {
      navigate('/')
    }
  }, [user, navigate])

  return (
    <div className='min-h-screen'>

      {/* Navbar for Recruiter Panel */}
      <div className='shadow py-4'>
        <div className='px-5 flex justify-between items-center'>
          <img onClick={() => navigate('/')} className='max-sm:w-32 cursor-pointer' src={assets.logo} alt="Logo" />
          <div className='flex items-center gap-3'>
            <p className='max-sm:hidden'>Hi, {user?.name || 'Guest'}</p>
            <button className='text-sm text-red-500' onClick={logout}>Logout</button>
          </div>
        </div>
      </div>

      <div className='flex items-start'>

        {/* Left Sidebar */}
        <div className='inline-block min-h-screen border-r-2'>
          <ul className='flex flex-col items-start pt-5 text-gray-800'>
            <NavLink className={({isActive}) => `flex items-center p-3 sm:px-6 gap-2 w-full hover:bg-gray-100 ${isActive && 'bg-blue-100 border-r-4 border-blue-500'}`} to={'/dashboard/manage-jobs'}>
              <img className='min-w-4' src={assets.home_icon} alt="" />
              <p className='max-sm:hidden'>Manage Jobs</p>
            </NavLink>
            <NavLink className={({isActive}) => `flex items-center p-3 sm:px-6 gap-2 w-full hover:bg-gray-100 ${isActive && 'bg-blue-100 border-r-4 border-blue-500'}`} to={'/dashboard/add-job'}>
              <img className='min-w-4' src={assets.add_icon} alt="" />
              <p className='max-sm:hidden'>Add Job</p>
            </NavLink>
            <NavLink className={({isActive}) => `flex items-center p-3 sm:px-6 gap-2 w-full hover:bg-gray-100 ${isActive && 'bg-blue-100 border-r-4 border-blue-500'}`} to={'/dashboard/view-applications'}>
              <img className='min-w-4' src={assets.person_tick_icon} alt="" />
              <p className='max-sm:hidden'>View Applications</p>
            </NavLink>
          </ul>
        </div>

        {/* Content Area */}
        <div className='flex-1 p-8 sm:p-12'>
          <Outlet />
        </div>

      </div>

    </div>
  )
}

export default Dashboard
