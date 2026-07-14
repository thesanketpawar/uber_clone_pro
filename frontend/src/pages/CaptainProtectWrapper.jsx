import React, { useContext, useEffect, useState } from 'react';
import { CaptainDataContext } from '../context/CaptainContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CaptainProtectWrapper = ({ children }) => {
  const navigate = useNavigate();
  const captainToken = localStorage.getItem('captainToken');
  const { setCaptain } = useContext(CaptainDataContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyCaptain = async () => {
      if (!captainToken) {
        navigate('/captain-login');
        return;
      }

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/captain/captain-profile`,
          {
            headers: {
              Authorization: `Bearer ${captainToken}`,
            },
          }
        );

        if (response.status === 200 && response.data?.captain) {
          setCaptain(response.data.captain);
        } else {
          throw new Error('Captain data missing');
        }
      } catch (err) {
        console.error('Auth error:', err.message);
        localStorage.removeItem('captainToken');
        navigate('/captain-login');
      } finally {
        setIsLoading(false);
      }
    };

    verifyCaptain();
  }, [captainToken, navigate, setCaptain]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};

export default CaptainProtectWrapper;
