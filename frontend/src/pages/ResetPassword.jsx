import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

const ResetPassword = () => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { userToken } = useParams()

  const submitHandler = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      return setError("Passwords do not match")
    }

    try {
      await axios.post(`${import.meta.env.VITE_BASE_URL}/user/reset-password/${userToken}`, { password })
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.error || 'Reset failed')
    }
  }

  return (
    <div>
      <div className='p-7 h-screen flex flex-col justify-between'>
        <div>
          <img className='w-16 mb-10' src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYQy-OIkA6In0fTvVwZADPmFFibjmszu2A0g&s" alt="" />

          <form onSubmit={submitHandler}>
            <h3 className='text-lg font-medium mb-2'>New Password</h3>
            <input
              required
              className='bg-[#eeeeee] mb-7 rounded-lg px-4 py-2 border w-full text-lg'
              type="password"
              placeholder='Enter new password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <h3 className='text-lg font-medium mb-2'>Confirm Password</h3>
            <input
              required
              className='bg-[#eeeeee] mb-7 rounded-lg px-4 py-2 border w-full text-lg'
              type="password"
              placeholder='Confirm password'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <button className='bg-[#111] text-white font-semibold mb-3 rounded-lg px-4 py-2 w-full text-lg'>
              Reset Password
            </button>
          </form>

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

export default ResetPassword
