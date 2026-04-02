import React, { useState, useEffect, useRef, useContext } from 'react'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext'

const AddJob = () => {
  const { backendUrl, companyToken, setJobs } = useContext(AppContext)

  const [_title, setTitle] = useState('')
  const [_description, setDescription] = useState('')
  const [_category, setCategory] = useState('Programming')
  const [_location, setLocation] = useState('Bangalore')
  const [_level, setLevel] = useState('Beginner level')
  const [salary, setSalary] = useState(0)

  const editorRef = useRef(null)
  const quillRef = useRef(null)

  const onSubmitHandler = async (e) => {
    e.preventDefault()

    if (!_title.trim() || !_description.trim() || _description === '<p><br></p>' || !_category || !_location || !_level || salary <= 0) {
      toast.error('Please fill all fields and set a valid salary.')
      return
    }

    try {
      const response = await axios.post(
        `${backendUrl}/api/companies/post-job`,
        {
          title: _title.trim(),
          description: _description,
          category: _category,
          location: _location,
          level: _level,
          salary: Number(salary),
        },
        {
          headers: {
            token: companyToken,
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.data.success) {
        toast.success('Job added successfully')

        // Refresh job list in context if setJobs exists
        if (typeof setJobs === 'function') {
          setJobs(prev => [response.data.job, ...prev])
        }

        setTitle('')
        setDescription('')
        setCategory('Programming')
        setLocation('Bangalore')
        setLevel('Beginner level')
        setSalary(0)

        if (quillRef.current) {
          quillRef.current.root.innerHTML = ''
        }
      } else {
        toast.error(response.data.message || 'Job creation failed')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Server error while posting job')
      console.error('AddJob onSubmit error:', error)
    }
  }

  useEffect(() => {
    // Initialize Quill only once
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow'
      })

      // Update state when editor changes
      quillRef.current.on('text-change', () => {
        setDescription(quillRef.current.root.innerHTML)
      })
    }
  }, [])

  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col items-start gap-4'>

      <div>
        <p className='text-sm text-gray-700 mb-2'>Job Title</p>
        <input 
          className='w-full max-w-lg px-3 py-2 border rounded outline-none' 
          type="text" 
          placeholder='Type here' 
          onChange={e => setTitle(e.target.value)} 
          value={_title} 
          required 
        />
      </div>

      <div className='w-full'>
        <p className='text-sm text-gray-700 mb-2'>Job Description</p>
        <div className='w-full max-w-lg mb-4'>
          <div ref={editorRef} className='h-32'></div>
        </div>
      </div>

      <div className='flex flex-col sm:flex-row gap-4 w-full sm:max-w-lg'>
        <div>
          <p className='text-sm text-gray-700 mb-2'>Job Category</p>
          <select 
            className='w-full px-3 py-2 border rounded outline-none text-gray-500' 
            onChange={e => setCategory(e.target.value)}
          >
            <option value="Programming">Programming</option>
            <option value="Data Science">Data Science</option>
            <option value="Designing">Designing</option>
            <option value="Networking">Networking</option>
            <option value="Management">Management</option>
          </select>
        </div>

        <div>
          <p className='text-sm text-gray-700 mb-2'>Job Location</p>
          <select 
            className='w-full px-3 py-2 border rounded outline-none text-gray-500' 
            onChange={e => setLocation(e.target.value)}
          >
            <option value="Bangalore">Bangalore</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Pune">Pune</option>
            <option value="Chennai">Chennai</option>
          </select>
        </div>

        <div>
          <p className='text-sm text-gray-700 mb-2'>Job Level</p>
          <select 
            className='w-full px-3 py-2 border rounded outline-none text-gray-500' 
            onChange={e => setLevel(e.target.value)}
          >
            <option value="Beginner level">Beginner level</option>
            <option value="Intermediate level">Intermediate level</option>
            <option value="Senior level">Senior level</option>
          </select>
        </div>
      </div>

      <div>
        <p className='text-sm text-gray-700 mb-2'>Salary</p>
        <input 
          className='w-full sm:w-[120px] px-3 py-2 border rounded outline-none' 
          type="number" 
          placeholder='0' 
          onChange={e => setSalary(e.target.value)} 
          value={salary} 
          min={0}
        />
      </div>

      <button className='bg-black text-white px-10 py-2.5 mt-4 rounded font-medium hover:bg-gray-800 transition-colors'>
        Post Job
      </button>

    </form>
  )
}

export default AddJob
