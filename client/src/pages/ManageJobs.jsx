import React from 'react'
import { manageJobsData } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const ManageJobs = () => {
  const navigate = useNavigate()

  // Convert timestamp to matching date format
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-GB', options); 
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
            {manageJobsData.map((job, index) => (
              <tr key={index} className='text-gray-700'>
                <td className='py-2 px-4 border-b text-center'>{index + 1}</td>
                <td className='py-2 px-4 border-b'>{job.title}</td>
                <td className='py-2 px-4 border-b max-sm:hidden'>{formatDate(job.date)}</td>
                <td className='py-2 px-4 border-b max-sm:hidden'>{job.location}</td>
                <td className='py-2 px-4 border-b text-center'>{job.applicants}</td>
                <td className='py-2 px-4 border-b'>
                  <input className='scale-125 ml-4' type='checkbox' defaultChecked />
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
    </div>
  )
}

export default ManageJobs
