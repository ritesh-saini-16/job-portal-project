import React from 'react'
import { Route, Routes } from 'react-router-dom'

import Home from './pages/Home'
import ApplyJob from './pages/ApplyJob'
import Applications from './pages/Application' 
import Dashboard from './pages/Dashboard'
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
        
        <Route path='/dashboard' element={<Dashboard />}>
          <Route index element={<AddJob />} />
          <Route path='add-job' element={<AddJob />} />
          <Route path='manage-jobs' element={<ManageJobs />} />
          <Route path='view-applications' element={<ViewApplications />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App
