import React, { useState, useRef, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import axios from "axios";
import { debounce } from "lodash";
import LocationSearchPanel from "../../components/LocationSearchPanel";
import VehiclePanel from "../../components/VehiclePanel";
import ConfirmRide from "../../components/ConfirmRide";
import LookingForDriver from "../../components/LookingForDriver";
import WaitingForDriver from "../../components/WaitingForDriver";
import { SocketContext } from '../context/SocketContext';
import { useContext } from 'react';
import { UserDataContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [activeField, setActiveField] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [confirmRidePanel, setConfirmRidePanel] = useState(false);
  const [vehiclePanel, setVehiclePanel] = useState(false);
  const [fare, setFare] = useState({});
  const [vehicleFound, setVehicleFound] = useState(false);
  const [waitingForDriver, setWaitingForDriver] = useState(false);
  const [vehicleType, setVehicleType] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [ride, setRide] = useState(null);
  const [captain, setCaptain] = useState(null);

  const vehiclePanelRef = useRef(null);
  const confirmRidePanelRef = useRef(null);
  const vehicleFoundRef = useRef(null);
  const waitingForDriverRef = useRef(null);
  const panelRef = useRef(null);
  const panelCloseRef = useRef(null);
  const navigate = useNavigate();

  const { socket } = useContext(SocketContext);
  const { user } = useContext(UserDataContext);

  useEffect(() => {
    socket.emit("join", { userType: "user", userId: user._id });
    console.log("User joined socket room:", user._id);
  }, [socket, user]);

  useEffect(() => {
    if (!socket) return;

    socket.on('ride-confirmed', (data) => {
      console.log('Ride confirmed event received:', data);
      
      if (data.rideId) {
        fetchRideDetails(data.rideId);
      }
    });

    return () => {
      socket.off('ride-confirmed');
    };
  }, [socket]);

  socket.on('ride-started', ride => {
    console.log("Ride started, navigating:", ride);
    setWaitingForDriver(false);
    navigate('/riding', { state: { ride } });
  });

  const debouncedPickupSearch = debounce(async (input) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/maps/get-suggestions`,
        {
          params: { input },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );
      setPickupSuggestions(response.data);
    } catch (error) {
      console.error("Error fetching pickup suggestions:", error);
    }
  }, 500);

  const debouncedDestinationSearch = debounce(async (input) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/maps/get-suggestions`,
        {
          params: { input },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );
      setDestinationSuggestions(response.data);
    } catch (error) {
      console.error("Error fetching destination suggestions:", error);
    }
  }, 500);

  const submitHandler = (e) => {
    e.preventDefault();
  };

  useGSAP(() => {
    if (panelOpen) {
      gsap.to(panelRef.current, {
        height: "70%",
        padding: 20,
      });
      gsap.to(panelCloseRef.current, {
        opacity: 1,
      });
    } else {
      gsap.to(panelRef.current, {
        height: "0%",
        padding: 0,
      });
      gsap.to(panelCloseRef.current, {
        opacity: 0,
      });
    }
  }, [panelOpen, panelCloseRef]);

  useGSAP(
    function () {
      if (vehiclePanel) {
        gsap.to(vehiclePanelRef.current, {
          transform: "translateY(0)",
        });
      } else {
        gsap.to(vehiclePanelRef.current, {
          transform: "translateY(100%)",
        });
      }
    },
    [vehiclePanel]
  );

  useGSAP(
    function () {
      if (confirmRidePanel) {
        gsap.to(confirmRidePanelRef.current, {
          transform: "translateY(0)",
        });
      } else {
        gsap.to(confirmRidePanelRef.current, {
          transform: "translateY(100%)",
        });
      }
    },
    [confirmRidePanel]
  );

  useGSAP(() => {
    if (vehicleFound && vehicleFoundRef.current) {
      gsap.to(vehicleFoundRef.current, {
        transform: "translateY(0)",
      });
    } else if (vehicleFoundRef.current) {
      gsap.to(vehicleFoundRef.current, {
        transform: "translateY(100%)",
      });
    }
  }, [vehicleFound]);

  useGSAP(
    function () {
      if (waitingForDriver) {
        gsap.to(waitingForDriverRef.current, {
          transform: "translateY(0)",
        });
      } else {
        gsap.to(waitingForDriverRef.current, {
          transform: "translateY(100%)",
        });
      }
    },
    [waitingForDriver]
  );

  const handlePickupChange = (e) => {
    setPickup(e.target.value);
    debouncedPickupSearch(e.target.value);
  };

  const handleDestinationChange = (e) => {
    setDestination(e.target.value);
    debouncedDestinationSearch(e.target.value);
  };

  async function findTrip() {
    try {
      setVehiclePanel(true);
      setPanelOpen(false);

      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/rides/get-fare`,
        {
          params: { pickup, destination },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );
      setFare(response.data);
    } catch (error) {
      console.error("Error fetching fare:", error.response || error.message);
    }
  }

async function createRide() {
  const userToken = localStorage.getItem("userToken");

  if (!pickup || !destination || !selectedVehicle) {
    console.error("Missing required ride details");
    return;
  }

  if (!userToken) {
    console.error("User not authenticated");
    return;
  }

  try {
    console.log("Ride Request Payload:", {
      pickup,
      destination,
      vehicleType: selectedVehicle,
    });

    const response = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/rides/createRide`,
      {
        pickup,
        destination,
        vehicleType: selectedVehicle,
      },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    console.log("Ride created successfully:", response.data);

    setRide(response.data);
    setCaptain(response.data.captain);

    setVehicleFound(false);
    setWaitingForDriver(true);

  } catch (error) {
    const errMsg = error?.response?.data?.message || error.message;
    console.error("Error creating ride:", errMsg);
  }
}



  async function fetchRideDetails(rideId) {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/captain/get-ride-details/${rideId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("captainToken")}`,
          },
        }
      );
      console.log("Fetched ride details:", response.data.ride);
      setRide(response.data.ride); 
      setVehicleFound(true); 
    } catch (error) {
      console.error("Error fetching ride details:", error.response || error.message);
    }
  }

  return (
    <div className="h-screen w-screen relative overflow-hidden">
      <img
        className="w-16 absolute left-5 top-5"
        src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png"
        alt=""
      />
      <div
        onClick={() => {
          setVehiclePanel(false);
        }}
        className="h-screen w-screen "
      >
        <img
          className="w-full h-full object-cover"
          src="https://miro.medium.com/v2/resize:fit:1400/0*gwMx05pqII5hbfmX.gif"
          alt=""
        />
      </div>
      <div className="flex flex-col justify-end h-screen absolute top-0 w-full ">
        <div className="h-[30%] p-5 bg-white relative">
          <h5
            ref={panelCloseRef}
            onClick={() => setPanelOpen(false)}
            className="absolute top-6 right-6 text-2xl"
          >
            <i className="ri-arrow-down-wide-fill"></i>
          </h5>
          <h4 className="text-3xl font-semibold">Find a Trip</h4>
          <form
            onSubmit={(e) => submitHandler(e)}
            className="flex flex-col gap-3"
          >
            <div className="line absolute h-16 w-1 top-[50%] left-10 bg-gray-700 rounded-full"></div>
            <input
              onClick={() => setPanelOpen(true)}
              onFocus={() => setActiveField("pickup")}
              value={pickup}
              onChange={handlePickupChange}
              className="bg-[#eee] mt-5 rounded-lg px-12 py-2 w-full text-lg placeholder:text-base"
              type="text"
              placeholder="Add a pickup location"
            />
            <input
              onClick={() => setPanelOpen(true)}
              onFocus={() => setActiveField("destination")}
              value={destination}
              onChange={handleDestinationChange}
              className="bg-[#eee] mt-1 rounded-lg px-12 py-2 w-full text-lg placeholder:text-base"
              type="text"
              placeholder="Enter your destination"
            />
          </form>
          <button
            onClick={findTrip}
            className="bg-black text-white px-4 py-2 rounded-lg mt-3 w-full"
          >
            Find Trip
          </button>
        </div>
        <div ref={panelRef} className="bg-white h-0">
          <LocationSearchPanel
            suggestions={
              activeField === "pickup"
                ? pickupSuggestions
                : destinationSuggestions
            }
            setPanelOpen={setPanelOpen}
            setVehiclePanel={setVehiclePanel}
            setPickup={setPickup}
            setDestination={setDestination}
            activeField={activeField}
          />
        </div>
      </div>
      <div
        ref={vehiclePanelRef}
        className="fixed w-full z-10 bottom-0 px-3 py-8 bg-white translate-y-full"
      >
        <VehiclePanel
          selectVehicle={setVehicleType}
          setConfirmRidePanel={setConfirmRidePanel}
          fare={fare}
          setVehiclePanel={setVehiclePanel}
          setSelectedVehicle={setSelectedVehicle}
        />
      </div>
      <div
        ref={confirmRidePanelRef}
        className="fixed w-full z-20 bottom-0 px-3 py-8 bg-white translate-y-full"
      >
        <ConfirmRide
          createRide={createRide}
          pickup={pickup}
          destination={destination}
          fare={fare}
          vehicleType={selectedVehicle}
          setConfirmRidePanel={setConfirmRidePanel}
          setVehicleFound={setVehicleFound}
        />
      </div>
      {vehicleFound && (
        <div
          ref={vehicleFoundRef}
          className="fixed w-full z-10 bottom-0 translate-y-full bg-white px-3 py-6 pt-12"
        >
          <LookingForDriver
            createRide={createRide}
            pickup={pickup}
            destination={destination}
            fare={fare}
            vehicleType={selectedVehicle}
            selectedVehicle={selectedVehicle}
            setVehicleFound={setVehicleFound}
          />
        </div>
      )}
      <div
        ref={waitingForDriverRef}
        className="fixed w-full z-40 bottom-0 bg-white px-3 py-6 pt-12 translate-y-full"
      >
        <WaitingForDriver

          ride={ride} 
          setVehicleFound={setVehicleFound}
          setWaitingForDriver={setWaitingForDriver}
          waitingForDriver={waitingForDriver}
          vehicleType={selectedVehicle} 
        />
      </div>
    </div>
  );
};

export default Home;