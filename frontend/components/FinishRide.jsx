import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const FinishRide = ({ ride, setFinishRidePanel }) => {
  const navigate = useNavigate();

  async function endRide(rideId) {
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/rides/complete`,
        {
          rideId: ride?._id,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("captainToken")}`,
          },
        }
      );
      if (response.status === 200) {
        navigate("/captain-home");
      }
    } catch (error) {
      console.error("Error ending ride:", error);
    }
  }

  return (
    <div>
      {/* Close Button */}
      <h5
        className="p-1 text-center w-[93%] absolute top-0"
        onClick={() => setFinishRidePanel(false)}
      >
        <i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i>
      </h5>

      <h3 className="text-2xl font-semibold mb-5">Finish this Ride</h3>

      {/* Captain Info and Distance */}
      <div className="flex items-center justify-between p-4 border-2 border-yellow-400 rounded-lg mt-4">
        <div className="flex items-center gap-3">
          <img
            className="h-12 w-12 rounded-full object-cover"
            src={
              ride?.captain?.captainImage
                ? `${import.meta.env.VITE_BASE_URL}/${ride.captain.captainImage }`
                : "https://i.pinimg.com/236x/af/26/28/af26280b0ca305be47df0b799ed1b12b.jpg"
            }
            alt="Captain"
          />
          <h2 className="text-lg font-medium">
            {ride?.captain?.fullname?.firstname || "Captain"}{" "}
            {ride?.captain?.fullname?.lastname || ""}
          </h2>
        </div>
        <h5 className="text-lg font-semibold">
          {ride?.distance ? (ride.distance / 1000).toFixed(2) : "0.00"} KM{" "}
        </h5>
      </div>

      {/* Ride Info Details */}
      <div className="flex gap-2 justify-between flex-col items-center">
        <div className="w-full mt-5">
          <div className="flex items-center gap-5 p-3 border-b-2">
            <i className="ri-map-pin-user-fill"></i>
            <div>
              <h5 className="text-lg font-medium">
                {ride?.pickup || "Pickup Address"}
              </h5>
              <p className="text-sm -mt-1 text-gray-600">Pickup Address</p>
            </div>
          </div>
          <div className="flex items-center gap-5 p-3 border-b-2">
            <i className="text-lg ri-map-pin-2-fill"></i>
            <div>
              <h5 className="text-lg font-medium">
                {ride?.destination || "Dropoff Address"}
              </h5>
              <p className="text-sm -mt-1 text-gray-600">Destination Address</p>
            </div>
          </div>
          <div className="flex items-center gap-5 p-3">
            <i className="ri-currency-line"></i>
            <div>
              <h5 className="text-lg font-medium">
                ₹{ride?.fare?.toFixed(2) || "0.00"}
              </h5>
              <p className="text-sm -mt-1 text-gray-600">Cash</p>
            </div>
          </div>
        </div>

        {/* Finish Button */}
        <div className="mt-10 w-full">
          <button
            onClick={endRide}
            className="w-full mt-5 flex text-lg justify-center bg-green-600 text-white font-semibold p-3 rounded-lg"
          >
            Finish Ride
          </button>
        </div>
      </div>
    </div>
  );
};
export default FinishRide;
