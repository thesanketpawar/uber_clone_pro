import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ConfirmRidePopUp = ({ ride, setConfirmRidePopupPanel, setRidePopupPanel, confirmRide }) => {
    const [otp, setOtp] = useState('')
    const navigate = useNavigate()

   const submitHandler = async (e) => {
    e.preventDefault();

    try {
        // Start the ride
        await axios.patch(
            `${import.meta.env.VITE_BASE_URL}/rides/start`,
            {
                rideId: ride?.rideId,
                otp: otp
            },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('captainToken')}`
                }
            }
        );
        // Fetch the latest ride details (use /details/:rideId)
        const rideDetailsRes = await axios.get(
            `${import.meta.env.VITE_BASE_URL}/rides/details/${ride?.rideId}`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('captainToken')}`
                }
            }
        );
        setConfirmRidePopupPanel(false);
        setRidePopupPanel(false);
        // Navigate to CaptainRiding with full ride data
        navigate('/captain-riding', { state: { ride: rideDetailsRes.data.ride } });
    } catch (error) {
        console.error(error);
        alert("Failed to start ride or fetch ride details.");
    }
};

    return (
        <div>
            <h5
                className='p-1 text-center w-[93%] absolute top-0'
                onClick={() => setConfirmRidePopupPanel(false)}
            >
                <i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i>
            </h5>

            <h3 className='text-2xl font-semibold mb-5'>Confirm This Ride</h3>

            <div className='flex items-center justify-between p-3 bg-yellow-400 rounded-lg mt-3'>
                <div className='flex items-center gap-3'>
                    <img
                        className='h-10 w-10 rounded-full object-cover'
                        src={`${import.meta.env.VITE_BASE_URL}/${ride?.userImage}` || "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"}
                        alt="user"
                    />
                    <h2 className='text-lg font-medium'>
                        {ride?.user?.firstname + " " + ride?.user?.lastname}</h2>
                </div>
                <h5 className='text-lg font-semibold'>{ride?.distance} KM</h5>
            </div>

            <div className='flex gap-2 justify-between flex-col items-center'>
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
                <div className='mt-6 w-full'>
                    <form onSubmit={submitHandler}>
                        <input
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            type="text"
                            className='bg-[#eee] px-6 py-4 font-mono text-lg rounded-lg w-full mt-3'
                            placeholder='Enter OTP'
                        />

                        <button
                            type="submit"
                            className='w-full mt-5 flex justify-center bg-green-600 text-white font-semibold p-3 rounded-lg'>
                            Confirm
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setConfirmRidePopupPanel(false);
                                setRidePopupPanel(false);
                            }}
                            className='w-full mt-2 bg-red-600 text-lg text-white font-semibold p-3 rounded-lg'>
                              Cancel
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ConfirmRidePopUp;
