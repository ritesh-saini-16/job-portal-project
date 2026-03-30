import React from 'react'
import { useContext, useState, useEffect } from 'react'
import { AppContext } from '../context/AppContext'
import { useParams, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Loading from '../components/Loading'
import { convertTo as kconvert } from 'k-converter';
import moment from 'moment';

const ApplyJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [JobData, setJobData] = useState(null);
  const [isAlreadyApplied, setIsAlreadyApplied] = useState(false);

  const { jobs } = useContext(AppContext);

  const fetchJob = async () => {
    const data = jobs.filter(job => job._id === id)

    if (data.length !== 0) {
      setJobData(data[0])
    }
  }

  useEffect(() => {
    if (jobs.length > 0) {
      fetchJob();
    }
  }, [id, jobs]);

  // Get related jobs from the same company
  const relatedJobs = jobs.filter(
    job => job.companyId._id === JobData?.companyId?._id && job._id !== id
  ).slice(0, 4);

  return JobData ? (
    <>
      <Navbar />
      <div className='min-h-screen flex flex-col py-10 container px-4 2xl:px-20 mx-auto'>
        <div className='bg-white text-black rounded-lg w-full'>

          {/* ===== Job Header Card ===== */}
          <div className='flex justify-center md:justify-between flex-wrap gap-8 px-14 py-20 mb-6 bg-sky-50 border border-sky-400 rounded-lg'>
            <div className='flex flex-col md:flex-row items-center'>
              <img className='h-24 bg-white rounded-lg p-4 mr-4 max-md:mb-4 border' src={JobData.companyId.image} alt="" />

              <div className='text-center md:text-left text-neutral-700'>
                <h1 className='text-2xl sm:text-4xl font-medium'>{JobData.title}</h1>
                <div className='flex flex-row flex-wrap max-md:justify-center gap-y-2 gap-6 items-center text-gray-600 mt-2'>
                  <span className='flex items-center gap-1'>
                    <img className='w-4 h-4' src={assets.suitcase_icon} alt="" />
                    {JobData.companyId.name}
                  </span>
                  <span className='flex items-center gap-1'>
                    <img className='w-4 h-4' src={assets.location_icon} alt="" />
                    {JobData.location}
                  </span>
                  <span className='flex items-center gap-1'>
                    <img className='w-4 h-4' src={assets.person_icon} alt="" />
                    {JobData.level}
                  </span>
                  <span className='flex items-center gap-1'>
                    <img className='w-4 h-4' src={assets.money_icon} alt="" />
                    CTC: ${kconvert(JobData.salary)}
                  </span>
                </div>
              </div>
            </div>

            <div className='flex flex-col justify-center text-end text-sm max-md:mx-auto max-md:text-center'>
              <button
                onClick={() => setIsAlreadyApplied(true)}
                className={`px-10 py-2.5 rounded-md text-white ${isAlreadyApplied ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'}`}
                disabled={isAlreadyApplied}
              >
                {isAlreadyApplied ? 'Already Applied' : 'Apply now'}
              </button>
              <p className='mt-1 text-gray-500'>Posted {moment(JobData.date).fromNow()}</p>
            </div>
          </div>

          {/* ===== Job Description + Sidebar ===== */}
          <div className='flex flex-col lg:flex-row justify-between items-start'>

            {/* Left: Job Description */}
            <div className='w-full lg:w-2/3'>
              <h2 className='font-bold text-2xl mb-4'>Job description</h2>
              <div className='rich-text text-gray-700 leading-relaxed' dangerouslySetInnerHTML={{ __html: JobData.description }}></div>
            </div>

            {/* Right: More Jobs Sidebar */}
            <div className='w-full lg:w-1/3 mt-8 lg:mt-0 lg:ml-8'>
              <h2 className='font-bold text-lg mb-5'>
                More jobs from {JobData.companyId.name}
              </h2>
              <div className='flex flex-col gap-4'>
                {relatedJobs.length > 0 ? (
                  relatedJobs.map((job) => (
                    <div key={job._id} className='border rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow'>
                      <div className='flex items-center gap-3 mb-3'>
                        <img className='h-10 w-10 object-contain bg-white rounded border p-1' src={job.companyId.image} alt="" />
                        <h3 className='font-semibold text-base'>{job.title}</h3>
                      </div>
                      <div className='flex items-center gap-2 mb-3 text-xs'>
                        <span className='bg-blue-50 border border-blue-200 px-3 py-1 rounded'>{job.location}</span>
                        <span className='bg-red-50 border border-red-200 px-3 py-1 rounded'>{job.level}</span>
                      </div>
                      <p className='text-gray-500 text-sm mb-3' dangerouslySetInnerHTML={{ __html: job.description.slice(0, 120) + '...' }}></p>
                      <div className='flex gap-3 text-sm'>
                        <button
                          onClick={() => navigate(`/apply-job/${job._id}`)}
                          className='bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700'
                        >
                          Apply now
                        </button>
                        <button
                          onClick={() => navigate(`/apply-job/${job._id}`)}
                          className='bg-white border border-gray-300 text-gray-600 px-4 py-1.5 rounded hover:bg-gray-50'
                        >
                          Learn more
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className='text-gray-500 text-sm'>No other jobs from this company.</p>
                )}
              </div>
            </div>

          </div>

          {/* ===== Apply Button at Bottom ===== */}
          <div className='mt-8 mb-4'>
            <button
              onClick={() => setIsAlreadyApplied(true)}
              className={`px-10 py-2.5 rounded-md text-white ${isAlreadyApplied ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'}`}
              disabled={isAlreadyApplied}
            >
              {isAlreadyApplied ? 'Already Applied' : 'Apply now'}
            </button>
          </div>

        </div>
      </div>
      <Footer />
    </>
  ) : (
    <Loading />
  )
}

export default ApplyJob