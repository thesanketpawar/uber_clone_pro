import React, { useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import CaptainDetails from "../../components/CaptainDetails";
import RidePopUp from "../../components/RidePopUp";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import ConfirmRidePopUp from "../../components/ConfirmRidePopUp";
import { useEffect, useContext } from "react";
import { SocketContext } from "../context/SocketContext";
import { CaptainDataContext } from "../context/CaptainContext";
import axios from "axios";

const CaptainHome = () => {
  const [ridePopupPanel, setRidePopupPanel] = useState(false);
  const [confirmRidePopupPanel, setConfirmRidePopupPanel] = useState(false);
  const [assignedCaptain, setAssignedCaptain] = useState(null);

  const ridePopupPanelRef = useRef(null);
  const confirmRidePopupPanelRef = useRef(null);
  const [ride, setRide] = useState(null);

  const navigate = useNavigate()

  const { socket } = useContext(SocketContext);
  const { captain } = useContext(CaptainDataContext);

  useEffect(() => {
    if (!socket) return;

    socket.emit("join", {
      userId: captain._id,
      userType: "captain",
    });

    const updateLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          socket.emit("update-location-captain", {
            userId: captain._id,
            location: {
              ltd: position.coords.latitude,
              lng: position.coords.longitude,
            },
          });
        });
      }
    };

    const locationInterval = setInterval(updateLocation, 10000);
    updateLocation();

    socket.on("new-ride", (data) => {
      console.log("Ride received from socket:", data); // Debugging
      setRide(data);
      setRidePopupPanel(true);
    });

    return () => {
      clearInterval(locationInterval);
      socket.off("new-ride");
    };
  }, [socket, captain]);
  async function confirmRide(rideId) {
    console.log("Ride ID passed to confirmRide:", ride?.rideId);
    console.log("Captain ID passed to confirmRide:", captain._id);

    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/rides/confirm`,
        {
          rideId: ride?.rideId,
          captainId: captain._id,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );

      console.log("Ride confirmed successfully:", response.data);

      // Save captain info from response
      setAssignedCaptain(response.data.ride.captain);

      // Emit event
      socket.emit("ride-confirmed", {
        rideId: response.data.ride._id,
        userId: response.data.ride.user,
      });

      setRidePopupPanel(false);
      setConfirmRidePopupPanel(true);
    } catch (err) {
      console.error("Error confirming ride:", err);
    }
  }
  useGSAP(
    function () {
      if (ridePopupPanel) {
        gsap.to(ridePopupPanelRef.current, {
          transform: "translateY(0)",
        });
      } else {
        gsap.to(ridePopupPanelRef.current, {
          transform: "translateY(100%)",
        });
      }
    },
    [ridePopupPanel]
  );

  useGSAP(
    function () {
      if (confirmRidePopupPanel) {
        gsap.to(confirmRidePopupPanelRef.current, {
          transform: "translateY(0)",
        });
      } else {
        gsap.to(confirmRidePopupPanelRef.current, {
          transform: "translateY(100%)",
        });
      }
    },
    [confirmRidePopupPanel]
  );

  const handleCaptainLogout = async () => {
  try {
    const token = localStorage.getItem('captainToken');
    await axios.post(
      `${import.meta.env.VITE_BASE_URL}/captain/captain-logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (err) {
    // Optionally handle error
  } finally {
    localStorage.removeItem('captainToken');
    navigate('/captain-login');
  }
};

  return (
    <div className="h-screen">
      <div className="fixed p-6 top-0 flex items-center justify-between w-screen">
        <img
          className="w-16"
          src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png"
          alt=""
        />
        <button
  onClick={handleCaptainLogout}
  className="h-10 w-10 bg-white flex items-center justify-center rounded-full"
  title="Logout"
>
  <i className="text-lg font-medium ri-logout-box-r-line"></i>
</button>
      </div>
      <div className="h-3/5">
        <img
          className="h-full w-full object-cover"
          src="https://miro.medium.com/v2/resize:fit:1400/0*gwMx05pqII5hbfmX.gif"
          alt=""
        />
      </div>
      <div className="h-2/5 p-6">
        <CaptainDetails />
      </div>
      <div
        ref={ridePopupPanelRef}
        className="fixed w-full z-10 bottom-0 translate-y-full bg-white px-3 py-10 pt-12"
      >
        <RidePopUp
          ride={ride}
          confirmRide={confirmRide}
          setRidePopupPanel={setRidePopupPanel}
          setConfirmRidePopupPanel={setConfirmRidePopupPanel}
        />
      </div>
      <div
        ref={confirmRidePopupPanelRef}
        className="fixed w-full h-screen z-10 bottom-0 translate-y-full bg-white px-3 py-10 pt-12"
      >
        <ConfirmRidePopUp
          ride={ride}
          confirmRide={confirmRide}
          setConfirmRidePopupPanel={setConfirmRidePopupPanel}
          setRidePopupPanel={setRidePopupPanel}
        />
      </div>
    </div>
  );
};

export default CaptainHome;
