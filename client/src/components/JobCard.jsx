import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const JobCard = ({ job }) => {
  const navigate = useNavigate();

  const companyImage = job?.companyId?.image || assets.company_icon;

  return (
    <div className='border p-6 shadow rounded'>
        <div className='flex justify-between items-center'>
            <img className='h-8 object-contain' src={companyImage} alt={job?.companyId?.name || 'Company'} />
        </div>
        <h4 className='font-medium text-xl mt-2'>{job.title}</h4>
        <div className="flex items-center gap-3 mt-2 text-xs">
            <span className='bg-blue-50 border border-blue-200 px-4 py-1.5 rounded'>{job.location}</span>
            <span className='bg-red-50 border border-red-200 px-4 py-1.5 rounded'>{job.level}</span>
        </div>
        <p className="text-gray-500 text-sm mt-4" dangerouslySetInnerHTML={{ __html: (job.description?.slice(0, 150)) || '' }}></p>
        <div className='flex justify-between items-center mt-4 text-sm font-medium text-blue-600'>
            <button
              onClick={() => navigate(`/apply-job/${job._id}`)}
              className='bg-blue-600 text-white px-4 py-1.5 rounded'
            >
              Apply Now
            </button>
            <button
              onClick={() => navigate(`/apply-job/${job._id}`)}
              className='bg-white border border-gray-200 px-4 py-1.5 rounded'
            >
              Learn More
            </button>
        </div>
    </div>
  )
}

export default JobCard