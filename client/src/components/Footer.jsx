import React from 'react'
import { assets } from '../assets/assets'
const Footer = () => {
  return (
    <div className="container 2xl:px-20 mx-auto px-4 py-10 border-t border-gray-200">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">

        <div className="flex items-center gap-3">
          <img className="h-8" src={assets.logo} alt="Logo" />
        </div>

        <div className="flex gap-6 text-gray-600">
          <a href="#" className="hover:text-blue-600 transition-colors">About</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Contact</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
        </div>

        <div className="flex gap-4">
          <a href="#"><img className="w-6 hover:scale-110 transition-transform" src={assets.facebook_icon} alt="Facebook" /></a>
          <a href="#"><img className="w-6 hover:scale-110 transition-transform" src={assets.instagram_icon} alt="Instagram" /></a>
          <a href="#"><img className="w-6 hover:scale-110 transition-transform" src={assets.twitter_icon} alt="Twitter" /></a>
        </div>

      </div>

      <p className="text-gray-500 text-sm text-center mt-6">
        &copy; {new Date().getFullYear()} Job Portal. All rights reserved.
      </p>
    </div>
  )
}

export default Footer