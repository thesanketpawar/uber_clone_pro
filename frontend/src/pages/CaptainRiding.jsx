import React, { useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import FinishRide from '../../components/FinishRide';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
// import LiveTracking from '../../components/LiveTracking';

const CaptainRiding = () => {
  const [finishRidePanel, setFinishRidePanel] = useState(false);
  const finishRidePanelRef = useRef(null);
  const location = useLocation();
  const rideData = location.state?.ride;

  console.log('Distance:', rideData?.distance);

  useGSAP(() => {
    if (finishRidePanel) {
      gsap.to(finishRidePanelRef.current, {
        transform: 'translateY(0)',
        duration: 0.4,
        ease: 'power3.out',
      });
    } else {
      gsap.to(finishRidePanelRef.current, {
        transform: 'translateY(100%)',
        duration: 0.4,
        ease: 'power3.in',
      });
    }
  }, [finishRidePanel]);

  return (
    <div className='h-screen relative flex flex-col justify-end'>

      {/* Top Bar */}
      <div className='fixed top-0 left-0 right-0 z-50 p-6 flex items-center justify-between w-full bg-white shadow-md'>
        <img
          className='w-16'
          src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png"
          alt="Uber Logo"
        />
        <Link
          to='/captain-home'
          className='h-10 w-10 bg-gray-200 flex items-center justify-center rounded-full'
        >
          <i className="text-lg font-medium ri-logout-box-r-line"></i>
        </Link>
      </div>

      {/* Map or Tracking Image */}
      <div className='h-4/5 mt-20'>
        <img
          className='h-full w-full object-cover'
          src="https://miro.medium.com/v2/resize:fit:1400/0*gwMx05pqII5hbfmX.gif"
          alt="Live Ride"
        />
        {/* <LiveTracking /> */}
      </div>

      {/* Bottom Ride Info and Finish Button */}
      <div
        className='h-1/5 p-6 flex flex-col gap-3 items-center justify-center relative bg-yellow-400'
        onClick={() => setFinishRidePanel(true)}
      >
        <h5 className='absolute top-0 w-full text-center mt-1'>
          <i className="text-3xl text-gray-800 ri-arrow-up-wide-line"></i>
        </h5>
        <h4 className='text-xl font-semibold'>{rideData?.distance  ? (rideData.distance / 1000).toFixed(2) : '0.00'} KM </h4>
        <button
          onClick={() => setFinishRidePanel(true)}
          className='w-full bg-green-600 text-white text-lg font-semibold p-3 rounded-lg'
        >
          Complete Ride
        </button>
      </div>

      {/* Slide-up Finish Ride Panel */}
      <div
        ref={finishRidePanelRef}
        className='fixed bottom-0 left-0 w-full z-[999] translate-y-full bg-white px-4 py-10 pt-14 rounded-t-3xl shadow-lg'
      >
        <FinishRide
          ride={rideData}
          setFinishRidePanel={setFinishRidePanel}
        />
      </div>
    </div>
  );
};

export default CaptainRiding;
