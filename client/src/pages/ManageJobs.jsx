import React, { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext'

const ManageJobs = () => {
  const navigate = useNavigate()
  const { backendUrl, companyToken } = useContext(AppContext)

  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedJobId, setSelectedJobId] = useState(null)
  const [jobApplicants, setJobApplicants] = useState([])

  // Convert timestamp to matching date format
  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    const options = { day: '2-digit', month: 'short', year: 'numeric' }
    return date.toLocaleDateString('en-GB', options)
  }

  // Fetch company's posted jobs
  useEffect(() => {
    const fetchCompanyJobs = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${backendUrl}/api/companies/list-jobs`, {
          headers: {
            token: companyToken,
          },
        })

        if (response.data.success) {
          setJobs(response.data.jobs)
        } else {
          toast.error(response.data.message || 'Failed to fetch jobs')
        }
      } catch (error) {
        console.error('fetchCompanyJobs error:', error)
        toast.error(error.response?.data?.message || 'Error fetching jobs')
      } finally {
        setLoading(false)
      }
    }

    if (companyToken) {
      fetchCompanyJobs()
    }
  }, [backendUrl, companyToken])

  // Fetch applicants for a specific job
  const handleViewApplicants = async (jobId) => {
    try {
      setSelectedJobId(jobId)
      const response = await axios.get(`${backendUrl}/api/companies/job-applicants`, {
        headers: {
          token: companyToken,
        },
      })

      if (response.data.success) {
        // Filter applicants for this specific job
        const applicantsForJob = response.data.applications.filter(
          (app) => app.jobId && String(app.jobId._id) === String(jobId)
        )
        setJobApplicants(applicantsForJob)
      } else {
        toast.error(response.data.message || 'Failed to fetch applicants')
      }
    } catch (error) {
      console.error('handleViewApplicants error:', error)
      toast.error(error.response?.data?.message || 'Error fetching applicants')
    }
  }

  const closeApplicantsModal = () => {
    setSelectedJobId(null)
    setJobApplicants([])
  }

  // Toggle job visibility
  const handleVisibilityToggle = async (jobId) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/companies/change-visibility`,
        { id: jobId },
        {
          headers: {
            token: companyToken,
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.data.success) {
        // Update job visibility in state
        setJobs(jobs.map(job => 
          job._id === jobId ? { ...job, visible: !job.visible } : job
        ))
        toast.success('Job visibility updated')
      } else {
        toast.error(response.data.message || 'Failed to update visibility')
      }
    } catch (error) {
      console.error('handleVisibilityToggle error:', error)
      toast.error(error.response?.data?.message || 'Error updating visibility')
    }
  }

  if (loading) {
    return (
      <div className='container mx-auto p-4'>
        <p className='text-center text-gray-600'>Loading jobs...</p>
      </div>
    )
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className='container mx-auto p-4'>
        <p className='text-center text-gray-600 mb-4'>No jobs posted yet</p>
        <div className='flex justify-end max-w-4xl'>
          <button onClick={() => navigate('/dashboard/add-job')} className='bg-black text-white py-2 px-4 rounded'>
            Add new job
          </button>
        </div>
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
              <th className='py-3 px-4 text-left'>Job Title</th>
              <th className='py-3 px-4 text-left max-sm:hidden'>Date</th>
              <th className='py-3 px-4 text-left max-sm:hidden'>Location</th>
              <th className='py-3 px-4 text-center'>Applicants</th>
              <th className='py-3 px-4 text-left'>Visible</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job, index) => (
              <tr key={job._id} className='text-gray-700'>
                <td className='py-2 px-4 border-b text-center'>{index + 1}</td>
                <td className='py-2 px-4 border-b'>{job.title}</td>
                <td className='py-2 px-4 border-b max-sm:hidden'>{formatDate(job.date)}</td>
                <td className='py-2 px-4 border-b max-sm:hidden'>{job.location}</td>
                <td className='py-2 px-4 border-b text-center'>
                  <button
                    onClick={() => handleViewApplicants(job._id)}
                    className='text-blue-600 hover:text-blue-800 cursor-pointer'
                  >
                    {job.applicants || 0}
                  </button>
                </td>
                <td className='py-2 px-4 border-b'>
                  <input
                    className='scale-125 ml-4 cursor-pointer'
                    type='checkbox'
                    checked={job.visible}
                    onChange={() => handleVisibilityToggle(job._id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className='mt-4 flex justify-end max-w-4xl'>
        <button onClick={() => navigate('/dashboard/add-job')} className='bg-black text-white py-2 px-4 rounded'>
          Add new job
        </button>
      </div>

      {/* Applicants Modal */}
      {selectedJobId && (
        <div className='fixed inset-0 z-50 bg-black/50 flex justify-center items-center p-4'>
          <div className='bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-96 overflow-auto p-6'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-xl font-bold'>Job Applicants</h2>
              <button
                onClick={closeApplicantsModal}
                className='text-gray-500 hover:text-gray-700 text-2xl'
              >
                ×
              </button>
            </div>

            {jobApplicants.length === 0 ? (
              <p className='text-gray-600 text-center py-4'>No applicants for this job yet</p>
            ) : (
              <div className='space-y-3'>
                {jobApplicants.map((applicant) => (
                  <div key={applicant._id} className='border border-gray-200 rounded p-3 hover:bg-gray-50'>
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <p className='font-semibold text-gray-800'>{applicant.userId?.name}</p>
                        <p className='text-sm text-gray-600'>{applicant.userId?.email}</p>
                        {applicant.userId?.resume && (
                          <p className='text-xs text-blue-600 mt-1'>Resume: Attached</p>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        applicant.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                        applicant.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {applicant.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageJobs

