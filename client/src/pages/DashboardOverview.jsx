import React, { useState, useEffect, useContext } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const DashboardOverview = () => {
  const { backendUrl, companyToken } = useContext(AppContext)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const { data } = await axios.get(`${backendUrl}/api/companies/stats`, {
          headers: { token: companyToken }
        })
        if (data.success) {
          setStats(data.stats)
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
        toast.error('Failed to load dashboard stats')
      } finally {
        setLoading(false)
      }
    }

    if (companyToken) {
      fetchStats()
    }
  }, [backendUrl, companyToken])

  if (loading) {
    return <div className='p-8 text-center'>Loading stats...</div>
  }

  return (
    <div className='p-4'>
      <h1 className='text-2xl font-bold mb-6'>Dashboard Overview</h1>
      
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10'>
        <div className='bg-white p-6 rounded-lg shadow border-l-4 border-blue-500'>
          <p className='text-gray-500 text-sm font-medium uppercase'>Total Jobs</p>
          <p className='text-3xl font-bold text-gray-800'>{stats?.totalJobs || 0}</p>
        </div>
        
        <div className='bg-white p-6 rounded-lg shadow border-l-4 border-purple-500'>
          <p className='text-gray-500 text-sm font-medium uppercase'>Total Applications</p>
          <p className='text-3xl font-bold text-gray-800'>{stats?.totalApplications || 0}</p>
        </div>
        
        <div className='bg-white p-6 rounded-lg shadow border-l-4 border-green-500'>
          <p className='text-gray-500 text-sm font-medium uppercase'>Accepted</p>
          <p className='text-3xl font-bold text-gray-800'>{stats?.acceptedApplications || 0}</p>
        </div>

        <div className='bg-white p-6 rounded-lg shadow border-l-4 border-red-500'>
          <p className='text-gray-500 text-sm font-medium uppercase'>Rejected</p>
          <p className='text-3xl font-bold text-gray-800'>{stats?.rejectedApplications || 0}</p>
        </div>
      </div>
    </div>
  )
}

export default DashboardOverview
