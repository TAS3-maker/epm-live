import React, { useState } from 'react';

const Profile = () => {
  const [profileData, setProfileData] = useState({
    firstName: '', // Added for demonstration
    lastName: '',  // Added for demonstration
    name: '',
    email: '',
    phone: '',
    emergencyPhone: '',
    address: '',
    bio: '',
    image: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileData(prev => ({
        ...prev,
        image: URL.createObjectURL(file),
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Profile data submitted:', profileData);
    // You can call an API here to save the data
    alert('Profile updated successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-4xl">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Profile</h2>
        <form onSubmit={handleSubmit}>
          {/* Profile Image Upload */}
          <div className="flex justify-center mb-4">
            <div className="relative w-24 h-24">
              <img
                src={profileData.image || 'https://via.placeholder.com/100'}
                alt="Profile"
                className="w-full h-full object-cover rounded-full border"
              />
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white text-xs px-2 py-1 rounded-full cursor-pointer hover:bg-blue-700">
                <input
                  type="file"
                  className="hidden"
                  onChange={handleImageChange}
                  accept="image/*"
                />
                Edit
              </label>
            </div>
          </div>

          {/* Existing Full Name (if still needed, otherwise remove or adapt) */}
          <div className="flex flex-wrap mx-2 mb-4">
          <div className="w-1/2 px-2 mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={profileData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your full name"
              required
            />
          </div>

          {/* Email */}
          <div className="w-1/2 px-2 mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={profileData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
              required
            />
          </div>
        </div>

          <div className='flex flex-wrap mx-2 mb-4 '>
                {/* Phone Number */}
            <div className="w-1/2 px-2 mb-4">
                <label className="block text-gray-700 text-sm font-semibold mb-1">
                Phone Number
                </label>
                <input
                type="tel"
                name="phone"
                value={profileData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., +1234567890"
                />
            </div>

            {/* Emergency Phone Number */}
            <div className="w-1/2 px-2  mb-4">
                <label className="block text-gray-700 text-sm font-semibold mb-1">
                Emergency Phone Number
                </label>
                <input
                type="tel"
                name="emergencyPhone"
                value={profileData.emergencyPhone}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., +1234567890"
                />
            </div>
          </div>

          {/* Address */}
          <div className="mb-4 px-2">
            <label className="block text-gray-700 text-sm font-semibold mb-1">
              Address
            </label>
            <textarea
              name="address"
              value={profileData.address}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your full address"
              rows="3"
            />
          </div>


          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;