import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CaptainDataContext } from '../context/CaptainContext';
import axios from 'axios';
import { useGoogleLogin } from '@react-oauth/google';

const Captainlogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setCaptain } = useContext(CaptainDataContext);
  const navigate = useNavigate();

  // ① configure Google login
  const googleLogin = useGoogleLogin({
    onSuccess: async credentialResponse => {
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/captain/google-login`,
          { token: credentialResponse.credential },
        );
        const { captain, token } = res.data;
        setCaptain(captain);
        localStorage.setItem("captainToken", token);
        navigate("/captain-home");
      } catch (err) {
        console.error("Google login failed:", err);
        alert("Google login failed.");
      }
    },
    onError: () => {
      console.error("Google login error");
      alert("Google login failed.");
    }
  });

  const submitHandler = async e => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/captain/captain-login`,
        { email, password },
        { withCredentials: true }
      );
      const { captain, token } = response.data;
      setCaptain(captain);
      localStorage.setItem("captainToken", token);
      navigate("/captain-home");
    } catch (error) {
      console.error("Login failed:", error.response?.data?.error || error.message);
      alert(error.response?.data?.error || "Login failed. Please try again.");
    }
    setEmail('');
    setPassword('');
  };

  return (
    <div className='p-7 h-screen flex flex-col justify-between'>
      <div>
        <img
          className="w-16 mb-10"
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYQy-OIkA6In0fTvVwZADPmFFibjmszu2A0g&s"
          alt=""
        />

        <form onSubmit={submitHandler}>
          <h3 className='text-lg font-medium mb-2'>What's your email</h3>
          <input
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className='bg-[#eeeeee] mb-7 rounded-lg px-4 py-2 border w-full text-lg'
            type="email"
            placeholder='email@example.com'
          />

          <h3 className='text-lg font-medium mb-2'>Enter Password</h3>
          <input
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            className='bg-[#eeeeee] mb-7 rounded-lg px-4 py-2 border w-full text-lg'
            type="password"
            placeholder='password'
          />

          <div className="mb-5 text-right">
            <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="bg-[#111] text-white font-semibold mb-3 rounded-lg px-4 py-2 w-full text-lg"
          >
            Login
          </button>

          <div className="flex items-center my-4">
            <hr className="flex-grow border-t border-gray-300" />
            <span className="mx-4 text-gray-500 font-medium">or</span>
            <hr className="flex-grow border-t border-gray-300" />
          </div>

          {/* ② Custom‐styled Google button */}
          <button
            type="button"
            onClick={() => googleLogin()}
            className="bg-white text-black border border-gray-400 flex items-center justify-center gap-3 font-medium rounded-lg px-4 py-2 w-full text-lg mb-5 hover:bg-gray-100 transition"
          >
            <img
              src="https://icon2.cleanpng.com/20240216/yhs/transparent-google-logo-google-logo-with-colorful-letters-on-black-1710875297222.webp"
              alt="Google logo"
              className="w-5 h-5"
            />
            Sign in with Google
          </button>
        </form>

        <p className='text-center'>
          Join a fleet?{" "}
          <Link to='/captain-signup' className='text-blue-600'>
            Register as a Captain
          </Link>
        </p>
      </div>

      <div>
        <Link
          to='/login'
          className='bg-[#d5622d] flex items-center justify-center text-white font-semibold mb-5 rounded-lg px-4 py-2 w-full text-lg'
        >
          Sign in as User
        </Link>
      </div>
    </div>
  );
};

export default Captainlogin;
