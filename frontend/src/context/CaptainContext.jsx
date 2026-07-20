// src/context/CaptainContext.jsx
import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const CaptainDataContext = createContext();

// Dynamic URL with fallback to EC2 NodePort
const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://13.235.94.86:30090';

const CaptainContext = ({ children }) => {
  const [captain, setCaptain] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCaptainProfile = async () => {
    const captainToken = localStorage.getItem("captainToken");
    
    // Don't attempt to fetch if no token exists yet
    if (!captainToken) return;

    setIsLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/captain/captain-profile`, {
        headers: {
          Authorization: `Bearer ${captainToken}`,
        },
      });

      setCaptain(res.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch captain profile:", err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCaptainProfile();
  }, []);

  const value = {
    captain,
    setCaptain,
    isLoading,
    setIsLoading,
    error,
    setError,
    fetchCaptainProfile  
  };

  return (
    <CaptainDataContext.Provider value={value}>
      {children}
    </CaptainDataContext.Provider>
  );
};

export default CaptainContext;
