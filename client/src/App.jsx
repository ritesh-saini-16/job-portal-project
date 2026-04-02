import React from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'

import Home from './pages/Home'
import ApplyJob from './pages/ApplyJob'
import Applications from './pages/Application' 
import Dashboard from './pages/Dashboard'
import DashboardOverview from './pages/DashboardOverview'
import AddJob from './pages/AddJob'
import ManageJobs from './pages/ManageJobs'
import ViewApplications from './pages/ViewApplications'

import RecruiterLogin from './components/RecruiterLogin'
import UserLogin from './components/UserLogin'
import { AppContext } from './context/AppContext'
import { useContext } from 'react'

const App = () => {

  const { showRecruiterLogin, showUserLogin } = useContext(AppContext)

  return (
    <div>
      {showRecruiterLogin && <RecruiterLogin />}
      {showUserLogin && <UserLogin />}
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/apply-job/:id' element={<ApplyJob />} />
        <Route path='/applications' element={<Applications />} />
        
        {/* Dashboard routes — Dashboard itself handles auth redirect */}
        <Route path='/dashboard' element={<Dashboard />}>
          <Route index element={<Navigate to='overview' replace />} />
          <Route path='overview' element={<DashboardOverview />} />
          <Route path='add-job' element={<AddJob />} />
          <Route path='manage-jobs' element={<ManageJobs />} />
          <Route path='view-applications' element={<ViewApplications />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </div>
  )
}

export default App
