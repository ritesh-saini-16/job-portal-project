import React, { useState, useEffect, useContext, useCallback } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const ViewApplications = () => {
  const { backendUrl, companyToken } = useContext(AppContext)
  const [applications, setApplications] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchApplications = useCallback(async () => {
    if (!companyToken) {
      setApplications([])
      setIsLoading(false)
      return
    }
    try {
      setIsLoading(true)
      const { data } = await axios.get(`${backendUrl}/api/companies/job-applicants`, {
        headers: { token: companyToken }
      })
      if (data.success) {
        setApplications(data.applications || [])
      } else {
        toast.error(data.message || 'Failed to fetch applications')
      }
    } catch (error) {
      console.error('ViewApplications fetch error:', error)
      toast.error('Error fetching applications')
    } finally {
      setIsLoading(false)
    }
  }, [backendUrl, companyToken])

  const handleStatusChange = async (applicationId, status) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/companies/change-status`,
        { id: applicationId, status },
        { headers: { token: companyToken } }
      )
      if (data.success) {
        toast.success(`Application ${status}`)
        setApplications(prev =>
          prev.map(app => app._id === applicationId ? { ...app, status } : app)
        )
      } else {
        toast.error(data.message || 'Failed to update status')
      }
    } catch (error) {
      console.error('Status update error:', error)
      toast.error('Error updating status')
    }
  }

  useEffect(() => {
    void fetchApplications()
  }, [fetchApplications])

  if (isLoading) {
    return (
      <div className='container mx-auto p-4'>
        <p className='text-center text-gray-600'>Loading applications...</p>
      </div>
    )
  }

  if (!applications || applications.length === 0) {
    return (
      <div className='container mx-auto p-4'>
        <p className='text-center text-gray-500 py-8'>No applications received yet.</p>
      </div>
    )
  }

  return (
    <div className='container mx-auto p-4'>
      <div>
        <table className='w-full max-w-4xl bg-white border border-gray-200 max-sm:text-sm rounded-lg'>
          <thead>
            <tr className='border-b border-gray-200'>
              <th className='py-3 px-4 text-left'>#</th>
              <th className='py-3 px-4 text-left'>Applicant</th>
              <th className='py-3 px-4 text-left max-sm:hidden'>Job Title</th>
              <th className='py-3 px-4 text-left max-sm:hidden'>Location</th>
              <th className='py-3 px-4 text-left'>Resume</th>
              <th className='py-3 px-4 text-left'>Action</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((application, index) => (
              <tr key={application._id || index} className='text-gray-700'>
                <td className='py-2 px-4 border-b text-center'>{index + 1}</td>
                <td className='py-2 px-4 border-b flex items-center'>
                  <img
                    className='w-10 h-10 rounded-full mr-3 max-sm:hidden object-cover'
                    src={application.userId?.image || assets.profile_img}
                    alt=""
                  />
                  <span>{application.userId?.name || 'Unknown'}</span>
                </td>
                <td className='py-2 px-4 border-b max-sm:hidden'>{application.jobId?.title || '-'}</td>
                <td className='py-2 px-4 border-b max-sm:hidden'>{application.jobId?.location || '-'}</td>
                <td className='py-2 px-4 border-b'>
                  {application.userId?.resume ? (
                    <a
                      href={application.userId.resume}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='bg-blue-50 text-blue-400 px-3 py-1 rounded inline-flex gap-2 items-center'
                    >
                      Resume <img src={assets.resume_download_icon} alt="" />
                    </a>
                  ) : (
                    <span className='text-gray-400 text-sm'>No resume</span>
                  )}
                </td>
                <td className='py-2 px-4 border-b relative'>
                  {application.status === 'Pending' ? (
                    <div className='relative inline-block text-left group'>
                      <button className='text-gray-500 action-button'>...</button>
                      <div className='z-10 hidden absolute right-0 md:left-0 top-0 mt-2 w-32 bg-white border border-gray-200 rounded shadow group-hover:block'>
                        <button
                          onClick={() => handleStatusChange(application._id, 'Accepted')}
                          className='block w-full text-left px-4 py-2 text-blue-500 hover:bg-gray-100'
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleStatusChange(application._id, 'Rejected')}
                          className='block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100'
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ) : (
                    <span className={`text-xs px-2 py-1 rounded ${
                      application.status === 'Accepted' ? 'bg-green-100 text-green-700' :
                      application.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {application.status}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ViewApplications
