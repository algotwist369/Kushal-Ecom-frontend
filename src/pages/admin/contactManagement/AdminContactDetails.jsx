import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../../api/axiosConfig';
import BackButton from '../../../components/common/BackButton';
import { BsEnvelope, BsPhone, BsClock } from 'react-icons/bs';

const AdminContactDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [contact, setContact] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [formData, setFormData] = useState({
        status: '',
        priority: '',
        adminNotes: ''
    });

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchContact();
    }, [id]);

    const fetchContact = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/contacts/${id}`);
            if (response.data.success) {
                const contactData = response.data.data;
                setContact(contactData);
                setFormData({
                    status: contactData.status || 'new',
                    priority: contactData.priority || 'medium',
                    adminNotes: contactData.adminNotes || ''
                });
            }
        } catch (error) {
            console.error('Error fetching contact:', error);
            if (error.response?.status === 404) {
                toast.error('Contact not found');
                setTimeout(() => navigate('/admin/contacts'), 2000);
            } else {
                toast.error('Failed to load contact');
            }
        }
        setLoading(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setUpdating(true);

        try {
            const updatePromise = api.put(`/contacts/${id}`, formData);
            
            await toast.promise(
                updatePromise,
                {
                    loading: 'Updating contact...',
                    success: 'Contact updated successfully!',
                    error: 'Failed to update contact',
                }
            );

            const result = await updatePromise;
            
            if (result.data.success) {
                setContact(result.data.data);
            }
        } catch (error) {
            console.error('Error updating contact:', error);
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm(`Are you sure you want to delete this contact from ${contact?.name}?`)) {
            try {
                await toast.promise(
                    api.delete(`/contacts/${id}`),
                    {
                        loading: 'Deleting contact...',
                        success: 'Contact deleted successfully!',
                        error: 'Failed to delete contact',
                    }
                );
                navigate('/admin/contacts', { replace: true, state: { refresh: Date.now() } });
            } catch (error) {
                console.error('Error deleting contact:', error);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!contact) {
        return (
            <div className="min-h-screen bg-gray-50 py-8 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <BackButton to="/admin/contacts" label="Back to Contacts" />
                    <div className="bg-white p-12 rounded-lg">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Not Found</h2>
                        <button
                            onClick={() => navigate('/admin/contacts')}
                            className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition"
                        >
                            Back to Contacts
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <BackButton to="/admin/contacts" label="Back to Contacts" />
                
                {/* Header */}
                <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">Contact Details</h1>
                        <p className="text-gray-600 mt-2">#{contact._id.slice(-8)}</p>
                    </div>
                    <button
                        onClick={handleDelete}
                        className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition font-semibold"
                    >
                        Delete Contact
                    </button>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Contact Information */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Customer Info */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Customer Information</h2>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-500">Name</p>
                                    <p className="text-gray-900 font-medium">{contact.name}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <BsEnvelope className="text-gray-500" />
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <a href={`mailto:${contact.email}`} className="text-gray-600 hover:underline">
                                            {contact.email}
                                        </a>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <BsPhone className="text-gray-500" />
                                    <div>
                                        <p className="text-sm text-gray-500">Phone</p>
                                        <a href={`tel:${contact.phone}`} className="text-gray-600 hover:underline">
                                            {contact.phone}
                                        </a>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <BsClock className="text-gray-500" />
                                    <div>
                                        <p className="text-sm text-gray-500">Submitted</p>
                                        <p className="text-gray-900">{new Date(contact.createdAt).toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Message */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Subject</h2>
                            <p className="text-gray-900 font-medium mb-4">{contact.subject}</p>
                            
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Message</h3>
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <p className="text-gray-700 whitespace-pre-wrap">{contact.message}</p>
                            </div>
                        </div>
                    </div>

                    {/* Admin Actions */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Manage Contact</h2>
                            
                            <form onSubmit={handleUpdate} className="space-y-4">
                                {/* Status */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Status
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                        disabled={updating}
                                    >
                                        <option value="new">New</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="closed">Closed</option>
                                    </select>
                                </div>

                                {/* Priority */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Priority
                                    </label>
                                    <select
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                        disabled={updating}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>

                                {/* Admin Notes */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Admin Notes
                                    </label>
                                    <textarea
                                        name="adminNotes"
                                        value={formData.adminNotes}
                                        onChange={handleChange}
                                        placeholder="Add internal notes..."
                                        rows="4"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                                        disabled={updating}
                                    />
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={updating}
                                    className="w-full bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 transition font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    {updating ? 'Updating...' : 'Update Contact'}
                                </button>
                            </form>

                            {/* Resolution Info */}
                            {contact.resolvedAt && (
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <p className="text-sm text-gray-500 mb-2">Resolved</p>
                                    <p className="text-sm text-gray-900">
                                        {new Date(contact.resolvedAt).toLocaleString('en-IN')}
                                    </p>
                                    {contact.resolvedBy && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            By: {contact.resolvedBy.name}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminContactDetails;

