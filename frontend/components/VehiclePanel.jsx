import React from 'react'

const VehiclePanel  = ({ setConfirmRidePanel, setVehiclePanel, fare, setSelectedVehicle }) => {
  const vehicleTypes = [
    {
      type: "car",
      title: "UberGo",
      image: "https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg",
      users: 4,
      description: "Affordable, Compact Rides"
    },
    {
      type: "moto",
      title: "Moto",
      image: "https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_638,w_956/v1649231091/assets/2c/7fa194-c954-49b2-9c6d-a3b8601370f5/original/Uber_Moto_Orange_312x208_pixels_Mobile.png",
      users: 1,
  
      description: "Fast and Affordable Motorcycle Rides"
    },
    {
      type: "auto",
      title: "UberAuto",
      image: "https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_368,w_552/v1648431773/assets/1d/db8c56-0204-4ce4-81ce-56a11a07fe98/original/Uber_Auto_558x372_pixels_Desktop.png",
      users: 3,
      description: "Affordable Auto Rides"
    }
  ];

  return (
    <div>
      <h5 className="p-1 text-center w-[93%] absolute top-0">
        <i className="text-3xl text-gray-200 ri-arrow-down-wide-fill" onClick={() => setVehiclePanel(false)}></i>
      </h5>
      <h3 className="text-2xl font-semibold mb-5">Choose a Vehicle</h3>

      {vehicleTypes.map(vehicle => {
        const data = fare[vehicle.type]; // fare.auto / fare.car / fare.moto
        if (!data) return null;

        return (
          <div key={vehicle.type} onClick={() =>  {
            setSelectedVehicle(vehicle.type);
            setVehiclePanel(false);
            setConfirmRidePanel(true);
          }} className="flex border-2 active:border-black border-transparent mb-2 rounded-xl w-full p-3 items-center justify-between">
            <img className='h-10' src={vehicle.image} alt="" />
            <div className="ml-2 w-1/2">
              <h4 className="font-medium text-lg">{vehicle.title} <span><i className="ri-user-fill"></i>{vehicle.users}</span></h4>
              <h5 className="font-medium text-sm">{data.duration.text} Away</h5>
              <p className="font-normal text-xs text-gray-600">{data.distance.text}</p>
              <p className="font-normal text-xs text-gray-600">{vehicle.description}</p>
            </div>
            <h2 className="text-lg font-semibold">₹{data.fare}</h2>
          </div>
        );
      })}
    </div>
  );
};

export default VehiclePanel;
