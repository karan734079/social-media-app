import Lottie from 'lottie-react';
import React from 'react'
import { Link } from 'react-router-dom';
import robo from '../images/animations/robo.json'

const Login = () => {
  return (
    <div className='items-center text-center justify-center'>
      <h1 className="text-6xl my-8 font-bold text-center text-red-600 opacity-90">Socio</h1>
      <div className="flex items-center justify-center bg-white text-black space-x-5">
        <div>
          <Lottie className='w-[500px] h-[550px]' animationData={robo} />
        </div>
        <div className="flex flex-col items-center bg-red-600 px-8 py-14 space-y-4 max-w-sm w-full rounded-lg opacity-95">
          <form className="w-full space-y-4">
            <input
              type="text"
              placeholder="username"
              className="w-full px-4 py-3 rounded bg-gray-100 focus:outline-none"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 rounded bg-gray-100  focus:outline-none"
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
        </div>
      </div>
    </div>
  );
}

export default Login
