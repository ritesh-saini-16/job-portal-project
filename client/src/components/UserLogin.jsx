import React, { useState, useContext, useEffect } from 'react';
import { assets } from '../assets/assets';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const UserLogin = () => {
  const navigate = useNavigate();
  const { setShowUserLogin, login } = useContext(AppContext);

  const [state, setState] = useState('Login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!email || !password || (state === 'Sign Up' && !name)) {
      setError('Please fill all fields.');
      return;
    }

    try {
      const endpoint = state === 'Login' ? '/api/users/login' : '/api/users/register';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: state === 'Sign Up' ? name : undefined,
          email: email.trim().toLowerCase(),
          password,
          image: image ? URL.createObjectURL(image) : '',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Authentication failed.');
        return;
      }

      login(data.user, data.token);
      setShowUserLogin(false);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Network error');
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
          onClick={() => setShowUserLogin(false)}
          className='absolute top-5 right-5 w-4 h-4 cursor-pointer'
          src={assets.cross_icon}
          alt='Close'
        />

        <h1 className='text-center text-2xl text-neutral-700 font-medium'>User {state}</h1>
        <p className='text-sm text-center mt-2'>Please fill in your details to continue</p>

        {error && <p className='text-red-500 text-sm mt-3'>{error}</p>}

        {state === 'Sign Up' && (
          <div className='border px-4 py-2 flex items-center gap-2 rounded-full mt-5'>
            <img className='w-4 h-4' src={assets.person_icon} alt='' />
            <input
              className='outline-none text-sm w-full'
              value={name}
              onChange={(e) => setName(e.target.value)}
              type='text'
              placeholder='Full Name'
            />
          </div>
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
              setError('');
            }}
          >
            {state === 'Login' ? 'Sign Up' : 'Login'}
          </span>
        </p>
      </form>
    </div>
  );
};

export default UserLogin;
