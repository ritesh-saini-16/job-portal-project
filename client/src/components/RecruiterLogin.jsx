import React, { useState, useContext, useEffect } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'

const RecruiterLogin = () => {

  const navigate = useNavigate()

  const [state, setState] = useState('Login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [image, setImage] = useState(null)

  const [isTextDataSubmitted, setIsTextDataSubmitted] = useState(false)

  const { setShowRecruiterLogin } = useContext(AppContext)

  const onSubmitHandler = async (e) => {
    e.preventDefault()

    if (state === 'Sign Up' && !isTextDataSubmitted) {
      setIsTextDataSubmitted(true)
      return
    }

    // TODO: Add actual API call for login/signup
    
    // Close modal and navigate to dashboard
    setShowRecruiterLogin(false)
    navigate('/dashboard')
  }

  // Hide body scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  return (
    <div className='absolute top-0 left-0 right-0 bottom-0 z-50 backdrop-blur-sm bg-black/30 flex justify-center items-center'>
      <form onSubmit={onSubmitHandler} className='relative bg-white p-10 rounded-xl text-slate-500 shadow-lg w-full max-w-sm'>
        
        {/* Close Button */}
        <img 
          onClick={() => setShowRecruiterLogin(false)}
          className='absolute top-5 right-5 w-4 h-4 cursor-pointer' 
          src={assets.cross_icon} 
          alt="Close" 
        />
        
        <h1 className='text-center text-2xl text-neutral-700 font-medium'>
          Recruiter {state}
        </h1>
        <p className='text-sm text-center mt-2'>
          Welcome back! Please sign in to continue
        </p>

        {state === 'Sign Up' && isTextDataSubmitted ? (
          <>
            {/* Company Logo Upload */}
            <div className='flex items-center gap-4 my-10'>
              <label htmlFor='image'>
                <img
                  className='w-16 rounded-full'
                  src={image ? URL.createObjectURL(image) : assets.upload_area}
                  alt=""
                />
                <input
                  onChange={(e) => setImage(e.target.files[0])}
                  type="file"
                  id="image"
                  hidden
                />
              </label>
              <p>Upload Company <br /> logo</p>
            </div>
          </>
        ) : (
          <>
            {/* Sign Up: Company Name */}
            {state !== 'Login' && (
              <div className='border px-4 py-2 flex items-center gap-2 rounded-full mt-5'>
                <img className='w-4 h-4' src={assets.person_icon} alt="" />
                <input
                  className='outline-none text-sm w-full'
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  type="text"
                  placeholder='Company Name'
                  required
                />
              </div>
            )}

            {/* Email */}
            <div className='border px-4 py-2 flex items-center gap-2 rounded-full mt-5'>
              <img className='w-4 h-4' src={assets.email_icon} alt="" />
              <input
                className='outline-none text-sm w-full'
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                type="email"
                placeholder='Email Id'
                required
              />
            </div>

            {/* Password */}
            <div className='border px-4 py-2 flex items-center gap-2 rounded-full mt-4'>
              <img className='w-4 h-4' src={assets.lock_icon} alt="" />
              <input
                className='outline-none text-sm w-full'
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                type="password"
                placeholder='Password'
                required
              />
            </div>

            {state === 'Login' && (
              <p className='text-sm text-blue-600 mt-4 cursor-pointer'>Forgot password?</p>
            )}
          </>
        )}

        <button
          type='submit'
          className='bg-blue-600 w-full text-white py-2 rounded-full mt-4 hover:bg-blue-700 transition-colors'
        >
          {state === 'Login' ? 'login' : isTextDataSubmitted ? 'create account' : 'next'}
        </button>

        {state === 'Login' ? (
          <p className='mt-5 text-center text-sm text-gray-600'>
            Don't have an account?{' '}
            <span
              className='text-blue-600 cursor-pointer'
              onClick={() => setState('Sign Up')}
            >
              Sign Up
            </span>
          </p>
        ) : (
          <p className='mt-5 text-center text-sm text-gray-600'>
            Already have an account?{' '}
            <span
              className='text-blue-600 cursor-pointer'
              onClick={() => { setState('Login'); setIsTextDataSubmitted(false) }}
            >
              Login
            </span>
          </p>
        )}
      </form>
    </div>
  )
}

export default RecruiterLogin
