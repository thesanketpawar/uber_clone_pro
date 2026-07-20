import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const CaptainDataContext = createContext();

// Use Vite environment variable with safe fallback
const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://13.235.94.86:30090';

const CaptainContext = ({ children }) => {
  const [captain, setCaptain] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCaptainProfile = async () => {
    try {
      const captainToken = localStorage.getItem("captainToken");
      
      // Stop execution gracefully if no token exists
      if (!captainToken) return;

      setIsLoading(true);
      const res = await axios.get(`${BASE_URL}/captain/captain-profile`, {
        headers: {
          Authorization: `Bearer ${captainToken}`,
        },
      });

      setCaptain(res.data);
    } catch (err) {
      console.error("Failed to fetch captain profile gracefully:", err);
      setError(err?.response?.data?.message || "Failed to load captain profile");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCaptainProfile();
  }, []);

  return (
    <CaptainDataContext.Provider value={{ captain, setCaptain, isLoading, setIsLoading, error, setError, fetchCaptainProfile }}>
      {children}
    </CaptainDataContext.Provider>
  );
};

export default CaptainContext;
