import React, { useState, useRef } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { assets, jobsApplied } from '../assets/assets'

const Application = () => {

  const [isEdit, setIsEdit] = useState(false)
  const [resume, setResume] = useState(null)

  const fileInputRef = useRef(null)

  const handleResumeUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setResume(file)
    }
  }

  return (
    <>
      <Navbar />
      <div className='container px-4 min-h-[65vh] 2xl:px-20 mx-auto my-10'>

        {/* ===== Your Resume Section ===== */}
        <h2 className='text-xl font-semibold'>Your Resume</h2>
        <div className='flex gap-2 mb-6 mt-3 items-center'>
          {isEdit || (resume === null && !isEdit) ? (
            <>
              <label
                className='flex items-center cursor-pointer'
                htmlFor='resumeUpload'
              >
                <p className='bg-blue-100 text-blue-600 px-4 py-2 rounded-lg mr-2'>
                  {resume ? resume.name : 'Select Resume'}
                </p>
                <input
                  id='resumeUpload'
                  ref={fileInputRef}
                  onChange={handleResumeUpload}
                  accept='application/pdf'
                  type='file'
                  hidden
                />
                <img className='w-4 h-4 cursor-pointer' src={assets.profile_upload_icon} alt="" />
              </label>
              <button
                onClick={() => setIsEdit(false)}
                className='bg-green-100 text-green-600 border border-green-400 rounded-lg px-4 py-2'
              >
                Save
              </button>
            </>
          ) : (
            <div className='flex gap-2 items-center'>
              <a
                className='bg-blue-100 text-blue-600 px-4 py-2 rounded-lg'
                href={resume ? URL.createObjectURL(resume) : '#'}
                target='_blank'
                rel='noopener noreferrer'
              >
                {resume ? resume.name : 'resume'}
              </a>
              <button
                onClick={() => setIsEdit(true)}
                className='text-gray-500 border border-gray-300 rounded-lg px-4 py-2'
              >
                Edit
              </button>
              <button className='bg-blue-600 text-white rounded-full p-2'>
                <img className='w-4 h-4' src={assets.resume_download_icon} alt="" />
              </button>
            </div>
          )}
        </div>

        {/* ===== Jobs Applied Table ===== */}
        <h2 className='text-xl font-semibold mb-4'>Jobs Applied</h2>
        <div className='overflow-x-auto'>
          <table className='min-w-full bg-white border rounded-lg'>
            <thead>
              <tr className='border-b text-left text-gray-600'>
                <th className='py-3 px-4 font-semibold'>Company</th>
                <th className='py-3 px-4 font-semibold'>Job Title</th>
                <th className='py-3 px-4 font-semibold max-sm:hidden'>Location</th>
                <th className='py-3 px-4 font-semibold max-sm:hidden'>Date</th>
                <th className='py-3 px-4 font-semibold'>Action</th>
              </tr>
            </thead>
            <tbody>
              {jobsApplied.map((job, index) => (
                <tr key={index} className='border-b text-gray-600'>
                  <td className='py-3 px-4 flex items-center gap-2'>
                    <img className='w-7 h-7 rounded-full' src={job.logo} alt="" />
                    {job.company}
                  </td>
                  <td className='py-3 px-4'>{job.title}</td>
                  <td className='py-3 px-4 max-sm:hidden'>{job.location}</td>
                  <td className='py-3 px-4 max-sm:hidden'>{job.date}</td>
                  <td className='py-3 px-4'>
                    <span className={`px-4 py-1.5 rounded text-sm 
                      ${job.status === 'Accepted' ? 'bg-green-100 text-green-600' : ''}
                      ${job.status === 'Rejected' ? 'bg-red-100 text-red-600' : ''}
                      ${job.status === 'Pending' ? 'bg-blue-100 text-blue-600' : ''}
                    `}>
                      {job.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default Application