import { createContext, useState } from "react";
import { jobsData } from "../assets/assets";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  const [searchFilter , setSearchFilter] = useState({
    title:'',
    location:''
  })

  const [isSearched , setIsSearched] = useState(false)
  const [showRecruiterLogin, setShowRecruiterLogin] = useState(false)
  const [showUserLogin, setShowUserLogin] = useState(false)

  const [user, setUser] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('jobportal_user');
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  });

  const [jobs , setJobs] = useState(jobsData);

  const login = (userData, token) => {
    setUser(userData);
    if (typeof window !== 'undefined') {
      localStorage.setItem('jobportal_user', JSON.stringify(userData));
      localStorage.setItem('jobportal_token', token);
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('jobportal_user');
      localStorage.removeItem('jobportal_token');
    }
    setShowRecruiterLogin(false);
    setShowUserLogin(false);
  };

  const value = {
    searchFilter,
    setSearchFilter,
    isSearched,
    setIsSearched,
    jobs,
    setJobs,
    user,
    login,
    logout,
    showRecruiterLogin,
    setShowRecruiterLogin,
    showUserLogin,
    setShowUserLogin
  };





  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  );
};
