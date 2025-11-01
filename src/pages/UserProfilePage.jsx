import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { getUserProfile, updateUserProfile, changePassword } from '../services/authService';

const UserProfilePage = () => {
    const { user, updateUser, logout } = useAuth();
    const navigate = useNavigate();
    
    const [activeTab, setActiveTab] = useState('profile'); // profile, addresses, security
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Password visibility states
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    // Profile data
    const [profileData, setProfileData] = useState({
        name: '',
        phone: '',
        email: ''
    });

    // Address data
    const [addresses, setAddresses] = useState([]);
    const [editingAddressIndex, setEditingAddressIndex] = useState(null);
    const [newAddress, setNewAddress] = useState({
        fullName: '',
        phone: '',
        pincode: '',
        city: '',
        state: '',
        addressLine: '',
        landmark: '',
        default: false
    });

    // Password data
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Load user data on mount and when user changes
    useEffect(() => {
        if (user) {
            // Initialize from AuthContext first
            setProfileData({
                name: user.name || '',
                phone: user.phone || '',
                email: user.email || ''
            });
            if (user.address && Array.isArray(user.address)) {
                console.log('Setting addresses from user:', user.address);
                setAddresses(user.address);
            }
        }
        // Then load fresh data from backend
        loadUserData();
    }, []);

    const loadUserData = async () => {
        setLoading(true);
        const result = await getUserProfile();
        if (result.success) {
            const userData = result.data;
            setProfileData({
                name: userData.name || '',
                phone: userData.phone || '',
                email: userData.email || ''
            });
            // Ensure addresses are loaded correctly
            const userAddresses = userData.address || [];
            console.log('Loaded addresses:', userAddresses); // Debug log
            setAddresses(userAddresses);
            updateUser(userData);
        } else {
            setError(result.message || 'Failed to load profile');
        }
        setLoading(false);
    };

    // Profile Tab - Update basic info
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const result = await updateUserProfile({
                name: profileData.name,
                phone: profileData.phone
            });

            if (result.success) {
                updateUser(result.data);
                setSuccess('Profile updated successfully!');
                setIsEditing(false);
                // Reload to get fresh data including new token
                await loadUserData();
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Address Management
    const handleAddAddress = async () => {
        if (!newAddress.fullName || !newAddress.phone || !newAddress.addressLine) {
            setError('Please fill in required address fields (Name, Phone, Address Line)');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const updatedAddresses = [...addresses, newAddress];
            const result = await updateUserProfile({ address: updatedAddresses });

            if (result.success) {
                setAddresses(updatedAddresses);
                setSuccess('Address added successfully!');
                setNewAddress({
                    fullName: '',
                    phone: '',
                    pincode: '',
                    city: '',
                    state: '',
                    addressLine: '',
                    landmark: '',
                    default: false
                });
                await loadUserData();
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('Failed to add address');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateAddress = async (index) => {
        setLoading(true);
        setError('');

        try {
            const result = await updateUserProfile({ address: addresses });

            if (result.success) {
                setSuccess('Address updated successfully!');
                setEditingAddressIndex(null);
                await loadUserData();
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('Failed to update address');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAddress = async (index) => {
        if (!confirm('Are you sure you want to delete this address?')) return;

        setLoading(true);
        setError('');

        try {
            const updatedAddresses = addresses.filter((_, i) => i !== index);
            const result = await updateUserProfile({ address: updatedAddresses });

            if (result.success) {
                setAddresses(updatedAddresses);
                setSuccess('Address deleted successfully!');
                await loadUserData();
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('Failed to delete address');
        } finally {
            setLoading(false);
        }
    };

    const handleSetDefaultAddress = async (index) => {
        setLoading(true);
        setError('');

        try {
            const updatedAddresses = addresses.map((addr, i) => ({
                ...addr,
                default: i === index
            }));
            
            const result = await updateUserProfile({ address: updatedAddresses });

            if (result.success) {
                setAddresses(updatedAddresses);
                setSuccess('Default address updated!');
                await loadUserData();
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('Failed to update default address');
        } finally {
            setLoading(false);
        }
    };

    // Password Change
    const handleChangePassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);

        try {
            const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);

            if (result.success) {
                setSuccess('Password changed successfully!');
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">My Account</h1>
                            <p className="text-gray-600 mt-1">Manage your profile and preferences</p>
                        </div>
                        <button
                            onClick={logout}
                            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-2xl shadow-lg mb-6">
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                                activeTab === 'profile'
                                    ? 'text-green-600 border-b-2 border-green-600'
                                    : 'text-gray-600 hover:text-gray-800'
                            }`}
                        >
                            Profile Info
                        </button>
                        <button
                            onClick={() => setActiveTab('addresses')}
                            className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                                activeTab === 'addresses'
                                    ? 'text-green-600 border-b-2 border-green-600'
                                    : 'text-gray-600 hover:text-gray-800'
                            }`}
                        >
                            Addresses ({addresses.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                                activeTab === 'security'
                                    ? 'text-green-600 border-b-2 border-green-600'
                                    : 'text-gray-600 hover:text-gray-800'
                            }`}
                        >
                            Security
                        </button>
                    </div>

                    {/* Messages */}
                    {(success || error) && (
                        <div className="p-6">
                            {success && (
                                <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
                                    {success}
                                </div>
                            )}
                            
                            {error && (
                                <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                                    {error}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab Content */}
                    <div className="p-6">
                        {/* Profile Info Tab */}
                        {activeTab === 'profile' && (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-800">Personal Information</h2>
                                    {!isEditing && (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                                        >
                                            Edit
                                        </button>
                                    )}
                                </div>

                                <form onSubmit={handleUpdateProfile} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Full Name */}
                                        <div>
                                            <label className="block text-gray-700 font-medium mb-2">
                                                Full Name *
                                            </label>
                                            <input
                                                type="text"
                                                value={profileData.name}
                                                onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                                                disabled={!isEditing || loading}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all disabled:bg-gray-100"
                                                required
                                            />
                                        </div>

                                        {/* Email (Read-only) */}
                                        <div>
                                            <label className="block text-gray-700 font-medium mb-2">
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                value={profileData.email}
                                                disabled
                                                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                                            />
                                            <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
                                        </div>

                                        {/* Phone */}
                                        <div>
                                            <label className="block text-gray-700 font-medium mb-2">
                                                Phone Number
                                            </label>
                                            <input
                                                type="tel"
                                                value={profileData.phone}
                                                onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                                                disabled={!isEditing || loading}
                                                placeholder="Enter phone number"
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all disabled:bg-gray-100"
                                            />
                                        </div>

                                        {/* Role */}
                                        <div>
                                            <label className="block text-gray-700 font-medium mb-2">
                                                Account Type
                                            </label>
                                            <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100">
                                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                                                    user?.role === 'admin' 
                                                        ? 'bg-purple-100 text-purple-800' 
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {user?.role === 'admin' ? 'Admin' : 'Customer'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    {isEditing && (
                                        <div className="flex gap-4 justify-end">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsEditing(false);
                                                    setProfileData({
                                                        name: user?.name || '',
                                                        phone: user?.phone || '',
                                                        email: user?.email || ''
                                                    });
                                                    setError('');
                                                }}
                                                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all"
                                                disabled={loading}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                                            >
                                                {loading ? 'Saving...' : 'Save Changes'}
                                            </button>
                                        </div>
                                    )}
                                </form>
                            </div>
                        )}

                        {/* Addresses Tab */}
                        {activeTab === 'addresses' && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">Saved Addresses</h2>

                                {/* Existing Addresses */}
                                <div className="space-y-4 mb-8">
                                    {addresses.length === 0 ? (
                                        <p className="text-gray-500 text-center py-8">No saved addresses yet. Add one below!</p>
                                    ) : (
                                        addresses.map((address, index) => (
                                            <div
                                                key={index}
                                                className={`p-4 border-2 rounded-lg ${
                                                    address.default
                                                        ? 'border-green-500 bg-green-50'
                                                        : 'border-gray-200'
                                                }`}
                                            >
                                                {editingAddressIndex === index ? (
                                                    // Edit mode
                                                    <div className="space-y-3">
                                                        <input
                                                            type="text"
                                                            value={address.fullName}
                                                            onChange={(e) => {
                                                                const updated = [...addresses];
                                                                updated[index].fullName = e.target.value;
                                                                setAddresses(updated);
                                                            }}
                                                            placeholder="Full Name"
                                                            className="w-full p-2 border rounded-lg"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={address.phone}
                                                            onChange={(e) => {
                                                                const updated = [...addresses];
                                                                updated[index].phone = e.target.value;
                                                                setAddresses(updated);
                                                            }}
                                                            placeholder="Phone"
                                                            className="w-full p-2 border rounded-lg"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={address.addressLine}
                                                            onChange={(e) => {
                                                                const updated = [...addresses];
                                                                updated[index].addressLine = e.target.value;
                                                                setAddresses(updated);
                                                            }}
                                                            placeholder="Address Line"
                                                            className="w-full p-2 border rounded-lg"
                                                        />
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <input
                                                                type="text"
                                                                value={address.city}
                                                                onChange={(e) => {
                                                                    const updated = [...addresses];
                                                                    updated[index].city = e.target.value;
                                                                    setAddresses(updated);
                                                                }}
                                                                placeholder="City"
                                                                className="p-2 border rounded-lg"
                                                            />
                                                            <input
                                                                type="text"
                                                                value={address.state}
                                                                onChange={(e) => {
                                                                    const updated = [...addresses];
                                                                    updated[index].state = e.target.value;
                                                                    setAddresses(updated);
                                                                }}
                                                                placeholder="State"
                                                                className="p-2 border rounded-lg"
                                                            />
                                                            <input
                                                                type="text"
                                                                value={address.pincode}
                                                                onChange={(e) => {
                                                                    const updated = [...addresses];
                                                                    updated[index].pincode = e.target.value;
                                                                    setAddresses(updated);
                                                                }}
                                                                placeholder="Pincode"
                                                                className="p-2 border rounded-lg"
                                                            />
                                                            <input
                                                                type="text"
                                                                value={address.landmark}
                                                                onChange={(e) => {
                                                                    const updated = [...addresses];
                                                                    updated[index].landmark = e.target.value;
                                                                    setAddresses(updated);
                                                                }}
                                                                placeholder="Landmark"
                                                                className="p-2 border rounded-lg"
                                                            />
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleUpdateAddress(index)}
                                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                                                disabled={loading}
                                                            >
                                                                Save
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingAddressIndex(null)}
                                                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    // View mode
                                                    <div>
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div>
                                                                <p className="font-bold text-gray-800">{address.fullName}</p>
                                                                <p className="text-gray-600">{address.phone}</p>
                                                            </div>
                                                            {address.default && (
                                                                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                                                                    DEFAULT
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-gray-700">{address.addressLine}</p>
                                                        {address.landmark && (
                                                            <p className="text-gray-600 text-sm">Landmark: {address.landmark}</p>
                                                        )}
                                                        <p className="text-gray-600">
                                                            {address.city}, {address.state} - {address.pincode}
                                                        </p>
                                                        
                                                        <div className="flex gap-2 mt-4">
                                                            <button
                                                                onClick={() => setEditingAddressIndex(index)}
                                                                className="px-4 py-1 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                                            >
                                                                Edit
                                                            </button>
                                                            {!address.default && (
                                                                <button
                                                                    onClick={() => handleSetDefaultAddress(index)}
                                                                    className="px-4 py-1 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                                    disabled={loading}
                                                                >
                                                                    Set as Default
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleDeleteAddress(index)}
                                                                className="px-4 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                disabled={loading}
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Add New Address */}
                                <div className="mt-8 pt-8 border-t border-gray-200">
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">Add New Address</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            value={newAddress.fullName}
                                            onChange={(e) => setNewAddress({...newAddress, fullName: e.target.value})}
                                            placeholder="Full Name *"
                                            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                        <input
                                            type="tel"
                                            value={newAddress.phone}
                                            onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                                            placeholder="Phone Number *"
                                            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                        <input
                                            type="text"
                                            value={newAddress.addressLine}
                                            onChange={(e) => setNewAddress({...newAddress, addressLine: e.target.value})}
                                            placeholder="Address Line *"
                                            className="md:col-span-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                        <input
                                            type="text"
                                            value={newAddress.landmark}
                                            onChange={(e) => setNewAddress({...newAddress, landmark: e.target.value})}
                                            placeholder="Landmark (Optional)"
                                            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                        <input
                                            type="text"
                                            value={newAddress.city}
                                            onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                                            placeholder="City"
                                            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                        <input
                                            type="text"
                                            value={newAddress.state}
                                            onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                                            placeholder="State"
                                            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                        <input
                                            type="text"
                                            value={newAddress.pincode}
                                            onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value})}
                                            placeholder="Pincode"
                                            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>
                                    
                                    <div className="flex items-center gap-2 mt-4">
                                        <input
                                            type="checkbox"
                                            id="defaultAddress"
                                            checked={newAddress.default}
                                            onChange={(e) => setNewAddress({...newAddress, default: e.target.checked})}
                                            className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="defaultAddress" className="text-gray-700">
                                            Set as default address
                                        </label>
                                    </div>

                                    <button
                                        onClick={handleAddAddress}
                                        disabled={loading}
                                        className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Adding...' : 'Add Address'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">Change Password</h2>
                                
                                <form onSubmit={handleChangePassword} className="max-w-md space-y-6">
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">
                                            Current Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showCurrentPassword ? "text" : "password"}
                                                value={passwordData.currentPassword}
                                                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                                placeholder="Enter current password"
                                                className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                                required
                                                disabled={loading}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                            >
                                                {showCurrentPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">
                                            New Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showNewPassword ? "text" : "password"}
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                                placeholder="Enter new password (min 6 characters)"
                                                className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                                required
                                                minLength={6}
                                                disabled={loading}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                            >
                                                {showNewPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">
                                            Confirm New Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                                placeholder="Confirm new password"
                                                className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                                required
                                                disabled={loading}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                            >
                                                {showConfirmPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Changing Password...' : 'Change Password'}
                                    </button>
                                </form>

                                {/* Account Actions */}
                                <div className="mt-8 pt-8 border-t border-gray-200">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 text-red-600">Danger Zone</h3>
                                    <p className="text-gray-600 mb-4">Once you logout, you'll need to login again with your credentials.</p>
                                    <button
                                        onClick={logout}
                                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                                    >
                                        Logout from Account
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            onClick={() => navigate('/my-orders')}
                            className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left"
                        >
                            <h3 className="font-semibold text-gray-800">My Orders</h3>
                            <p className="text-sm text-gray-600">View order history</p>
                        </button>
                        <button
                            onClick={() => navigate('/products')}
                            className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left"
                        >
                            <h3 className="font-semibold text-gray-800">Shop Products</h3>
                            <p className="text-sm text-gray-600">Browse our collection</p>
                        </button>
                        <button
                            onClick={() => navigate('/cart')}
                            className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left"
                        >
                            <h3 className="font-semibold text-gray-800">My Cart</h3>
                            <p className="text-sm text-gray-600">View shopping cart</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfilePage;
