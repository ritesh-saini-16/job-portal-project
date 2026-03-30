import React, { useState, useEffect, useRef } from 'react'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'

const AddJob = () => {

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Programming')
  const [location, setLocation] = useState('Bangalore')
  const [level, setLevel] = useState('Beginner level')
  const [salary, setSalary] = useState(0)

  const editorRef = useRef(null)
  const quillRef = useRef(null)

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

  const onSubmitHandler = (e) => {
    e.preventDefault()
    // TODO: Connect to backend
    alert('Job Added')
  }

  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col items-start gap-4'>

      <div>
        <p className='text-sm text-gray-700 mb-2'>Job Title</p>
        <input 
          className='w-full max-w-lg px-3 py-2 border rounded outline-none' 
          type="text" 
          placeholder='Type here' 
          onChange={e => setTitle(e.target.value)} 
          value={title} 
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

      <button className='bg-black text-white px-8 py-2.5 mt-4 rounded'>
        ADD
      </button>

    </form>
  )
}

export default AddJob
