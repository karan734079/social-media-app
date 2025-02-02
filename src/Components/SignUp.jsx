import Lottie from 'lottie-react'
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import robo from '../images/animations/robot.json'
import axios from 'axios';
// import Swal from 'sweetalert2';
import { ToastContainer, toast } from 'react-toastify';

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${process.env.REACT_APP_BASE_URL}api/auth/sign-up`, { email, username, password });

      toast.success('Account Created successfully', {
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
        navigate('/');
      }, 2000)


    } catch (err) {
      toast.error('Registartion failed', {
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
    <div className=''>
      <div className='items-center text-center justify-center'>
        <h1 className="text-6xl my-8 font-bold text-center text-red-600 opacity-90">Linknest</h1>
        <div className="flex items-center justify-center md:justify-around text-center bg-white text-black mx-2">
          <div className="flex flex-col items-center bg-red-600 px-8 py-10 space-y-4 max-w-sm w-full rounded-lg opacity-95 drop-shadow-lg">
          <h1 className='text-4xl text-white font-semibold'>Register</h1>
            <form className="w-full space-y-4" onSubmit={handleSignUp}>
              <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-3 rounded bg-gray-100 focus:outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Username"
                className="w-full px-4 py-3 rounded bg-gray-100 focus:outline-none"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full px-4 py-3 rounded bg-gray-100  focus:outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="submit"
                className="w-full py-3 bg-black hover:bg-slate-950 rounded text-white font-medium"
              >
                Sign Up
              </button>
            </form>
            <div className="text-center text-white mt-4">
              Already have a Account? <Link to={'/'} className="text-black hover:underline font-semibold text-lg">
                Log In
              </Link>
            </div>
          </div>
          <div className='hidden md:block'>
            <Lottie className='w-[400px] h-[500px] mb-4' animationData={robo} />
          </div>
        </div>
        <ToastContainer />
      </div>
    </div>
  )
}

export default SignUp
