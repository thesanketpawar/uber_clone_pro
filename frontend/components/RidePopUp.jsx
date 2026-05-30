import React, { useEffect, useState } from 'react';

const RidePopUp = ({ ride, setRidePopupPanel, setConfirmRidePopupPanel, confirmRide }) => {
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds timer

  // Auto-dismiss after timeout
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === 1) {
          setRidePopupPanel(false);
          clearInterval(timer);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSlideDown = () => {
    // Use callback to avoid state updates in render phase
    setRidePopupPanel(false);
    setConfirmRidePopupPanel(true);
  };

  const handleAccept = () => {
    confirmRide(ride?._id);
  };

  const handleIgnore = () => {
    setRidePopupPanel(false);
  };

  return (
    <div>
      <h5
        className='p-1 text-center w-[93%] absolute top-0'
        onClick={handleSlideDown}
      >
        <i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i>
      </h5>

      <h3 className='text-2xl font-semibold mb-5'>New Ride Available..! ({timeLeft}s)</h3>

      <div className='flex items-center justify-between p-3 bg-yellow-400 rounded-lg mt-3'>
        <div className='flex items-center gap-3'>
          <img
            className='h-10 w-10 rounded-full object-cover'
            src={`${import.meta.env.VITE_BASE_URL}/${ride?.userImage}` || "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"}
            alt="user"
          />
          <h2 className='text-lg font-medium'>
            {ride?.user?.firstname + " " + ride?.user?.lastname}
          </h2>
        </div>
        <h5 className='text-lg font-semibold'>{ride?.distance || 0} KM</h5>
      </div>

      <div className='w-full mt-5'>
        <div className='flex items-center gap-5 p-3 border-b-2'>
          <i className="ri-map-pin-user-fill"></i>
          <div>
            <h3 className='text-lg font-medium'>Pickup Address</h3>
            <p className='text-sm -mt-1 text-gray-600'>{ride?.pickup}</p>
          </div>
        </div>

        <div className='flex items-center gap-5 p-3 border-b-2'>
          <i className="text-lg ri-map-pin-2-fill"></i>
          <div>
            <h3 className='text-lg font-medium'>Destination Address</h3>
            <p className='text-sm -mt-1 text-gray-600'>{ride?.destination}</p>
          </div>
        </div>

        <div className='flex items-center gap-5 p-3'>
          <i className="ri-currency-line"></i>
          <div>
            <h3 className='text-lg font-medium'>₹{ride?.fare}</h3>
            <p className='text-sm -mt-1 text-gray-600'>Cash</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center w-full mt-5">
        <button
          onClick={handleAccept}
          className="bg-green-600 text-white font-semibold p-3 px-15 rounded-lg"
        >
          Accept
        </button>
        <button
          onClick={handleIgnore}
          className="bg-gray-300 text-gray-700 font-semibold p-3 px-15 rounded-lg"
        >
          Ignore
        </button>
      </div>
    </div>
  );
};

export default RidePopUp;
