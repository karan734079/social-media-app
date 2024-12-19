import Lottie from 'lottie-react';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import robo from '../images/animations/create.json';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}api/auth/login`,
        { username, password }
      );

      // Store token in localStorage
      localStorage.setItem('token', response.data.token);

      // Show success toast and wait for it to complete before navigating
      toast.success('Login successful!', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light',
      });

      setTimeout(() => {
        const redirectPath = response.data.isProfileComplete ? '/browse' : `/create-profile/${username}`;
        navigate(redirectPath);
      }, 2000);

    } catch (err) {
      // Show error toast on login failure
      toast.error('Login failed. Please check your credentials.', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light',
      });
    }
  };

  return (
    <div className="items-center text-center justify-center">
      <h1 className="text-6xl my-8 font-bold text-center text-red-600 opacity-90">Linknest</h1>
      <div className="flex items-center justify-center bg-white text-black space-x-5">
        <div>
          <Lottie className="w-[500px] h-[550px] m-2" animationData={robo} />
        </div>
        <div className="flex flex-col items-center bg-red-600 px-8 py-14 space-y-4 max-w-sm w-full rounded-lg opacity-95">
          <form className="w-full space-y-4" onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="username"
              className="w-full px-4 py-3 rounded bg-gray-100 focus:outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 rounded bg-gray-100 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full py-3 bg-black hover:bg-slate-950 rounded text-white font-medium"
            >
              Log in
            </button>
          </form>
          <div className="text-center text-black mt-4">
            Don't have an account?{' '}
            <Link to={'/sign-up'} className="text-black hover:underline font-semibold text-lg">
              SignUp
            </Link>
          </div>
          <ToastContainer />
        </div>
      </div>
    </div>
  );
};

export default Login;
