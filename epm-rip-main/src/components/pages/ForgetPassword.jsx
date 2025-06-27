import React from 'react'
import rightsignup from "../aasests/pattern.png";
import logo from "../aasests/logo.png";
import { Link } from 'react-router-dom';

const ForgetPassword = () => {
  return (
     <div className="flex flex-col md:flex-row h-screen text-white">
                {/* Left Section */}
                <div id="recaptcha-container"></div>
                <div className="lg:w-2/4 w-full flex flex-col  justify-center p-3 md:p-6">
                    <div className="bg-white text-black p-10 rounded-lg min-w-full max-w-md">
                        {/* Logo */}
                        <div className="flex  items-center mb-4 lg:w-full sm:w-[80%] w-full">
                            {/* <img
                                src={logo}
                                alt="Cumulus Logo"
                                className="min-h-8 w-full object-fit "
                            /> */}
                        </div>
    
                        {/* Dynamic Name */}
                        <h1 className="text-2xl font-bold mb-2 text-left ">
                            Forgot Password
                        </h1>
                        <p className=" text-gray-600 mb-6">
                            Enter your email to reset your password.
                        </p>
    
                        {/* Form */}
                       <form className="space-y-">
                    <div className="space-y-2 mb-4">
                            <label htmlFor="email" className="block text-sm font-medium">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-500"
                                placeholder="Enter your email"
                                // value={email}
                                // onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                       
                        {/* Forgot Password */}
                        <div className="text-right mb-3">
                            
                        </div>

                       <button
                            type="submit"
                            className="w-full bg-black text-white py-2 rounded-md hover:bg-[#2c2b2b] transition "
                        >
                           Send OTP
                        </button>
                    </form>

                    <div className='mt-8'>
                        <form action="">
                        <h2 className="text-xl font-semi-bold mb-2 text-left">Enter otp here</h2>
                        <div className='flex gap-2 mt-4'>
                            <input className=' border border-gray-500 w-8 h-8 rounded-lg text-center' />
                            <input className=' border border-gray-500 w-8 h-8 rounded-lg text-center' />
                            <input className=' border border-gray-500 w-8 h-8 rounded-lg text-center' />
                            <input className=' border border-gray-500 w-8 h-8 rounded-lg text-center' />
                        </div>
                        <button className='bg-black my-4 text-white px-2 py-1 rounded-lg font-semi-bold'>Verify OTP</button>
                        </form>
                    </div>
    
                        <p className="text-center text-gray-500 mt-4">
                            if you Don&apos;t have an account?{" "}
                            <Link to="/" className="text-[#e14a16]">
                            Register Now
                          </Link>
                        </p>
                    </div>
                </div>
    
                {/* Right Section */}
                <div className="w-3/5 h-full hidden lg:block relative">
      {/* Background image */}
      <img
        src={rightsignup}
        alt="Illustration"
        className="h-full w-full object-cover rounded-3xl"
      />
    
      {/* Centered logo */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <img
          src={logo}
          alt="Logo"
          className="w-80 h-80 object-contain"
        />
      </div>
    </div>
    
    </div>
  )
}

export default ForgetPassword