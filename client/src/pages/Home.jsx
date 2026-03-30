import React from "react"
import Navbar from "../components/Navbar"
import Hero from "../components/Hero"
import JobListing from "../components/JobListing"
import AppDownlaod from "../components/AppDownlaod"
import Footer from "../components/Footer"
const Home = () => {
  return (
    <div>
      <Navbar />
      <Hero/>
      <JobListing/>
      <AppDownlaod/>
      <Footer/>
    </div>
  )
}

export default Home
