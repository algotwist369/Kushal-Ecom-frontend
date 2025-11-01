import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../../api/axiosConfig';
import BackButton from '../../../components/common/BackButton';
import LoadingSpinner from '../../../components/admin/common/LoadingSpinner';

const AdminContacts = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ new: 0, in_progress: 0, resolved: 0, closed: 0 });
    
    // Filters
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalContacts, setTotalContacts] = useState(0);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchContacts();
    }, [currentPage, statusFilter, priorityFilter, searchTerm, sortBy]);

    // Force refresh when navigating back
    useEffect(() => {
        if (location.state?.refresh) {
            fetchContacts();
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const fetchContacts = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                limit: 20,
                ...(statusFilter && { status: statusFilter }),
                ...(priorityFilter && { priority: priorityFilter }),
                ...(searchTerm && { search: searchTerm }),
                ...(sortBy && { sortBy }),
                _t: Date.now()
            };

            const response = await api.get('/contacts', { params });
            
            if (response.data.success) {
                setContacts(response.data.data.contacts || []);
                setTotalPages(response.data.data.pages || 1);
                setTotalContacts(response.data.data.total || 0);
                setStats(response.data.data.stats || {});
            }
        } catch (error) {
            console.error('Error fetching contacts:', error);
            toast.error('Failed to fetch contacts');
        }
        setLoading(false);
    };

    const handleDelete = async (contactId, name) => {
        if (window.confirm(`Are you sure you want to delete contact from: ${name}?`)) {
            try {
                await toast.promise(
                    api.delete(`/contacts/${contactId}`),
                    {
                        loading: 'Deleting contact...',
                        success: 'Contact deleted successfully!',
                        error: 'Failed to delete contact',
                    }
                );
                fetchContacts();
            } catch (error) {
                console.error('Error deleting contact:', error);
            }
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'new':
                return 'bg-gray-100 text-gray-800';
            case 'in_progress':
                return 'bg-yellow-100 text-yellow-800';
            case 'resolved':
                return 'bg-green-100 text-green-800';
            case 'closed':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'urgent':
                return 'bg-red-100 text-red-800';
            case 'high':
                return 'bg-orange-100 text-orange-800';
            case 'medium':
                return 'bg-gray-100 text-gray-800';
            case 'low':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading && contacts.length === 0) {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <BackButton to="/admin" label="Back to Dashboard" />
                
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Contact Management</h1>
                    <p className="text-gray-600 mt-2">Manage customer inquiries and messages ({totalContacts} total)</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="text-2xl font-bold text-gray-600">{stats.new || 0}</div>
                        <div className="text-sm text-gray-600">New</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="text-2xl font-bold text-yellow-600">{stats.in_progress || 0}</div>
                        <div className="text-sm text-gray-600">In Progress</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="text-2xl font-bold text-green-600">{stats.resolved || 0}</div>
                        <div className="text-sm text-gray-600">Resolved</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="text-2xl font-bold text-gray-600">{stats.closed || 0}</div>
                        <div className="text-sm text-gray-600">Closed</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Name, email, subject..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                            />
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                            >
                                <option value="">All Status</option>
                                <option value="new">New</option>
                                <option value="in_progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>

                        {/* Priority Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                            <select
                                value={priorityFilter}
                                onChange={(e) => setPriorityFilter(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                            >
                                <option value="">All Priority</option>
                                <option value="urgent">Urgent</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                        </div>

                        {/* Sort */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="priority">By Priority</option>
                            </select>
                        </div>
                    </div>
                </div>

                {loading && <LoadingSpinner />}

                {/* Contacts List */}
                {!loading && contacts.length > 0 ? (
                    <div className="space-y-4">
                        {contacts.map((contact) => (
                            <div key={contact._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                                <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-start gap-3 mb-3">
                                            <h3 className="text-xl font-bold text-gray-900">{contact.name}</h3>
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(contact.status)}`}>
                                                {contact.status.replace('_', ' ').toUpperCase()}
                                            </span>
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getPriorityColor(contact.priority)}`}>
                                                {contact.priority.toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <p><strong>Email:</strong> {contact.email}</p>
                                            <p><strong>Phone:</strong> {contact.phone}</p>
                                            <p><strong>Subject:</strong> {contact.subject}</p>
                                            <p><strong>Submitted:</strong> {new Date(contact.createdAt).toLocaleString('en-IN')}</p>
                                        </div>
                                    </div>
                                    <div className="flex md:flex-col gap-2">
                                        <button
                                            onClick={() => navigate(`/admin/contacts/${contact._id}`)}
                                            className="flex-1 md:flex-initial bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm font-semibold"
                                        >
                                            View Details
                                        </button>
                                        <button
                                            onClick={() => handleDelete(contact._id, contact.name)}
                                            className="flex-1 md:flex-initial bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm font-semibold"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Message Preview */}
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <p className="text-sm text-gray-700 line-clamp-3">{contact.message}</p>
                                </div>

                                {/* Admin Notes Preview */}
                                {contact.adminNotes && (
                                    <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
                                        <p className="text-xs text-gray-800 font-semibold mb-1">Admin Notes:</p>
                                        <p className="text-sm text-gray-900 line-clamp-2">{contact.adminNotes}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : !loading && (
                    <div className="text-center py-12 bg-white rounded-lg shadow-md">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No contacts found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {searchTerm || statusFilter || priorityFilter
                                ? 'Try adjusting your filters.'
                                : 'No customer inquiries yet.'}
                        </p>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-8">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span className="text-gray-700">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminContacts;

