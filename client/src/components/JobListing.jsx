import React from "react";
import { useContext, useState, useMemo } from "react";
import { AppContext } from "../context/AppContext";
import { assets, JobCategories, JobLocations  } from "../assets/assets";
import JobCard from "./JobCard";

const JobListing = () => {
  const { isSearched, searchFilter, setSearchFilter , jobs} = useContext(AppContext);

  const [showFilter, setShowFilter] = useState(false);

  const [currentPage , setCurrentPage] = useState(1);

  const [selectCategories, setSelectCategories] = useState([]);
  const [selectLocations, setSelectLocations] = useState([]);

  const handleCategoryChange = (category) => {
    setSelectCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleLocationChange = (location) => {
    setSelectLocations((prev) =>
      prev.includes(location)
        ? prev.filter((l) => l !== location)
        : [...prev, location]
    );
  };

  const filteredJobs = useMemo(() => {
    let filteredJobs = jobs;

    // Filter by search title
    if (searchFilter.title) {
      filteredJobs = filteredJobs.filter((job) =>
        job.title.toLowerCase().includes(searchFilter.title.toLowerCase())
      );
    }

    // Filter by search location
    if (searchFilter.location) {
      filteredJobs = filteredJobs.filter((job) =>
        job.location.toLowerCase().includes(searchFilter.location.toLowerCase())
      );
    }

    // Filter by selected categories
    if (selectCategories.length > 0) {
      filteredJobs = filteredJobs.filter((job) =>
        selectCategories.includes(job.category)
      );
    }

    // Filter by selected locations
    if (selectLocations.length > 0) {
      filteredJobs = filteredJobs.filter((job) =>
        selectLocations.includes(job.location)
      );
    }

    return filteredJobs;
  }, [jobs, searchFilter, selectCategories, selectLocations]);

  return (
    <div className="container 2xl:px-20 mx-auto flex flex-col lg:flex-row max-lg:space-y-8 py-8">
      {/* Side Bar */}

      <div className="w-full lg:w-1/4 bg-white px-4">
        {/* serach filter from hero component */}
        {isSearched &&
          (searchFilter.title !== "" || searchFilter.location !== "") && (
            <>
              <h3 className="font-medium text-lg mb-4">Current Search</h3>

              <div className="mb-4 text-gray-600">
                {searchFilter.title && (
                  <span className="inline-flex items-center gap-2.5 bg-blue-50 border border-blue-200 px-4 py-1.5 rounded">
                    {searchFilter.title}
                    <img
                      className="cursor-pointer"
                      onClick={() =>
                        setSearchFilter((prev) => ({ ...prev, title: "" }))
                      }
                      src={assets.cross_icon}
                      alt=""
                    />
                  </span>
                )}
                {searchFilter.location && (
                  <span className=" ml-2 inline-flex items-center gap-2.5 bg-red-50 border border-red-200 px-4 py-1.5 rounded">
                    {searchFilter.location}
                    <img
                      className="cursor-pointer"
                      onClick={() =>
                        setSearchFilter((prev) => ({ ...prev, location: "" }))
                      }
                      src={assets.cross_icon}
                      alt=""
                    />
                  </span>
                )}
              </div>
            </>
          )}

          <button onClick={() => setShowFilter(prev => !prev)} className="px-6 py-1.5 rounded border border-gray-400 lg:hidden">
             {showFilter ? "Close" : "Filter"}
          </button>
        {/* category filter */}
        <div className={showFilter ? "" : "max-lg:hidden"}>
          <h4 className="font-medium text-lg py-4"> Search by Categories</h4>

          <ul className="space-y-4 text-gray-600">
            {JobCategories.map((category, index) => (
              <li className="flex gap-3 items-center" key={index}>
                <input className=" scale-125" type="checkbox" onChange={() => handleCategoryChange(category)} checked={selectCategories.includes(category)} />
                {category}
              </li>
            ))}
          </ul>
        </div>

        {/* Location filter */}
        <div className={showFilter ? "" : "max-lg:hidden"}>
          <h4 className="font-medium text-lg py-4 pt-14"> Search by Locations</h4>

          <ul className="space-y-4 text-gray-600">
            {JobLocations.map((location, index) => (
              <li className="flex gap-3 items-center" key={index}>
                <input className=" scale-125" type="checkbox" onChange={() => handleLocationChange(location)} checked={selectLocations.includes(location)} />
                {location}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* job listings */}
      <section className='w-full lg:w-3/4 text-gray-800 max-lg:px-4'>
        <h3 className='font-medium text-3xl py-2' id='job-list'>Latest jobs</h3>
        <p className="mb-8">Get your desired job from top companies</p>
        <div  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">

          {/* Job Card Component */}

          {filteredJobs.slice((currentPage - 1) * 6, currentPage * 6).map((job, index)=>(
            <JobCard key={index} job={job}/>
          ))}

        </div>

        {/* Pagination */}
        {filteredJobs.length > 0 && (
          <div className="flex items-center justify-center gap-3 mt-10">
            <a href="#job-list">
              <img
                onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                src={assets.left_arrow_icon}
                alt="Previous"
                className="cursor-pointer"
              />
            </a>

            {Array.from({ length: Math.ceil(filteredJobs.length / 6) }).map((_, index) => (
              <a key={index} href="#job-list">
                <button
                  onClick={() => setCurrentPage(index + 1)}
                  className={`w-10 h-10 flex items-center justify-center border border-gray-300 rounded ${
                    currentPage === index + 1
                      ? "bg-blue-100 text-blue-500"
                      : "text-gray-500"
                  }`}
                >
                  {index + 1}
                </button>
              </a>
            ))}

            <a href="#job-list">
              <img
                onClick={() =>
                  setCurrentPage(
                    Math.min(currentPage + 1, Math.ceil(filteredJobs.length / 6))
                  )
                }
                src={assets.right_arrow_icon}
                alt="Next"
                className="cursor-pointer"
              />
            </a>
          </div>
        )}
      </section>
    </div>
  );
};

export default JobListing;
