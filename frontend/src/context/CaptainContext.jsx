// src/context/CaptainContext.jsx
import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const CaptainDataContext = createContext();

const CaptainContext = ({ children }) => {
  const [captain, setCaptain] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCaptainProfile = async () => {
    try {
      const captainToken = localStorage.getItem("captainToken");
      const res = await axios.get("http://localhost:4000/captain/captain-profile", {
        headers: {
          Authorization: `Bearer ${captainToken}`,
        },
      });
  
      setCaptain(res.data);
    } catch (err) {
      console.error("Failed to fetch captain profile:", err);
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
