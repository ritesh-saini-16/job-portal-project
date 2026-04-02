import React from 'react'
import { useContext, useState, useEffect, useMemo } from 'react'
import { AppContext } from '../context/AppContext'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Loading from '../components/Loading'
import { convertTo as kconvert } from 'k-converter';
import moment from 'moment';

const ApplyJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isAlreadyApplied, setIsAlreadyApplied] = useState(false);
  const [fetchedJob, setFetchedJob] = useState(null);
  const [jobLoadError, setJobLoadError] = useState(false);
  const [applySubmitting, setApplySubmitting] = useState(false);
  const [userApplications, setUserApplications] = useState([]);

  const { jobs, user, backendUrl, fetchUserData } = useContext(AppContext);

  useEffect(() => {
    if (!user?.id || !backendUrl) return;
    let cancelled = false;
    void (async () => {
      await Promise.resolve();
      if (cancelled) return;
      await fetchUserData();
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id, backendUrl, fetchUserData]);

  const jobFromList = useMemo(
    () => jobs.find((job) => String(job._id) === String(id)) ?? null,
    [jobs, id]
  );

  useEffect(() => {
    if (jobFromList || !id || !backendUrl) return;
    let cancelled = false;
    void (async () => {
      await Promise.resolve();
      if (cancelled) return;
      setJobLoadError(false);
      try {
        const { data } = await axios.get(`${backendUrl}/api/jobs/${id}`);
        if (cancelled) return;
        if (data.success && data.job) {
          setFetchedJob(data.job);
        } else {
          setFetchedJob(null);
          setJobLoadError(true);
        }
      } catch (e) {
        if (cancelled) return;
        console.error('ApplyJob fetch job:', e);
        setFetchedJob(null);
        setJobLoadError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, backendUrl, jobFromList]);

  useEffect(() => {
    if (!user?.id || !backendUrl) return;
    let cancelled = false;
    void (async () => {
      await Promise.resolve();
      if (cancelled) return;
      try {
        const token = localStorage.getItem('jobportal_token');
        const { data } = await axios.get(`${backendUrl}/api/users/applications`, {
          headers: { token }
        });
        if (cancelled) return;
        if (data.success) {
          setUserApplications(data.applications || []);
        }
      } catch (e) {
        console.error('Error fetching applications:', e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id, backendUrl]);

  const displayJob = useMemo(() => {
    if (jobFromList) return jobFromList;
    if (fetchedJob && String(fetchedJob._id) === String(id)) return fetchedJob;
    return null;
  }, [jobFromList, fetchedJob, id]);

  const resumeUrl =
    typeof user?.resume === "string" ? user.resume.trim() : user?.resume ? String(user.resume) : "";
  const hasResumeOnProfile = resumeUrl.length > 0;

  const resumeDisplayName = useMemo(() => {
    if (!resumeUrl) return "";
    try {
      const path = resumeUrl.split("?")[0];
      const seg = path.split("/").filter(Boolean).pop() || "Resume.pdf";
      return decodeURIComponent(seg).slice(0, 80);
    } catch {
      return "Resume.pdf";
    }
  }, [resumeUrl]);

  const goToResumeUpload = () => {
    navigate("/applications", {
      state: {
        returnTo: `/apply-job/${id}`,
        focusResumeUpload: true,
      },
    });
  };

  const submitApplication = async () => {
    try {
      setApplySubmitting(true);
      const token = localStorage.getItem("jobportal_token");
      const { data } = await axios.post(
        `${backendUrl}/api/users/apply`,
        { jobId: id },
        { headers: { token, "Content-Type": "application/json" } }
      );

      if (data.success) {
        toast.success(data.message || "Applied successfully");
        setIsAlreadyApplied(true);
        await fetchUserData();
      } else {
        toast.error(data.message || "Unable to apply for job");
      }
    } catch (error) {
      console.error("Error applying for job:", error);
      toast.error(error.response?.data?.message || "Error applying for job");
    } finally {
      setApplySubmitting(false);
    }
  };

  const handleApplyClick = () => {
    if (!user) {
      toast.error("Please login to apply for this job");
      navigate("/");
      return;
    }
    if (isAlreadyApplied) return;

    if (!hasResumeOnProfile) {
      toast.info("Upload your resume below, then return here and tap Apply again.");
      goToResumeUpload();
      return;
    }

    void submitApplication();
  };

  // Get related jobs from the same company (excluding already applied jobs)
  const relatedJobs = jobs.filter(
    (job) =>
      displayJob?.companyId &&
      String(job.companyId?._id) === String(displayJob.companyId._id) &&
      String(job._id) !== String(id) &&
      !userApplications.some(app => String(app.jobId?._id) === String(job._id))
  ).slice(0, 4);

  if (jobLoadError && !displayJob) {
    return (
      <>
        <Navbar />
        <div className="container px-4 py-20 mx-auto text-center">
          <p className="text-gray-600 mb-4">This job could not be found or is no longer available.</p>
          <button type="button" className="text-blue-600" onClick={() => navigate('/')}>
            Back to home
          </button>
        </div>
        <Footer />
      </>
    );
  }

  return displayJob ? (
    <>
      <Navbar />
      <div className='min-h-screen flex flex-col py-10 container px-4 2xl:px-20 mx-auto'>
        <div className='bg-white text-black rounded-lg w-full'>

          {/* ===== Job Header Card ===== */}
          <div className='flex justify-center md:justify-between flex-wrap gap-8 px-14 py-20 mb-6 bg-sky-50 border border-sky-400 rounded-lg'>
            <div className='flex flex-col md:flex-row items-center'>
              <img className='h-24 bg-white rounded-lg p-4 mr-4 max-md:mb-4 border' src={displayJob.companyId?.image || assets.company_icon} alt="" />

              <div className='text-center md:text-left text-neutral-700'>
                <h1 className='text-2xl sm:text-4xl font-medium'>{displayJob.title}</h1>
                <div className='flex flex-row flex-wrap max-md:justify-center gap-y-2 gap-6 items-center text-gray-600 mt-2'>
                  <span className='flex items-center gap-1'>
                    <img className='w-4 h-4' src={assets.suitcase_icon} alt="" />
                    {displayJob.companyId?.name || 'Company'}
                  </span>
                  <span className='flex items-center gap-1'>
                    <img className='w-4 h-4' src={assets.location_icon} alt="" />
                    {displayJob.location}
                  </span>
                  <span className='flex items-center gap-1'>
                    <img className='w-4 h-4' src={assets.person_icon} alt="" />
                    {displayJob.level}
                  </span>
                  <span className='flex items-center gap-1'>
                    <img className='w-4 h-4' src={assets.money_icon} alt="" />
                    CTC: ${kconvert(displayJob.salary)}
                  </span>
                </div>
              </div>
            </div>

            <div className='flex flex-col justify-center text-end text-sm max-md:mx-auto max-md:text-center gap-3 min-w-[240px]'>
              {user && hasResumeOnProfile && (
                <div className='text-left max-md:text-center space-y-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3'>
                  <p className='text-sm font-medium text-neutral-900 truncate' title={resumeDisplayName}>
                    📄 {resumeDisplayName}
                  </p>
                  <button
                    type='button'
                    onClick={() =>
                      navigate("/applications", {
                        state: {
                          returnTo: `/apply-job/${id}`,
                          focusResumeUpload: true,
                          openResubmit: true,
                        },
                      })
                    }
                    className='text-sm text-blue-600 hover:underline'
                  >
                    Resubmit resume
                  </button>
                </div>
              )}
              <button
                type='button'
                onClick={handleApplyClick}
                className={`px-10 py-2.5 rounded-md text-white ${
                  isAlreadyApplied || applySubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                }`}
                disabled={isAlreadyApplied || applySubmitting}
              >
                {applySubmitting
                  ? "Submitting…"
                  : isAlreadyApplied
                    ? "Already Applied"
                    : user && !hasResumeOnProfile
                      ? "Apply now — add resume"
                      : "Apply now"}
              </button>
              <p className='mt-1 text-gray-500'>Posted {moment(displayJob.date).fromNow()}</p>
            </div>
          </div>

          {/* ===== Job Description + Sidebar ===== */}
          <div className='flex flex-col lg:flex-row justify-between items-start'>

            {/* Left: Job Description */}
            <div className='w-full lg:w-2/3'>
              <h2 className='font-bold text-2xl mb-4'>Job description</h2>
              <div className='rich-text text-gray-700 leading-relaxed' dangerouslySetInnerHTML={{ __html: displayJob.description }}></div>
            </div>

            {/* Right: More Jobs Sidebar */}
            <div className='w-full lg:w-1/3 mt-8 lg:mt-0 lg:ml-8'>
              <h2 className='font-bold text-lg mb-5'>
                More jobs from {displayJob.companyId?.name || 'this employer'}
              </h2>
              <div className='flex flex-col gap-4'>
                {relatedJobs.length > 0 ? (
                  relatedJobs.map((job) => (
                    <div key={job._id} className='border rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow'>
                      <div className='flex items-center gap-3 mb-3'>
                        <img className='h-10 w-10 object-contain bg-white rounded border p-1' src={job.companyId?.image || assets.company_icon} alt="" />
                        <h3 className='font-semibold text-base'>{job.title}</h3>
                      </div>
                      <div className='flex items-center gap-2 mb-3 text-xs'>
                        <span className='bg-blue-50 border border-blue-200 px-3 py-1 rounded'>{job.location}</span>
                        <span className='bg-red-50 border border-red-200 px-3 py-1 rounded'>{job.level}</span>
                      </div>
                      <p className='text-gray-500 text-sm mb-3' dangerouslySetInnerHTML={{ __html: (job.description?.slice(0, 120) || '') + '...' }}></p>
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
              type='button'
              onClick={handleApplyClick}
              className={`px-10 py-2.5 rounded-md text-white ${
                isAlreadyApplied || applySubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
              }`}
              disabled={isAlreadyApplied || applySubmitting}
            >
              {applySubmitting
                ? "Submitting…"
                : isAlreadyApplied
                  ? "Already Applied"
                  : user && !hasResumeOnProfile
                    ? "Apply now — add resume"
                    : "Apply now"}
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