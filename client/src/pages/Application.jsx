import React, { useState, useEffect, useRef, useContext, useCallback, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import axios from 'axios'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'

const Application = () => {
  const { user, backendUrl, fetchUserData } = useContext(AppContext);
  const navigate = useNavigate()
  const location = useLocation()
  const returnToJob = location.state?.returnTo

  const [isEditingResume, setIsEditingResume] = useState(false)
  const [applications, setApplications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  const fileInputRef = useRef(null)

  const hasResume = useMemo(
    () => Boolean(user?.resume && String(user.resume).trim()),
    [user?.resume]
  )

  const resumeDisplayName = useMemo(() => {
    if (!hasResume) return 'Resume.pdf'
    try {
      const path = user.resume.split('?')[0]
      const seg = path.split('/').filter(Boolean).pop() || 'Resume.pdf'
      return decodeURIComponent(seg).slice(0, 80)
    } catch {
      return 'Resume.pdf'
    }
  }, [user?.resume, hasResume])

  const fetchApplications = useCallback(async () => {
    if (!user) {
      setApplications([])
      setIsLoading(false)
      return
    }

    try {
      const token = localStorage.getItem('jobportal_token')
      const { data } = await axios.get(`${backendUrl}/api/users/applications`, {
        headers: { token }
      })

      if (data.success) {
        setApplications(data.applications || [])
      } else {
        toast.error(data.message || 'Unable to load applications')
      }
    } catch (error) {
      console.error('Error fetching user applications:', error)
      toast.error('Error fetching applications')
    } finally {
      setIsLoading(false)
    }
  }, [user, backendUrl])

  const uploadResumeFile = useCallback(
    async (file) => {
      if (!file) return
      if (file.type !== 'application/pdf') {
        toast.error('Please choose a PDF file')
        return
      }
      try {
        setUploading(true)
        const token = localStorage.getItem('jobportal_token')
        const formData = new FormData()
        formData.append('resume', file)

        const { data } = await axios.post(`${backendUrl}/api/users/update-resume`, formData, {
          headers: {
            token,
            'Content-Type': 'multipart/form-data',
          },
        })

        if (data.success) {
          toast.success(returnToJob ? 'Saved. Back to the job…' : 'Resume saved.')
          setIsEditingResume(false)
          if (fileInputRef.current) fileInputRef.current.value = ''
          await fetchUserData()
          if (returnToJob) {
            navigate(returnToJob, { replace: true, state: {} })
          }
        } else {
          toast.error(data.message || 'Upload failed')
        }
      } catch (error) {
        console.error('Error uploading resume:', error)
        toast.error('Upload failed')
      } finally {
        setUploading(false)
      }
    },
    [backendUrl, fetchUserData, user?.resume, returnToJob, navigate]
  )

  const onResumeFileSelected = (e) => {
    const file = e.target.files?.[0]
    if (file) void uploadResumeFile(file)
  }

  useEffect(() => {
    fetchApplications()
  }, [user, backendUrl, fetchApplications])

  useEffect(() => {
    if (!returnToJob || !user?.id) return
    void fetchUserData()
  }, [returnToJob, user?.id, fetchUserData])

  useEffect(() => {
    if (returnToJob && user && !hasResume) {
      setIsEditingResume(true)
    }
  }, [returnToJob, user, hasResume])

  useEffect(() => {
    if (location.state?.openResubmit && hasResume) {
      setIsEditingResume(true)
    }
  }, [location.state?.openResubmit, hasResume])

  useEffect(() => {
    if (!location.state?.focusResumeUpload) return
    const rt = location.state.returnTo
    const openResubmit = location.state.openResubmit
    const run = () => {
      document.getElementById('resume-upload-section')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
    requestAnimationFrame(run)
    const t = setTimeout(() => {
      const next = {}
      if (rt) next.returnTo = rt
      if (openResubmit) next.openResubmit = true
      navigate(location.pathname, { replace: true, state: Object.keys(next).length ? next : {} })
    }, 80)
    return () => clearTimeout(t)
  }, [location.pathname, location.state?.focusResumeUpload, location.state?.returnTo, location.state?.openResubmit, navigate])

  return (
    <>
      <Navbar />
      <div className='container px-4 min-h-[65vh] 2xl:px-20 mx-auto my-10'>

        {returnToJob && !hasResume && (
          <div className='mb-6 p-4 rounded-lg border border-blue-200 bg-blue-50/80 text-left'>
            <p className='font-semibold text-slate-900'>Add a resume</p>
            <p className='text-sm text-slate-600 mt-1'>
              Pick a PDF below — it saves instantly. We will send you back to the job to apply.
            </p>
          </div>
        )}

        {/* ===== Your Resume Section ===== */}
        <div id='resume-upload-section' className='scroll-mt-24'>
        <h2 className='text-xl font-semibold text-slate-900'>Resume</h2>
        <div className='flex flex-col gap-3 mb-8 mt-4'>
          <input
            ref={fileInputRef}
            id='resumePdf'
            type='file'
            accept='application/pdf'
            className='sr-only'
            disabled={uploading}
            onChange={onResumeFileSelected}
          />

          {!hasResume ? (
            <div className='flex flex-wrap items-center gap-3'>
              <label
                htmlFor='resumePdf'
                className={`inline-flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border ${
                  uploading ? 'opacity-50 pointer-events-none' : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                }`}
              >
                <span className='text-blue-700 font-medium text-sm'>
                  {uploading ? 'Uploading…' : 'Choose PDF'}
                </span>
                <img className='w-4 h-4' src={assets.profile_upload_icon} alt='' />
              </label>
            </div>
          ) : isEditingResume ? (
            <div className='flex flex-col gap-3 sm:flex-row sm:items-center flex-wrap'>
              <p className='text-sm text-gray-600 w-full sm:w-auto'>New PDF replaces the current file.</p>
              <label
                htmlFor='resumePdf'
                className={`inline-flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border ${
                  uploading ? 'opacity-50 pointer-events-none' : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                }`}
              >
                <span className='text-blue-700 font-medium text-sm'>
                  {uploading ? 'Uploading…' : 'Choose new PDF'}
                </span>
                <img className='w-4 h-4' src={assets.profile_upload_icon} alt='' />
              </label>
              <button
                type='button'
                onClick={() => {
                  setIsEditingResume(false)
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }}
                disabled={uploading}
                className='text-sm text-gray-600 border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 disabled:opacity-50'
              >
                Done
              </button>
            </div>
          ) : (
            <div className='flex flex-wrap items-center gap-3'>
              <div className='bg-blue-50 text-blue-800 px-4 py-2 rounded-lg text-sm font-medium max-w-md truncate' title={resumeDisplayName}>
                {resumeDisplayName}
              </div>
              <a
                href={user.resume}
                target='_blank'
                rel='noopener noreferrer'
                className='bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 inline-flex'
                title='Open resume'
              >
                <img className='w-4 h-4' src={assets.resume_download_icon} alt='' />
              </a>
              <button
                type='button'
                onClick={() => setIsEditingResume(true)}
                className='text-sm border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 text-gray-800'
              >
                Replace
              </button>
            </div>
          )}
        </div>
        </div>

        {/* ===== Jobs Applied Table ===== */}
        <h2 className='text-xl font-semibold mb-4 text-slate-900'>Applications</h2>
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
              {isLoading ? (
                <tr>
                  <td colSpan={5} className='py-4 text-center text-gray-500'>Loading applications...</td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={5} className='py-4 text-center text-gray-500'>No applications found.</td>
                </tr>
              ) : (
                applications.map((app, index) => {
                  const job =
                    app.jobId && typeof app.jobId === 'object' && app.jobId !== null ? app.jobId : null
                  const company =
                    app.companyId && typeof app.companyId === 'object' && app.companyId !== null
                      ? app.companyId
                      : {}
                  const status = app.status || 'Pending'
                  const date = app.date ? new Date(app.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'
                  const rowKey = app._id != null ? String(app._id) : `app-${index}`

                  return (
                    <tr key={rowKey} className='border-b text-gray-600'>
                      <td className='py-3 px-4 flex items-center gap-2'>
                        <img className='w-7 h-7 rounded-full' src={company.image || assets.company_icon} alt='' />
                        {company.name || '—'}
                      </td>
                      <td className='py-3 px-4'>{job?.title || '—'}</td>
                      <td className='py-3 px-4 max-sm:hidden'>{job?.location || '—'}</td>
                      <td className='py-3 px-4 max-sm:hidden'>{date}</td>
                      <td className='py-3 px-4'>
                        <span className={`px-4 py-1.5 rounded text-sm 
                          ${status === 'Accepted' ? 'bg-green-100 text-green-600' : ''}
                          ${status === 'Rejected' ? 'bg-red-100 text-red-600' : ''}
                          ${status === 'Pending' ? 'bg-blue-100 text-blue-600' : ''}
                        `}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default Application