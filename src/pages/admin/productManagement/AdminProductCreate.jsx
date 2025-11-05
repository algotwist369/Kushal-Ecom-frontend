import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createProduct, getAllCategories } from '../../../services/adminService';
import api from '../../../api/axiosConfig';
import BackButton from '../../../components/common/BackButton';

const AdminProductCreate = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        // Basic fields
        name: '',
        description: '',
        price: '',
        discountPrice: '',
        stock: '',
        category: '',
        images: [''],
        attributes: {},
        isActive: true,

        // Ayurvedic-specific fields
        ingredients: [{ image: '', name: '', description: '' }],
        benefits: [{ image: '', name: '', description: '' }],
        dosage: '',
        contraindications: [{ image: '', name: '', description: '' }],
        shelfLife: '',
        storageInstructions: '',
        manufacturer: '',
        batchNumber: '',
        expiryDate: '',
        certification: [{ image: '', name: '', description: '' }],
        origin: '',
        processingMethod: '',
        potency: '',
        formulation: '',
        ageGroup: [],
        gender: [],
        season: [],
        timeOfDay: [],
        faq: [{ question: '', answer: '' }],
        howToUse: [{ image: '', name: '', description: '' }],
        howToStore: [{ image: '', name: '', description: '' }],
        howToConsume: [{ image: '', name: '', description: '' }],

        // Pack & Combo Options
        packOptions: [{ packSize: '', packPrice: '', savingsPercent: '', label: '', image: '' }],
        freeProducts: [{ product: '', minQuantity: '', quantity: '' }],
        bundleWith: [{ product: '', bundlePrice: '', savingsAmount: '' }],
        offerText: '',
        isOnOffer: false,

        // Shipping Options
        freeShipping: false,
        shippingCost: 0,
        minOrderForFreeShipping: 0,

        // SEO fields
        metaTitle: '',
        metaDescription: '',
        keywords: ['']
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        const result = await getAllCategories();
        if (result.success) {
            // Backend returns { categories: [...], total, page, pages }
            const categoriesData = result.data.categories || result.data;
            setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        } else {
            setCategories([]);
            toast.error('Failed to fetch categories');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleArrayChange = (field, index, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].map((item, i) => i === index ? value : item)
        }));
    };

    const handleObjectArrayChange = (field, index, key, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].map((item, i) =>
                i === index ? { ...item, [key]: value } : item
            )
        }));
    };

    const addArrayItem = (field, defaultValue = '') => {
        setFormData(prev => ({
            ...prev,
            [field]: [...prev[field], defaultValue]
        }));
    };

    const addObjectArrayItem = (field, defaultValue) => {
        setFormData(prev => ({
            ...prev,
            [field]: [...prev[field], defaultValue]
        }));
    };

    const handlePackOptionImageUpload = async (packIndex, file) => {
        if (!file) return;
        
        try {
            const formData = new FormData();
            formData.append('packOptionImages', file);
            
            const response = await api.post('/upload/products/pack-options', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (response.data.images && response.data.images.length > 0) {
                handleObjectArrayChange('packOptions', packIndex, 'image', response.data.images[0]);
                toast.success('Pack option image uploaded successfully');
            }
        } catch (error) {
            console.error('Error uploading pack option image:', error);
            toast.error('Failed to upload pack option image');
        }
    };

    const removeArrayItem = (field, index) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    const handleMultiSelect = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].includes(value)
                ? prev[field].filter(v => v !== value)
                : [...prev[field], value]
        }));
    };

    const handleAttributeChange = (key, value) => {
        setFormData(prev => ({
            ...prev,
            attributes: {
                ...prev.attributes,
                [key]: value
            }
        }));
    };

    const removeAttribute = (key) => {
        setFormData(prev => {
            const newAttributes = { ...prev.attributes };
            delete newAttributes[key];
            return {
                ...prev,
                attributes: newAttributes
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Clean up data before submission
            // Note: slug is auto-generated from name on the backend, so we don't include it here
            const submitData = {
                ...formData,
                price: Number(formData.price),
                discountPrice: formData.discountPrice ? Number(formData.discountPrice) : undefined,
                stock: Number(formData.stock),
                images: formData.images.filter(img => img.trim() !== ''),
                keywords: formData.keywords.filter(k => k.trim() !== ''),
                ingredients: formData.ingredients.filter(i => i.name || i.description),
                benefits: formData.benefits.filter(b => b.name || b.description),
                contraindications: formData.contraindications.filter(c => c.name || c.description),
                certification: formData.certification.filter(c => c.name || c.description),
                howToUse: formData.howToUse.filter(h => h.name || h.description),
                howToStore: formData.howToStore.filter(h => h.name || h.description),
                howToConsume: formData.howToConsume.filter(h => h.name || h.description),
                faq: formData.faq.filter(f => f.question && f.answer),
                packOptions: formData.packOptions.filter(p => p.packSize && p.packPrice).map(p => ({
                    ...p,
                    packSize: Number(p.packSize),
                    packPrice: Number(p.packPrice),
                    savingsPercent: p.savingsPercent ? Number(p.savingsPercent) : undefined
                })),
                freeProducts: formData.freeProducts.filter(f => f.product && f.minQuantity && f.quantity).map(f => ({
                    product: f.product,
                    minQuantity: Number(f.minQuantity),
                    quantity: Number(f.quantity)
                })),
                bundleWith: formData.bundleWith.filter(b => b.product && b.bundlePrice).map(b => ({
                    product: b.product,
                    bundlePrice: Number(b.bundlePrice),
                    savingsAmount: b.savingsAmount ? Number(b.savingsAmount) : undefined
                }))
            };

            const createPromise = createProduct(submitData);

            toast.promise(
                createPromise,
                {
                    loading: 'Creating product...',
                    success: 'Product created successfully!',
                    error: 'Failed to create product',
                }
            );

            const result = await createPromise;

            if (result.success) {
                setTimeout(() => navigate('/admin/products'), 1000);
            } else {
                // Handle validation errors from backend
                const errorMessage = result.message || 'Failed to create product';
                setError(errorMessage);
                // If it's a validation error with details, show them
                if (result.errors && Array.isArray(result.errors)) {
                    const errorDetails = result.errors.map(err => `${err.msg || err.message}`).join(', ');
                    setError(`${errorMessage}: ${errorDetails}`);
                }
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to create product. Please try again.';
            setError(errorMessage);
            // Handle validation errors
            if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
                const errorDetails = err.response.data.errors.map(err => `${err.msg || err.message}`).join(', ');
                setError(`${errorMessage}: ${errorDetails}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <BackButton to="/admin/products" label="Back to Products" />

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-[#5c2d16]">Create New Product</h1>
                    <p className="text-gray-600 mt-2">Add a new product to your store</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Basic Information</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Product Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g., Kapiva Dia Free Juice 1L"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Enter product description..."
                                    rows="4"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    disabled={loading}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Price (₹) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        placeholder="999"
                                        min="0"
                                        step="0.01"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Discount Price (₹)
                                    </label>
                                    <input
                                        type="number"
                                        name="discountPrice"
                                        value={formData.discountPrice}
                                        onChange={handleChange}
                                        placeholder="799"
                                        min="0"
                                        step="0.01"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Stock <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="stock"
                                        value={formData.stock}
                                        onChange={handleChange}
                                        placeholder="100"
                                        min="0"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                        required
                                        disabled={loading}
                                    >
                                        <option value="">Select Category</option>
                                        {Array.isArray(categories) && categories.map(cat => (
                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Images */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Product Images
                                </label>
                                {formData.images.map((img, index) => (
                                    <div key={index} className="flex gap-2 mb-2">
                                        <input
                                            type="url"
                                            value={img}
                                            onChange={(e) => handleArrayChange('images', index, e.target.value)}
                                            placeholder="https://example.com/image.jpg"
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                            disabled={loading}
                                        />
                                        {formData.images.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeArrayItem('images', index)}
                                                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                                disabled={loading}
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => addArrayItem('images', '')}
                                    className="mt-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                    disabled={loading}
                                >
                                    + Add Image
                                </button>
                            </div>

                            {/* Attributes (Map) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Product Attributes (Key-Value Pairs)
                                </label>
                                <p className="text-xs text-gray-500 mb-2">Add custom attributes like size, color, weight, etc.</p>
                                {Object.entries(formData.attributes).map(([key, value], index) => (
                                    <div key={index} className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={key}
                                            onChange={(e) => {
                                                const newKey = e.target.value;
                                                const oldValue = formData.attributes[key];
                                                removeAttribute(key);
                                                if (newKey) handleAttributeChange(newKey, oldValue);
                                            }}
                                            placeholder="Attribute name (e.g., weight)"
                                            className="w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                            disabled={loading}
                                        />
                                        <input
                                            type="text"
                                            value={value}
                                            onChange={(e) => handleAttributeChange(key, e.target.value)}
                                            placeholder="Value (e.g., 500g)"
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                            disabled={loading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeAttribute(key)}
                                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                            disabled={loading}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => handleAttributeChange(`attr_${Date.now()}`, '')}
                                    className="mt-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                    disabled={loading}
                                >
                                    + Add Attribute
                                </button>
                            </div>

                            {/* Active Status */}
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                    disabled={loading}
                                />
                                <label className="ml-2 block text-sm text-gray-700">
                                    Active (Show in store)
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Ayurvedic Details */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Ayurvedic Details</h2>

                        <div className="space-y-4">
                            {/* Ingredients */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ingredients
                                </label>
                                {formData.ingredients.map((ingredient, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4 mb-3">
                                        <div className="grid grid-cols-1 gap-3">
                                            <input
                                                type="url"
                                                value={ingredient.image}
                                                onChange={(e) => handleObjectArrayChange('ingredients', index, 'image', e.target.value)}
                                                placeholder="Image URL"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                                disabled={loading}
                                            />
                                            <input
                                                type="text"
                                                value={ingredient.name}
                                                onChange={(e) => handleObjectArrayChange('ingredients', index, 'name', e.target.value)}
                                                placeholder="Ingredient Name"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                                disabled={loading}
                                            />
                                            <textarea
                                                value={ingredient.description}
                                                onChange={(e) => handleObjectArrayChange('ingredients', index, 'description', e.target.value)}
                                                placeholder="Description"
                                                rows="2"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                                disabled={loading}
                                            />
                                        </div>
                                        {formData.ingredients.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeArrayItem('ingredients', index)}
                                                className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                                                disabled={loading}
                                            >
                                                Remove Ingredient
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => addObjectArrayItem('ingredients', { image: '', name: '', description: '' })}
                                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                    disabled={loading}
                                >
                                    + Add Ingredient
                                </button>
                            </div>

                            {/* Benefits */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Benefits
                                </label>
                                {formData.benefits.map((benefit, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4 mb-3">
                                        <div className="grid grid-cols-1 gap-3">
                                            <input
                                                type="url"
                                                value={benefit.image}
                                                onChange={(e) => handleObjectArrayChange('benefits', index, 'image', e.target.value)}
                                                placeholder="Image URL"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                                disabled={loading}
                                            />
                                            <input
                                                type="text"
                                                value={benefit.name}
                                                onChange={(e) => handleObjectArrayChange('benefits', index, 'name', e.target.value)}
                                                placeholder="Benefit Name"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                                disabled={loading}
                                            />
                                            <textarea
                                                value={benefit.description}
                                                onChange={(e) => handleObjectArrayChange('benefits', index, 'description', e.target.value)}
                                                placeholder="Description"
                                                rows="2"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                                disabled={loading}
                                            />
                                        </div>
                                        {formData.benefits.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeArrayItem('benefits', index)}
                                                className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                                                disabled={loading}
                                            >
                                                Remove Benefit
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => addObjectArrayItem('benefits', { image: '', name: '', description: '' })}
                                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                    disabled={loading}
                                >
                                    + Add Benefit
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Dosage
                                </label>
                                <input
                                    type="text"
                                    name="dosage"
                                    value={formData.dosage}
                                    onChange={handleChange}
                                    placeholder="e.g., 30ml twice daily after meals"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    disabled={loading}
                                />
                            </div>

                            {/* Contraindications */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Contraindications
                                </label>
                                {formData.contraindications.map((item, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4 mb-3">
                                        <div className="grid grid-cols-1 gap-3">
                                            <input
                                                type="url"
                                                value={item.image}
                                                onChange={(e) => handleObjectArrayChange('contraindications', index, 'image', e.target.value)}
                                                placeholder="Image URL"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                                disabled={loading}
                                            />
                                            <input
                                                type="text"
                                                value={item.name}
                                                onChange={(e) => handleObjectArrayChange('contraindications', index, 'name', e.target.value)}
                                                placeholder="Contraindication Name"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                                disabled={loading}
                                            />
                                            <textarea
                                                value={item.description}
                                                onChange={(e) => handleObjectArrayChange('contraindications', index, 'description', e.target.value)}
                                                placeholder="Description"
                                                rows="2"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                                disabled={loading}
                                            />
                                        </div>
                                        {formData.contraindications.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeArrayItem('contraindications', index)}
                                                className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                                                disabled={loading}
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => addObjectArrayItem('contraindications', { image: '', name: '', description: '' })}
                                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                    disabled={loading}
                                >
                                    + Add Contraindication
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Manufacturer
                                    </label>
                                    <input
                                        type="text"
                                        name="manufacturer"
                                        value={formData.manufacturer}
                                        onChange={handleChange}
                                        placeholder="Manufacturer name"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Batch Number
                                    </label>
                                    <input
                                        type="text"
                                        name="batchNumber"
                                        value={formData.batchNumber}
                                        onChange={handleChange}
                                        placeholder="BATCH123"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Expiry Date
                                    </label>
                                    <input
                                        type="date"
                                        name="expiryDate"
                                        value={formData.expiryDate}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Origin
                                    </label>
                                    <input
                                        type="text"
                                        name="origin"
                                        value={formData.origin}
                                        onChange={handleChange}
                                        placeholder="Country/Region"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {/* Certification */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Certifications (FSSAI, ISO, etc.)
                                </label>
                                {formData.certification.map((cert, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4 mb-3">
                                        <div className="grid grid-cols-1 gap-3">
                                            <input
                                                type="url"
                                                value={cert.image}
                                                onChange={(e) => handleObjectArrayChange('certification', index, 'image', e.target.value)}
                                                placeholder="Certificate Image URL"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                                disabled={loading}
                                            />
                                            <input
                                                type="text"
                                                value={cert.name}
                                                onChange={(e) => handleObjectArrayChange('certification', index, 'name', e.target.value)}
                                                placeholder="Certification Name (e.g., FSSAI)"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                                disabled={loading}
                                            />
                                            <textarea
                                                value={cert.description}
                                                onChange={(e) => handleObjectArrayChange('certification', index, 'description', e.target.value)}
                                                placeholder="Description"
                                                rows="2"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                                disabled={loading}
                                            />
                                        </div>
                                        {formData.certification.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeArrayItem('certification', index)}
                                                className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                                                disabled={loading}
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => addObjectArrayItem('certification', { image: '', name: '', description: '' })}
                                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                    disabled={loading}
                                >
                                    + Add Certification
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Shelf Life
                                    </label>
                                    <input
                                        type="text"
                                        name="shelfLife"
                                        value={formData.shelfLife}
                                        onChange={handleChange}
                                        placeholder="12 months"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Formulation
                                    </label>
                                    <input
                                        type="text"
                                        name="formulation"
                                        value={formData.formulation}
                                        onChange={handleChange}
                                        placeholder="e.g., Juice, Powder, Oil"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Potency
                                    </label>
                                    <select
                                        name="potency"
                                        value={formData.potency}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                        disabled={loading}
                                    >
                                        <option value="">Select Potency</option>
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Processing Method
                                </label>
                                <input
                                    type="text"
                                    name="processingMethod"
                                    value={formData.processingMethod}
                                    onChange={handleChange}
                                    placeholder="e.g., Traditional, Modern"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Storage Instructions
                                </label>
                                <textarea
                                    name="storageInstructions"
                                    value={formData.storageInstructions}
                                    onChange={handleChange}
                                    placeholder="Store in a cool, dry place..."
                                    rows="2"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    disabled={loading}
                                />
                            </div>

                            {/* Age Group */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Age Group (Select Multiple)
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {['Child', 'Adult', 'Senior', 'All Ages'].map(age => (
                                        <label key={age} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={formData.ageGroup.includes(age)}
                                                onChange={() => handleMultiSelect('ageGroup', age)}
                                                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                                disabled={loading}
                                            />
                                            <span className="text-sm">{age}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Gender */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Gender (Select Multiple)
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {['Male', 'Female', 'Unisex'].map(g => (
                                        <label key={g} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={formData.gender.includes(g)}
                                                onChange={() => handleMultiSelect('gender', g)}
                                                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                                disabled={loading}
                                            />
                                            <span className="text-sm">{g}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Season */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Season (Select Multiple)
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {['Summer', 'Winter', 'Monsoon', 'All Season'].map(s => (
                                        <label key={s} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={formData.season.includes(s)}
                                                onChange={() => handleMultiSelect('season', s)}
                                                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                                disabled={loading}
                                            />
                                            <span className="text-sm">{s}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Time of Day */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Time of Day (Select Multiple)
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {['Morning', 'Afternoon', 'Evening', 'Night', 'Anytime'].map(t => (
                                        <label key={t} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={formData.timeOfDay.includes(t)}
                                                onChange={() => handleMultiSelect('timeOfDay', t)}
                                                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                                disabled={loading}
                                            />
                                            <span className="text-sm">{t}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* How To Use */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800">How To Use</h2>
                        {formData.howToUse.map((item, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4 mb-3">
                                <div className="grid grid-cols-1 gap-3">
                                    <input
                                        type="url"
                                        value={item.image}
                                        onChange={(e) => handleObjectArrayChange('howToUse', index, 'image', e.target.value)}
                                        placeholder="Image URL"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                        disabled={loading}
                                    />
                                    <input
                                        type="text"
                                        value={item.name}
                                        onChange={(e) => handleObjectArrayChange('howToUse', index, 'name', e.target.value)}
                                        placeholder="Step Name"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                        disabled={loading}
                                    />
                                    <textarea
                                        value={item.description}
                                        onChange={(e) => handleObjectArrayChange('howToUse', index, 'description', e.target.value)}
                                        placeholder="Description"
                                        rows="2"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                        disabled={loading}
                                    />
                                </div>
                                {formData.howToUse.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeArrayItem('howToUse', index)}
                                        className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                                        disabled={loading}
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => addObjectArrayItem('howToUse', { image: '', name: '', description: '' })}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                            disabled={loading}
                        >
                            + Add Step
                        </button>
                    </div>

                    {/* How To Store */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800">How To Store</h2>
                        {formData.howToStore.map((item, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4 mb-3">
                                <div className="grid grid-cols-1 gap-3">
                                    <input
                                        type="url"
                                        value={item.image}
                                        onChange={(e) => handleObjectArrayChange('howToStore', index, 'image', e.target.value)}
                                        placeholder="Image URL"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                        disabled={loading}
                                    />
                                    <input
                                        type="text"
                                        value={item.name}
                                        onChange={(e) => handleObjectArrayChange('howToStore', index, 'name', e.target.value)}
                                        placeholder="Storage Tip Name"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                        disabled={loading}
                                    />
                                    <textarea
                                        value={item.description}
                                        onChange={(e) => handleObjectArrayChange('howToStore', index, 'description', e.target.value)}
                                        placeholder="Description"
                                        rows="2"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                        disabled={loading}
                                    />
                                </div>
                                {formData.howToStore.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeArrayItem('howToStore', index)}
                                        className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                                        disabled={loading}
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => addObjectArrayItem('howToStore', { image: '', name: '', description: '' })}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                            disabled={loading}
                        >
                            + Add Storage Tip
                        </button>
                    </div>

                    {/* How To Consume */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800">How To Consume</h2>
                        {formData.howToConsume.map((item, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4 mb-3">
                                <div className="grid grid-cols-1 gap-3">
                                    <input
                                        type="url"
                                        value={item.image}
                                        onChange={(e) => handleObjectArrayChange('howToConsume', index, 'image', e.target.value)}
                                        placeholder="Image URL"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                        disabled={loading}
                                    />
                                    <input
                                        type="text"
                                        value={item.name}
                                        onChange={(e) => handleObjectArrayChange('howToConsume', index, 'name', e.target.value)}
                                        placeholder="Consumption Method Name"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                        disabled={loading}
                                    />
                                    <textarea
                                        value={item.description}
                                        onChange={(e) => handleObjectArrayChange('howToConsume', index, 'description', e.target.value)}
                                        placeholder="Description"
                                        rows="2"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                        disabled={loading}
                                    />
                                </div>
                                {formData.howToConsume.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeArrayItem('howToConsume', index)}
                                        className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                                        disabled={loading}
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => addObjectArrayItem('howToConsume', { image: '', name: '', description: '' })}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                            disabled={loading}
                        >
                            + Add Consumption Method
                        </button>
                    </div>

                    {/* FAQ */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800">FAQ</h2>
                        {formData.faq.map((item, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4 mb-3">
                                <div className="grid grid-cols-1 gap-3">
                                    <input
                                        type="text"
                                        value={item.question}
                                        onChange={(e) => handleObjectArrayChange('faq', index, 'question', e.target.value)}
                                        placeholder="Question"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                        disabled={loading}
                                    />
                                    <textarea
                                        value={item.answer}
                                        onChange={(e) => handleObjectArrayChange('faq', index, 'answer', e.target.value)}
                                        placeholder="Answer"
                                        rows="2"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                        disabled={loading}
                                    />
                                </div>
                                {formData.faq.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeArrayItem('faq', index)}
                                        className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                                        disabled={loading}
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => addObjectArrayItem('faq', { question: '', answer: '' })}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                            disabled={loading}
                        >
                            + Add FAQ
                        </button>
                    </div>

                    {/* Pack & Combo Options */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Pack & Combo Options</h2>

                        {/* Pack Options */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Pack Options
                            </label>
                            <p className="text-xs text-gray-500 mb-3">Offer multi-pack deals with special pricing</p>
                            {formData.packOptions.map((pack, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Pack Size *</label>
                                        <input
                                            type="number"
                                            placeholder="e.g., 2"
                                            value={pack.packSize}
                                            onChange={(e) => handleObjectArrayChange('packOptions', index, 'packSize', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                            disabled={loading}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Pack Price (₹) *</label>
                                        <input
                                            type="number"
                                            placeholder="e.g., 1398"
                                            value={pack.packPrice}
                                            onChange={(e) => handleObjectArrayChange('packOptions', index, 'packPrice', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                            disabled={loading}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Savings %</label>
                                        <input
                                            type="number"
                                            placeholder="e.g., 10"
                                            value={pack.savingsPercent}
                                            onChange={(e) => handleObjectArrayChange('packOptions', index, 'savingsPercent', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                            disabled={loading}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Label</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Family Pack"
                                            value={pack.label}
                                            onChange={(e) => handleObjectArrayChange('packOptions', index, 'label', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="block text-xs text-gray-600 mb-1">Pack Image</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handlePackOptionImageUpload(index, e.target.files[0])}
                                                className="hidden"
                                                id={`pack-image-${index}`}
                                                disabled={loading}
                                            />
                                            <label
                                                htmlFor={`pack-image-${index}`}
                                                className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 cursor-pointer text-xs"
                                            >
                                                Upload
                                            </label>
                                            {pack.image && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleObjectArrayChange('packOptions', index, 'image', '')}
                                                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-xs"
                                                    disabled={loading}
                                                >
                                                    Clear
                                                </button>
                                            )}
                                        </div>
                                        {pack.image && (
                                            <div className="mt-2">
                                                <img
                                                    src={pack.image}
                                                    alt="Pack preview"
                                                    className="w-16 h-16 object-cover rounded border"
                                                />
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => removeArrayItem('packOptions', index)}
                                            className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-xs"
                                            disabled={loading}
                                        >
                                            Remove Pack
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => addObjectArrayItem('packOptions', { packSize: '', packPrice: '', savingsPercent: '', label: '', image: '' })}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                disabled={loading}
                            >
                                + Add Pack Option
                            </button>
                        </div>

                        {/* Free Products */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Free Products (Buy X Get Y Free)
                            </label>
                            <p className="text-xs text-gray-500 mb-3">Offer free products when customers buy a certain quantity</p>
                            {formData.freeProducts.map((item, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Free Product ID</label>
                                        <input
                                            type="text"
                                            placeholder="Product ID"
                                            value={item.product}
                                            onChange={(e) => handleObjectArrayChange('freeProducts', index, 'product', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                            disabled={loading}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Min Quantity to Buy</label>
                                        <input
                                            type="number"
                                            placeholder="e.g., 2"
                                            value={item.minQuantity}
                                            onChange={(e) => handleObjectArrayChange('freeProducts', index, 'minQuantity', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <label className="block text-xs text-gray-600 mb-1">Free Quantity</label>
                                            <input
                                                type="number"
                                                placeholder="e.g., 1"
                                                value={item.quantity}
                                                onChange={(e) => handleObjectArrayChange('freeProducts', index, 'quantity', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                                disabled={loading}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeArrayItem('freeProducts', index)}
                                            className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 self-end"
                                            disabled={loading}
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => addObjectArrayItem('freeProducts', { product: '', minQuantity: '', quantity: '' })}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                disabled={loading}
                            >
                                + Add Free Product
                            </button>
                        </div>

                        {/* Bundle With */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Bundle With Other Products
                            </label>
                            <p className="text-xs text-gray-500 mb-3">Create bundle deals with other products</p>
                            {formData.bundleWith.map((item, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Bundle Product ID</label>
                                        <input
                                            type="text"
                                            placeholder="Product ID"
                                            value={item.product}
                                            onChange={(e) => handleObjectArrayChange('bundleWith', index, 'product', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                            disabled={loading}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Bundle Price (₹)</label>
                                        <input
                                            type="number"
                                            placeholder="e.g., 1499"
                                            value={item.bundlePrice}
                                            onChange={(e) => handleObjectArrayChange('bundleWith', index, 'bundlePrice', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <label className="block text-xs text-gray-600 mb-1">Savings (₹)</label>
                                            <input
                                                type="number"
                                                placeholder="e.g., 200"
                                                value={item.savingsAmount}
                                                onChange={(e) => handleObjectArrayChange('bundleWith', index, 'savingsAmount', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                                disabled={loading}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeArrayItem('bundleWith', index)}
                                            className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 self-end"
                                            disabled={loading}
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => addObjectArrayItem('bundleWith', { product: '', bundlePrice: '', savingsAmount: '' })}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                disabled={loading}
                            >
                                + Add Bundle Option
                            </button>
                        </div>

                        {/* Offer Text */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Offer Text (e.g., "Buy 2 Get 1 Free")
                            </label>
                            <input
                                type="text"
                                name="offerText"
                                value={formData.offerText}
                                onChange={handleChange}
                                placeholder="Special offer text..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                disabled={loading}
                            />
                            {formData.offerText && formData.offerText.toLowerCase().includes('free shipping') && !formData.freeShipping && (
                                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-300 rounded text-sm text-yellow-800">
                                    <p className="font-medium">⚠️ Warning:</p>
                                    <p className="text-xs">You mentioned "Free Shipping" in the offer text but haven't enabled it below. Please enable "Free Shipping" in the Shipping Options section.</p>
                                </div>
                            )}
                        </div>

                        {/* Is On Offer */}
                        <div className="mb-6">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="isOnOffer"
                                    checked={formData.isOnOffer}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isOnOffer: e.target.checked }))}
                                    className="w-5 h-5"
                                    disabled={loading}
                                />
                                <span className="text-sm font-medium text-gray-700">Show as Special Offer</span>
                            </label>
                        </div>

                        <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded">
                            <p className="font-medium mb-2">📦 Pack & Combo Features:</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Create multi-pack options with special pricing</li>
                                <li>Display offer banners on product page</li>
                                <li>Show savings percentage automatically</li>
                            </ul>
                        </div>
                    </div>

                    {/* Shipping Options */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Shipping Options</h2>

                        {/* Free Shipping */}
                        <div className="mb-6">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="freeShipping"
                                    checked={formData.freeShipping}
                                    onChange={(e) => setFormData(prev => ({ ...prev, freeShipping: e.target.checked }))}
                                    className="w-5 h-5"
                                    disabled={loading}
                                />
                                <span className="text-sm font-medium text-gray-700">Free Shipping on this product</span>
                            </label>
                            <p className="text-xs text-gray-500 mt-1 ml-7">When enabled, no shipping charges will apply for this product</p>
                        </div>

                        {/* Custom Shipping Cost */}
                        {!formData.freeShipping && (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Custom Shipping Cost (₹)
                                </label>
                                <input
                                    type="number"
                                    name="shippingCost"
                                    value={formData.shippingCost}
                                    onChange={handleChange}
                                    placeholder="0 for default shipping"
                                    min="0"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    disabled={loading}
                                />
                                <p className="text-xs text-gray-500 mt-1">Leave 0 for default shipping rates</p>
                            </div>
                        )}

                        {/* Minimum Order for Free Shipping */}
                        {!formData.freeShipping && (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Free Shipping Above (₹)
                                </label>
                                <input
                                    type="number"
                                    name="minOrderForFreeShipping"
                                    value={formData.minOrderForFreeShipping}
                                    onChange={handleChange}
                                    placeholder="e.g., 499"
                                    min="0"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    disabled={loading}
                                />
                                <p className="text-xs text-gray-500 mt-1">Free shipping when cart value exceeds this amount (0 = no free shipping)</p>
                            </div>
                        )}

                        <div className="text-sm text-gray-600 bg-green-50 p-4 rounded border border-green-200">
                            <p className="font-medium mb-2">🚚 Shipping Features:</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Enable free shipping for specific products</li>
                                <li>Set custom shipping costs per product</li>
                                <li>Define minimum order value for free shipping</li>
                            </ul>
                        </div>
                    </div>

                    {/* SEO */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800">SEO Information</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Meta Title
                                </label>
                                <input
                                    type="text"
                                    name="metaTitle"
                                    value={formData.metaTitle}
                                    onChange={handleChange}
                                    placeholder="SEO title for search engines"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Meta Description
                                </label>
                                <textarea
                                    name="metaDescription"
                                    value={formData.metaDescription}
                                    onChange={handleChange}
                                    placeholder="SEO description..."
                                    rows="2"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    disabled={loading}
                                />
                            </div>

                            {/* Keywords */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Keywords
                                </label>
                                {formData.keywords.map((keyword, index) => (
                                    <div key={index} className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={keyword}
                                            onChange={(e) => handleArrayChange('keywords', index, e.target.value)}
                                            placeholder="Keyword"
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                            disabled={loading}
                                        />
                                        {formData.keywords.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeArrayItem('keywords', index)}
                                                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                                disabled={loading}
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => addArrayItem('keywords', '')}
                                    className="mt-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                    disabled={loading}
                                >
                                    + Add Keyword
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:bg-gray-400"
                        >
                            {loading ? 'Creating...' : 'Create Product'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/admin/products')}
                            disabled={loading}
                            className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminProductCreate;
