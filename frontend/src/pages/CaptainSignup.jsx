import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CaptainDataContext } from '../context/CaptainContext';
import axios from 'axios';

const CaptainSignup = () => {
  const navigate = useNavigate();
  const { captain, setCaptain } = React.useContext(CaptainDataContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const [vehicleColor, setVehicleColor] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [vehicleCapacity, setVehicleCapacity] = useState('');
  const [vehicleType, setVehicleType] = useState('');

  const [captainImage, setCaptainImage] = useState(null);
  const [preview, setPreview] = useState(null);

const submitHandler = async (e) => {
  e.preventDefault();

  const formData = new FormData();

  // Use dot notation for nested fields
  formData.append('fullname.firstname', firstName);
  formData.append('fullname.lastname', lastName);
  formData.append('email', email);
  formData.append('password', password);

  formData.append('vehicle.color', vehicleColor);
  formData.append('vehicle.plate', vehiclePlate);
  formData.append('vehicle.capacity', vehicleCapacity);
  formData.append('vehicle.vehicleType', vehicleType);

  if (captainImage) formData.append('captainImage', captainImage);

  try {
    const response = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/captain/captain-register`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (response.status === 201) {
      const data = response.data;
      setCaptain(data.captain);
      localStorage.setItem('captainToken', data.token);
      navigate('/captain-home');
    }
  } catch (error) {
    console.error('Signup failed:', error.response?.data || error.message);
  }

  // Clear form fields
  setEmail('');
  setFirstName('');
  setLastName('');
  setPassword('');
  setVehicleColor('');
  setVehiclePlate('');
  setVehicleCapacity('');
  setVehicleType('');
  setCaptainImage(null);
  setPreview(null);
};


  return (
    <div className='h-screen flex flex-col justify-between px-5 py-5'>
      <div className='overflow-y-auto pr-2 pb-4'>
        <img
          className='w-16 mb-10'
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYQy-OIkA6In0fTvVwZADPmFFibjmszu2A0g&s"
          alt="logo"
        />

        <form onSubmit={submitHandler}>
          <h3 className="text-lg font-medium mb-2">Upload Profile Image</h3>
          <div className="flex items-center gap-4 mb-5">
            <label
              htmlFor="captainImage"
              className="cursor-pointer flex items-center justify-center w-24 h-24 rounded-full border-2 border-gray-400 bg-gray-100 hover:bg-gray-200 transition"
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="text-gray-500 text-sm text-center px-2">
                  Click to upload
                </span>
              )}
            </label>
            <input
              id="captainImage"
              type="file"
              accept="image/*"
              onChange={(e) => {
                setCaptainImage(e.target.files[0]);
                setPreview(URL.createObjectURL(e.target.files[0]));
              }}
              className="hidden"
            />
            {captainImage && (
              <div className="flex flex-col">
                <p className="text-sm font-medium">{captainImage.name}</p>
                <p className="text-xs text-gray-500">
                  {(captainImage.size / 1024).toFixed(2)} KB
                </p>
              </div>
            )}
          </div>

          <h3 className='text-lg font-medium mb-2'>What's our Captain's name</h3>
          <div className='flex gap-4 mb-5'>
            <input required value={firstName} onChange={(e) => setFirstName(e.target.value)} className='bg-[#eeeeee] w-1/2 rounded-lg px-4 py-2 border text-lg placeholder:text-base' type="text" placeholder='First name' />
            <input required value={lastName} onChange={(e) => setLastName(e.target.value)} className='bg-[#eeeeee] w-1/2 rounded-lg px-4 py-2 border text-lg placeholder:text-base' type="text" placeholder='Last name' />
          </div>

          <h3 className='text-lg font-medium mb-2'>What's our Captain's email</h3>
          <input required value={email} onChange={(e) => setEmail(e.target.value)} className='bg-[#eeeeee] mb-6 rounded-lg px-4 py-2 border w-full text-lg placeholder:text-base' type="email" placeholder='email@example.com' />

          <h3 className='text-lg font-medium mb-2'>Enter Password</h3>
          <input required value={password} onChange={(e) => setPassword(e.target.value)} className='bg-[#eeeeee] mb-6 rounded-lg px-4 py-2 border w-full text-lg placeholder:text-base' type="password" placeholder='password' />

          <h3 className='text-lg font-medium mb-2'>Vehicle Information</h3>
          <div className='flex gap-4 mb-5'>
            <input required value={vehicleColor} onChange={(e) => setVehicleColor(e.target.value)} className='bg-[#eeeeee] w-1/2 rounded-lg px-4 py-2 border text-lg placeholder:text-base' type="text" placeholder='Vehicle Color' />
            <input required value={vehiclePlate} onChange={(e) => setVehiclePlate(e.target.value)} className='bg-[#eeeeee] w-1/2 rounded-lg px-4 py-2 border text-lg placeholder:text-base' type="text" placeholder='Vehicle Plate' />
          </div>
          <div className='flex gap-4 mb-5'>
            <input required value={vehicleCapacity} onChange={(e) => setVehicleCapacity(e.target.value)} className='bg-[#eeeeee] w-1/2 rounded-lg px-4 py-2 border text-lg placeholder:text-base' type="number" placeholder='Vehicle Capacity' />
            <select required value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} className='bg-[#eeeeee] w-1/2 rounded-lg px-4 py-2 border text-lg placeholder:text-base'>
              <option value="" disabled>Select Vehicle Type</option>
              <option value="car">Car</option>
              <option value="auto">Auto</option>
              <option value="moto">Moto</option>
            </select>
          </div>

          <button className='bg-[#111] text-white font-semibold mb-3 rounded-lg px-4 py-2 w-full text-lg'>Create Captain Account</button>
        </form>

        <p className='text-center'>Already have an account? <Link to='/captain-login' className='text-blue-600'>Login here</Link></p>
      </div>

      <div>
        <p className='text-[10px] mt-5 leading-tight'>This site is protected by reCAPTCHA and the <span className='underline'>Google Privacy Policy</span> and <span className='underline'>Terms of Service apply</span>.</p>
      </div>
    </div>
  );
};

export default CaptainSignup;
