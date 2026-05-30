import React from 'react';

const WaitingForDriver = ({ 
  waitingForDriver,
  ride,
  vehicleType, 
  setVehicleFound,
  setWaitingForDriver,
}) => {
  console.log('ride:', ride);

  const vehicleImages = {
    car: "https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg",
    moto: "https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_638,w_956/v1649231091/assets/2c/7fa194-c954-49b2-9c6d-a3b8601370f5/original/Uber_Moto_Orange_312x208_pixels_Mobile.png",
    auto: "https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_368,w_552/v1648431773/assets/1d/db8c56-0204-4ce4-81ce-56a11a07fe98/original/Uber_Auto_558x372_pixels_Desktop.png",
  };

  const selectedImage = vehicleImages[vehicleType];

  return (
    <div className="p-4">
      <h5 className='p-1 text-center w-[93%] absolute top-0' onClick={() => setWaitingForDriver(false)}>
        <i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i>
      </h5>

      <div className="text-center mt-6">
        <h2 className="text-xl mt-2 font-semibold text-gray-800">Waiting for driver to accept your ride...</h2>
        <p className="text-gray-500 mt-1">Hang tight! We're contacting nearby drivers.</p>
      </div>

      {ride?.captain && (
        <div className='flex items-center justify-between mt-6'>
          <img className='h-12' src={selectedImage} alt="vehicle" />
          <div className='text-right'>
            <h2 className='text-lg font-medium capitalize'>
              {ride?.captain?.name?.firstname || "Captain"} {ride?.captain?.name?.lastname || ""}
            </h2>
            <h4 className='text-xl font-semibold -mt-1 -mb-1'>{ride?.captain?.vehicle?.plate || "MH 05 AB 1234"}</h4>
            <p className='text-sm text-gray-600'>Maruti Suzuki Alto</p>
            <h1 className='text-lg font-semibold'>{ride?.otp}</h1>
          </div>
        </div>
      )}

      <div className='w-full mt-5 space-y-3'>
        <div className='flex items-center gap-5 p-3 border-b'>
          <i className="ri-map-pin-user-fill"></i>
          <div>
            <h3 className='text-lg font-medium'>Pickup</h3>
            <p className='text-sm text-gray-600'>{ride?.pickup}</p>
          </div>
        </div>

        <div className='flex items-center gap-5 p-3 border-b'>
          <i className="ri-map-pin-2-fill"></i>
          <div>
            <h3 className='text-lg font-medium'>Destination</h3>
            <p className='text-sm text-gray-600'>{ride?.destination}</p>
          </div>
        </div>

        <div className='flex items-center gap-5 p-3'>
          <i className="ri-currency-line"></i>
          <div>
            <h3 className='text-lg font-medium'>₹{ride?.fare}</h3>
            <p className='text-sm text-gray-600'>Cash</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitingForDriver;
