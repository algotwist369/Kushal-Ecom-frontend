import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createCoupon } from '../../../services/adminService';
import api from '../../../api/axiosConfig';
import BackButton from '../../../components/common/BackButton';

const AdminCouponCreate = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: '',
        minPurchaseAmount: '0',
        maxDiscountAmount: '',
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: '',
        usageLimit: '',
        perUserLimit: '1',
        isActive: true,
        applicableProducts: [],
        applicableCategories: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProductsAndCategories();
    }, []);

    const fetchProductsAndCategories = async () => {
        try {
            const [productsRes, categoriesRes] = await Promise.all([
                api.post('/products/filter', { limit: 100 }),
                api.get('/categories')
            ]);
            setProducts(productsRes.data.products || []);
            setCategories(categoriesRes.data.categories || categoriesRes.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleMultiSelect = (e, field) => {
        const options = Array.from(e.target.selectedOptions, option => option.value);
        setFormData(prev => ({ ...prev, [field]: options }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.code || formData.code.trim() === '') {
            setError('Coupon code is required');
            return;
        }

        if (!formData.description || formData.description.trim() === '') {
            setError('Description is required');
            return;
        }

        if (!formData.discountValue || parseFloat(formData.discountValue) <= 0) {
            setError('Discount value must be greater than 0');
            return;
        }

        if (formData.discountType === 'percentage' && parseFloat(formData.discountValue) > 100) {
            setError('Percentage discount cannot exceed 100%');
            return;
        }

        if (!formData.validUntil) {
            setError('Valid until date is required');
            return;
        }

        const validUntilDate = new Date(formData.validUntil);
        const validFromDate = new Date(formData.validFrom);
        if (validUntilDate <= validFromDate) {
            setError('Valid until date must be after valid from date');
            return;
        }

        setLoading(true);

        try {
            const payload = {
                code: formData.code.toUpperCase().trim(),
                description: formData.description.trim(),
                discountType: formData.discountType,
                discountValue: parseFloat(formData.discountValue),
                minPurchaseAmount: parseFloat(formData.minPurchaseAmount) || 0,
                maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : undefined,
                validFrom: new Date(formData.validFrom).toISOString(),
                validUntil: new Date(formData.validUntil).toISOString(),
                usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
                perUserLimit: parseInt(formData.perUserLimit) || 1,
                isActive: formData.isActive,
                applicableProducts: formData.applicableProducts,
                applicableCategories: formData.applicableCategories
            };

            const createPromise = createCoupon(payload);
            
            toast.promise(
                createPromise,
                {
                    loading: 'Creating coupon...',
                    success: (result) => `Coupon "${result.data.code}" created successfully!`,
                    error: 'Failed to create coupon',
                }
            );

            const result = await createPromise;
            
            if (result.success) {
                setTimeout(() => {
                    navigate('/admin/coupons', { state: { refresh: true } });
                }, 1000);
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create coupon. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <BackButton to="/admin/coupons" label="Back to Coupons" />
                
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-[#5c2d16]">Create New Coupon</h1>
                    <p className="text-gray-600 mt-2">Add a new discount coupon for your store</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Coupon Code <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                                placeholder="e.g., WELCOME10"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent uppercase"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">Will be auto-converted to uppercase</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Discount Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="discountType"
                                value={formData.discountType}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                            >
                                <option value="percentage">Percentage</option>
                                <option value="fixed">Fixed Amount</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="e.g., Get 10% off on your first order"
                            rows="2"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            required
                        />
                    </div>

                    {/* Discount Values */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Discount Value <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="discountValue"
                                value={formData.discountValue}
                                onChange={handleChange}
                                placeholder={formData.discountType === 'percentage' ? '10' : '100'}
                                min="0"
                                step="0.01"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {formData.discountType === 'percentage' ? 'Percentage (0-100)' : 'Amount in ₹'}
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Min Purchase Amount
                            </label>
                            <input
                                type="number"
                                name="minPurchaseAmount"
                                value={formData.minPurchaseAmount}
                                onChange={handleChange}
                                placeholder="0"
                                min="0"
                                step="0.01"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                            <p className="text-xs text-gray-500 mt-1">Minimum order value in ₹</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Max Discount (Optional)
                            </label>
                            <input
                                type="number"
                                name="maxDiscountAmount"
                                value={formData.maxDiscountAmount}
                                onChange={handleChange}
                                placeholder="No limit"
                                min="0"
                                step="0.01"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                            <p className="text-xs text-gray-500 mt-1">Max discount in ₹</p>
                        </div>
                    </div>

                    {/* Validity */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Valid From <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="validFrom"
                                value={formData.validFrom}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Valid Until <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="validUntil"
                                value={formData.validUntil}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                            />
                        </div>
                    </div>

                    {/* Usage Limits */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Total Usage Limit
                            </label>
                            <input
                                type="number"
                                name="usageLimit"
                                value={formData.usageLimit}
                                onChange={handleChange}
                                placeholder="Unlimited"
                                min="1"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                            <p className="text-xs text-gray-500 mt-1">Leave empty for unlimited</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Per User Limit <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="perUserLimit"
                                value={formData.perUserLimit}
                                onChange={handleChange}
                                placeholder="1"
                                min="1"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">Times each user can use</p>
                        </div>
                    </div>

                    {/* Applicable Products & Categories */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Applicable Products
                            </label>
                            <select
                                multiple
                                value={formData.applicableProducts}
                                onChange={(e) => handleMultiSelect(e, 'applicableProducts')}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent h-32"
                            >
                                {products.map(product => (
                                    <option key={product._id} value={product._id}>
                                        {product.name}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple. Leave empty for all products.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Applicable Categories
                            </label>
                            <select
                                multiple
                                value={formData.applicableCategories}
                                onChange={(e) => handleMultiSelect(e, 'applicableCategories')}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent h-32"
                            >
                                {categories.map(category => (
                                    <option key={category._id} value={category._id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple. Leave empty for all categories.</p>
                        </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={handleChange}
                            className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <label className="ml-2 text-sm font-medium text-gray-700">
                            Active (Users can claim this coupon)
                        </label>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating...' : 'Create Coupon'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/admin/coupons')}
                            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-semibold"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminCouponCreate;
