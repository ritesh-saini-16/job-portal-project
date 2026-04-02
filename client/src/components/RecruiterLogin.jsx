import React, { useState, useContext, useEffect } from 'react';
import { assets } from '../assets/assets';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const RecruiterLogin = () => {
  const navigate = useNavigate();
  const { setShowRecruiterLogin, backendUrl, setCompanyToken, setCompanyData } = useContext(AppContext);

  const [state, setState] = useState('Login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [image, setImage] = useState(null);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!email || !password || (state === 'Sign Up' && !name)) {
      toast.error('Please fill all fields.');
      return;
    }

    try {
      const endpoint = state === 'Login' ? '/api/recruiters/login' : '/api/recruiters/register';
      
      let response;
      if (state === 'Sign Up') {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email.trim().toLowerCase());
        formData.append('password', password);
        if (image) {
          formData.append('image', image);
        }
        
        response = await axios.post(`${backendUrl}${endpoint}`, formData);
      } else {
        response = await axios.post(`${backendUrl}${endpoint}`, {
          email: email.trim().toLowerCase(),
          password
        });
      }

      const data = response.data;

      if (data.success) {
        // Store recruiter data and token
        setCompanyToken(data.token);
        setCompanyData(data.user);
        localStorage.setItem('companyToken', data.token);
        localStorage.setItem('companyData', JSON.stringify(data.user));
        
        setShowRecruiterLogin(false);
        toast.success(state === 'Login' ? 'Recruiter Login Successful' : 'Recruiter Account Created Successfully');
        navigate('/dashboard');
      } else {
        toast.error(data.message || 'Authentication failed.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Network error');
    }
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className='absolute top-0 left-0 right-0 bottom-0 z-50 backdrop-blur-sm bg-black/30 flex justify-center items-center'>
      <form onSubmit={onSubmitHandler} className='relative bg-white p-10 rounded-xl text-slate-500 shadow-lg w-full max-w-sm'>
        <img
          onClick={() => setShowRecruiterLogin(false)}
          className='absolute top-5 right-5 w-4 h-4 cursor-pointer'
          src={assets.cross_icon}
          alt='Close'
        />

        <h1 className='text-center text-2xl text-neutral-700 font-medium'>Recruiter {state}</h1>
        <p className='text-sm text-center mt-2'>Please fill in your details to continue</p>

        {state === 'Sign Up' && (
          <>
            <div className='border px-4 py-2 flex items-center gap-2 rounded-full mt-5'>
              <img className='w-4 h-4' src={assets.person_icon} alt='' />
              <input
                className='outline-none text-sm w-full'
                value={name}
                onChange={(e) => setName(e.target.value)}
                type='text'
                placeholder='Company Name'
              />
            </div>
            <div className='border px-4 py-2 flex items-center gap-2 rounded-full mt-4'>
              <label htmlFor='recruiterImage' className='text-sm text-gray-500 cursor-pointer flex-1 flex items-center justify-between'>
                {image ? "Change Image" : "Upload Company Logo"}
                {image && <img src={URL.createObjectURL(image)} className="w-6 h-6 rounded-full object-cover" alt="preview"/>}
              </label>
              <input
                id='recruiterImage'
                className='hidden'
                onChange={(e) => setImage(e.target.files[0])}
                type='file'
                accept='image/*'
              />
            </div>
          </>
        )}

        <div className='border px-4 py-2 flex items-center gap-2 rounded-full mt-5'>
          <img className='w-4 h-4' src={assets.email_icon} alt='' />
          <input
            className='outline-none text-sm w-full'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type='email'
            placeholder='Email'
            required
          />
        </div>

        <div className='border px-4 py-2 flex items-center gap-2 rounded-full mt-4'>
          <img className='w-4 h-4' src={assets.lock_icon} alt='' />
          <input
            className='outline-none text-sm w-full'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type='password'
            placeholder='Password'
            required
          />
        </div>

        <button
          type='submit'
          className='bg-blue-600 w-full text-white py-2 rounded-full mt-4 hover:bg-blue-700 transition-colors'
        >
          {state === 'Login' ? 'Login' : 'Create account'}
        </button>

        <p className='mt-5 text-center text-sm text-gray-600'>
          {state === 'Login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <span
            className='text-blue-600 cursor-pointer'
            onClick={() => {
              setState((prev) => (prev === 'Login' ? 'Sign Up' : 'Login'));
            }}
          >
            {state === 'Login' ? 'Sign Up' : 'Login'}
          </span>
        </p>
      </form>
    </div>
  );
};

export default RecruiterLogin;
