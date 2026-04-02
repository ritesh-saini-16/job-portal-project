/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContext = createContext();

/** Keep a single user shape for the client: always string `id` + trimmed `resume`. */
function normalizeUser(raw) {
  if (!raw || typeof raw !== "object") return null;
  const idSrc = raw.id ?? raw._id;
  if (idSrc == null) return null;
  const resume =
    typeof raw.resume === "string" ? raw.resume.trim() : raw.resume ? String(raw.resume).trim() : "";
  return { ...raw, id: String(idSrc), resume };
}

export const AppContextProvider = (props) => {

  const backendUrl = (import.meta.env.VITE_BACKEND_URL || "http://localhost:5000").replace(/\/$/, "");

  const [searchFilter, setSearchFilter] = useState({
    title: '',
    location: ''
  })

  const [isSearched, setIsSearched] = useState(false)
  const [showRecruiterLogin, setShowRecruiterLogin] = useState(false)
  const [showUserLogin, setShowUserLogin] = useState(false)

  const [user, setUser] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("jobportal_user");
      if (!stored) return null;
      try {
        return normalizeUser(JSON.parse(stored));
      } catch {
        return null;
      }
    }
    return null;
  });

  const [jobs, setJobs] = useState([]);

  const [companyToken, setCompanyToken] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('companyToken');
    }
    return null;
  });

  const [companyData, setCompanyData] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('companyData');
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  });

  const login = (userData, token) => {
    const next = normalizeUser(userData);
    setUser(next);
    if (typeof window !== "undefined" && next) {
      localStorage.setItem("jobportal_user", JSON.stringify(next));
      localStorage.setItem("jobportal_token", token);
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

  const logoutCompany = () => {
    setCompanyToken(null);
    setCompanyData(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('companyToken');
      localStorage.removeItem('companyData');
    }
    setShowRecruiterLogin(false);
  };

  // Fetch all available jobs
  const fetchJobs = useCallback(async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/jobs`);
      if (data.success) {
        setJobs(data.jobs);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("fetchJobs error:", error);
      toast.error("Error fetching jobs");
    }
  }, [backendUrl]);

  // Fetch company/recruiter data
  const fetchCompanyData = useCallback(async (token = companyToken) => {
    if (!token) {
      console.warn("fetchCompanyData: No token provided");
      return;
    }

    try {
      const { data } = await axios.get(`${backendUrl}/api/recruiters/me`, {
        headers: { token }
      });
      if (data.success) {
        setCompanyData(data.company);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("fetchCompanyData error:", error);
      toast.error("Error fetching company data");
    }
  }, [backendUrl, companyToken]);

  // Fetch logged-in user data
  const fetchUserData = useCallback(async (token) => {
    try {
      const userToken = token || (typeof window !== 'undefined' ? localStorage.getItem('jobportal_token') : null);
      if (!userToken) {
        console.warn("fetchUserData: No token provided");
        return;
      }
      const { data } = await axios.get(`${backendUrl}/api/users/me`, {
        headers: { token: userToken }
      });
      if (data.success && data.user) {
        const next = normalizeUser(data.user);
        setUser(next);
        if (typeof window !== "undefined" && next) {
          localStorage.setItem("jobportal_user", JSON.stringify(next));
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("fetchUserData error:", error);
    }
  }, [backendUrl]);

  // Refresh profile from API when the app loads (fixes stale localStorage missing `resume` / `id`)
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("jobportal_token") : null;
    if (!token) return;
    let cancelled = false;
    void (async () => {
      await Promise.resolve();
      if (cancelled) return;
      await fetchUserData();
    })();
    return () => {
      cancelled = true;
    };
  }, [backendUrl, fetchUserData]);

  // Load jobs on mount (async + cancel avoids react-hooks/set-state-in-effect)
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/jobs`);
        if (cancelled) return;
        if (data.success) {
          setJobs(data.jobs);
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        if (cancelled) return;
        console.error("fetchJobs error:", error);
        toast.error("Error fetching jobs");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [backendUrl]);

  // Refresh recruiter profile when token changes
  useEffect(() => {
    if (!companyToken) return;
    let cancelled = false;
    void (async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/recruiters/me`, {
          headers: { token: companyToken },
        });
        if (cancelled) return;
        if (data.success) {
          setCompanyData(data.company);
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        if (cancelled) return;
        console.error("fetchCompanyData error:", error);
        toast.error("Error fetching company data");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [companyToken, backendUrl]);

  // Sync user state to localStorage whenever it changes
  useEffect(() => {
    if (user && typeof window !== 'undefined') {
      localStorage.setItem('jobportal_user', JSON.stringify(user));
    }
  }, [user]);


  const value = {
    searchFilter,
    setSearchFilter,
    isSearched,
    setIsSearched,
    jobs,
    setJobs,
    user,
    setUser,
    login,
    logout,
    logoutCompany,
    fetchJobs,
    fetchCompanyData,
    fetchUserData,
    showRecruiterLogin,
    setShowRecruiterLogin,
    showUserLogin,
    setShowUserLogin,
    companyToken,
    setCompanyToken,
    companyData,
    setCompanyData,
    backendUrl
  };

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  );
};
