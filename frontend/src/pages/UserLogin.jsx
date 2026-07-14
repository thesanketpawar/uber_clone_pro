import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserDataContext } from "../context/UserContext";
import axios from "axios";
import { useGoogleLogin } from '@react-oauth/google';

const UserLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { user, setUser } = useContext(UserDataContext);
  const navigate = useNavigate();

const googleLogin = useGoogleLogin({
    onSuccess: async credentialResponse => {
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/user/google-login`,
          { token: credentialResponse.credential }
        );
        const { user, token } = res.data;
        setUser(user);
        localStorage.setItem("userToken", token);
        navigate("/home");
      } catch (err) {
        console.error("Google login failed:", err);
        alert("Google login failed.");
      }
    },
    onError: () => {
      console.log("Google Login Failed");
      alert("Google login failed.");
    },
  });


  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      const userData = { email, password };

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/user/login`,
        userData
      );

      if (response.status === 200) {
        const data = response.data;
        setUser(data.user);
        localStorage.setItem("userToken", data.token);
        navigate("/home");
      }

      setEmail("");
      setPassword("");
    } catch (error) {
      console.error("Login failed:", error);
      alert(error.response?.data?.message || "Login failed. Please try again.");
    }
  };


  return (
    <div className="p-7 h-screen flex flex-col justify-between">
      <div>
        <img
          className="w-16 mb-10"
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYQy-OIkA6In0fTvVwZADPmFFibjmszu2A0g&s"
          alt=""
        />

        <form onSubmit={submitHandler}>
          <h3 className="text-lg font-medium mb-2">What's your email</h3>
          <input
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-[#eeeeee] mb-7 rounded-lg px-4 py-2 border w-full text-lg placeholder:text-base"
            type="email"
            placeholder="email@example.com"
          />

          <h3 className="text-lg font-medium mb-2">Enter Password</h3>
          <input
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-[#eeeeee] mb-2 rounded-lg px-4 py-2 border w-full text-lg placeholder:text-base"
            type="password"
            placeholder="password"
          />

          <div className="mb-5 text-right">
            <Link
              to="/forgot-password"
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <button className="bg-[#111] text-white font-semibold mb-3 rounded-lg px-4 py-2 w-full text-lg">
            Login
          </button>

          <div className="flex items-center my-4">
            <hr className="flex-grow border-t border-gray-300" />
            <span className="mx-4 text-gray-500 font-medium">or</span>
            <hr className="flex-grow border-t border-gray-300" />
          </div>

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

        <p className="text-center">
          New here?{" "}
          <Link to="/signup" className="text-blue-600">
            Create new Account
          </Link>
        </p>
      </div>

      <div>
        <Link
          to="/captain-login"
          className="bg-[#10b461] flex items-center justify-center text-white font-semibold mb-5 rounded-lg px-4 py-2 w-full text-lg placeholder:text-base"
        >
          Sign in as Captain
        </Link>
      </div>
    </div>
  );
};

export default UserLogin;
