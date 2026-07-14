import React, { useState } from 'react'
import axios from 'axios'

const ForgetPassword = () => {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const submitHandler = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/user/forgot-password`, { email })
      setMessage(res.data.message)
      setError('')
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
      setMessage('')
    }
  }

  return (
    <div>
      <div className='p-7 h-screen flex flex-col justify-between'>
        <div>
          <img className='w-16 mb-10' src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYQy-OIkA6In0fTvVwZADPmFFibjmszu2A0g&s" alt="" />

          <form onSubmit={submitHandler}>
            <h3 className='text-lg font-medium mb-2'>Enter your email</h3>
            <input
              required
              className='bg-[#eeeeee] mb-7 rounded-lg px-4 py-2 border w-full text-lg placeholder:text-base'
              type="email"
              placeholder='email@example.com'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button className='bg-[#111] text-white font-semibold mb-3 rounded-lg px-4 py-2 w-full text-lg'>
              Send Reset Link
            </button>
          </form>

          {message && <p className='text-green-600 mt-2'>{message}</p>}
          {error && <p className='text-red-600 mt-2'>{error}</p>}
        </div>

        <div>
          <p className='text-[10px] leading-tight'>
            This site is protected by reCAPTCHA and the <span className='underline'>Google Privacy Policy</span> and <span className='underline'>Terms of Service</span> apply.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ForgetPassword
