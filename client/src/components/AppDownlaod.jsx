import React from 'react'
import { assets } from '../assets/assets'

const AppDownlaod = () => {
  return (
    <div className="container 2xl:px-20 mx-auto px-4 my-20">
      <div className="relative bg-gradient-to-r from-violet-50 to-purple-50 p-12 sm:p-24 lg:p-32 rounded-lg overflow-hidden">

        <div className="relative z-10">
          <h1 className="text-2xl sm:text-4xl font-bold mb-4 max-w-md">
            Download Mobile App For Better Experience
          </h1>
          <p className="text-gray-500 mb-8 max-w-lg">
            Get real-time job notifications, apply instantly, and track your applications on the go.
          </p>
          <div className="flex gap-4">
            <a href="#" className="inline-block transition-transform hover:scale-105">
              <img className="h-12" src={assets.play_store} alt="Play Store" />
            </a>
            <a href="#" className="inline-block transition-transform hover:scale-105">
              <img className="h-12" src={assets.app_store} alt="App Store" />
            </a>
          </div>
        </div>

        <img
          className="absolute w-80 right-0 bottom-0 mr-32 max-lg:hidden"
          src={assets.app_main_img}
          alt="Mobile App"
        />
      </div>
    </div>
  )
}

export default AppDownlaod