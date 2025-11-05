import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getProductById, updateProduct, getAllCategories } from '../../../services/adminService';
import api from '../../../api/axiosConfig';
import BackButton from '../../../components/common/BackButton';

const AdminProductEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
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
        ingredients: [],
        benefits: [],
        dosage: '',
        contraindications: [],
        shelfLife: '',
        storageInstructions: '',
        manufacturer: '',
        batchNumber: '',
        expiryDate: '',
        certification: [],
        origin: '',
        processingMethod: '',
        potency: '',
        formulation: '',
        ageGroup: [],
        gender: [],
        season: [],
        timeOfDay: [],
        faq: [],
        howToUse: [],
        howToStore: [],
        howToConsume: [],
        
        // Pack & Combo Options
        packOptions: [],
        freeProducts: [],
        bundleWith: [],
        offerText: '',
        isOnOffer: false,
        
        // Shipping Options
        freeShipping: false,
        shippingCost: 0,
        minOrderForFreeShipping: 0,
        
        // SEO fields
        metaTitle: '',
        metaDescription: '',
        keywords: []
    });

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [productResult, categoriesResult] = await Promise.all([
                getProductById(id),
                getAllCategories()
            ]);

            if (productResult.success) {
                const product = productResult.data;
                setFormData({
                    name: product.name || '',
                    description: product.description || '',
                    price: product.price || '',
                    discountPrice: product.discountPrice || '',
                    stock: product.stock !== undefined ? product.stock : '',
                    category: product.category?._id || product.category || '',
                    images: product.images?.length ? product.images : [''],
                    attributes: product.attributes || {},
                    isActive: product.isActive !== undefined ? product.isActive : true,
                    
                    ingredients: product.ingredients?.length ? product.ingredients : [{ image: '', name: '', description: '' }],
                    benefits: product.benefits?.length ? product.benefits : [{ image: '', name: '', description: '' }],
                    dosage: product.dosage || '',
                    contraindications: product.contraindications?.length ? product.contraindications : [{ image: '', name: '', description: '' }],
                    shelfLife: product.shelfLife || '',
                    storageInstructions: product.storageInstructions || '',
                    manufacturer: product.manufacturer || '',
                    batchNumber: product.batchNumber || '',
                    expiryDate: product.expiryDate ? product.expiryDate.split('T')[0] : '',
                    certification: product.certification?.length ? product.certification : [{ image: '', name: '', description: '' }],
                    origin: product.origin || '',
                    processingMethod: product.processingMethod || '',
                    potency: product.potency || '',
                    formulation: product.formulation || '',
                    ageGroup: product.ageGroup || [],
                    gender: product.gender || [],
                    season: product.season || [],
                    timeOfDay: product.timeOfDay || [],
                    faq: product.faq?.length ? product.faq : [{ question: '', answer: '' }],
                    howToUse: product.howToUse?.length ? product.howToUse : [{ image: '', name: '', description: '' }],
                    howToStore: product.howToStore?.length ? product.howToStore : [{ image: '', name: '', description: '' }],
                    howToConsume: product.howToConsume?.length ? product.howToConsume : [{ image: '', name: '', description: '' }],
                    
                    // Pack & Combo Options
                    packOptions: product.packOptions?.length ? product.packOptions : [{ packSize: '', packPrice: '', savingsPercent: '', label: '', image: '' }],
                    freeProducts: product.freeProducts?.length ? product.freeProducts : [{ product: '', minQuantity: '', quantity: '' }],
                    bundleWith: product.bundleWith?.length ? product.bundleWith : [{ product: '', bundlePrice: '', savingsAmount: '' }],
                    offerText: product.offerText || '',
                    isOnOffer: product.isOnOffer || false,
                    
                    // Shipping Options
                    freeShipping: product.freeShipping || false,
                    shippingCost: product.shippingCost !== undefined ? product.shippingCost : 0,
                    minOrderForFreeShipping: product.minOrderForFreeShipping !== undefined ? product.minOrderForFreeShipping : 0,
                    
                    metaTitle: product.metaTitle || '',
                    metaDescription: product.metaDescription || '',
                    keywords: product.keywords?.length ? product.keywords : ['']
                });
            } else {
                setError(productResult.message);
            }

            if (categoriesResult.success) {
                // Backend returns { categories: [...], total, page, pages }
                const categoriesData = categoriesResult.data.categories || categoriesResult.data;
                setCategories(Array.isArray(categoriesData) ? categoriesData : []);
            } else {
                setCategories([]);
                console.error('Failed to fetch categories:', categoriesResult.message);
            }
        } catch (err) {
            setError('Failed to fetch product details');
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
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
        setSaving(true);

        try {
            // Clean up data before submission - exclude slug (it's auto-generated from name)
            const { slug, ...formDataWithoutSlug } = formData;
            const submitData = {
                ...formDataWithoutSlug,
                price: Number(formData.price),
                discountPrice: formData.discountPrice ? Number(formData.discountPrice) : undefined,
                stock: Number(formData.stock),
                images: formData.images.filter(img => img.trim() !== ''),
                keywords: formData.keywords.filter(k => k && k.trim() !== ''),
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

            const updatePromise = updateProduct(id, submitData);
            
            toast.promise(
                updatePromise,
                {
                    loading: 'Updating product...',
                    success: 'Product updated successfully!',
                    error: 'Failed to update product',
                }
            );

            const result = await updatePromise;
            
            if (result.success) {
                setTimeout(() => navigate('/admin/products'), 1000);
            } else {
                // Handle validation errors from backend
                const errorMessage = result.message || 'Failed to update product';
                setError(errorMessage);
                // If it's a validation error with details, show them
                if (result.errors && Array.isArray(result.errors)) {
                    const errorDetails = result.errors.map(err => `${err.msg || err.message}`).join(', ');
                    setError(`${errorMessage}: ${errorDetails}`);
                }
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to update product. Please try again.';
            setError(errorMessage);
            // Handle validation errors
            if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
                const errorDetails = err.response.data.errors.map(err => `${err.msg || err.message}`).join(', ');
                setError(`${errorMessage}: ${errorDetails}`);
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <BackButton to="/admin/products" label="Back to Products" />
                
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-[#5c2d16]">Edit Product</h1>
                    <p className="text-gray-600 mt-2">Update product information</p>
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
                                    disabled={saving}
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
                                    disabled={saving}
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
                                        disabled={saving}
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
                                        disabled={saving}
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
                                        disabled={saving}
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
                                        disabled={saving}
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
                                            disabled={saving}
                                        />
                                        {formData.images.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeArrayItem('images', index)}
                                                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                                disabled={saving}
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
                                    disabled={saving}
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
                                            disabled={saving}
                                        />
                                        <input
                                            type="text"
                                            value={value}
                                            onChange={(e) => handleAttributeChange(key, e.target.value)}
                                            placeholder="Value (e.g., 500g)"
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                            disabled={saving}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeAttribute(key)}
                                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                            disabled={saving}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => handleAttributeChange(`attr_${Date.now()}`, '')}
                                    className="mt-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                    disabled={saving}
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
                                    onChange={handleChange}
                                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                    disabled={saving}
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
                                                disabled={saving}
                                            />
                                            <input
                                                type="text"
                                                value={ingredient.name}
                                                onChange={(e) => handleObjectArrayChange('ingredients', index, 'name', e.target.value)}
                                                placeholder="Ingredient Name"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                                disabled={saving}
                                            />
                                            <textarea
                                                value={ingredient.description}
                                                onChange={(e) => handleObjectArrayChange('ingredients', index, 'description', e.target.value)}
                                                placeholder="Description"
                                                rows="2"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                                disabled={saving}
                                            />
                                        </div>
                                        {formData.ingredients.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeArrayItem('ingredients', index)}
                                                className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                                                disabled={saving}
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
                                    disabled={saving}
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
                                                disabled={saving}
                                            />
                                            <input
                                                type="text"
                                                value={benefit.name}
                                                onChange={(e) => handleObjectArrayChange('benefits', index, 'name', e.target.value)}
                                                placeholder="Benefit Name"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                                disabled={saving}
                                            />
                                            <textarea
                                                value={benefit.description}
                                                onChange={(e) => handleObjectArrayChange('benefits', index, 'description', e.target.value)}
                                                placeholder="Description"
                                                rows="2"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                                disabled={saving}
                                            />
                                        </div>
                                        {formData.benefits.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeArrayItem('benefits', index)}
                                                className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                                                disabled={saving}
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
                                    disabled={saving}
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
                                    disabled={saving}
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
                                                disabled={saving}
                                            />
                                            <input
                                                type="text"
                                                value={item.name}
                                                onChange={(e) => handleObjectArrayChange('contraindications', index, 'name', e.target.value)}
                                                placeholder="Contraindication Name"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                                disabled={saving}
                                            />
                                            <textarea
                                                value={item.description}
                                                onChange={(e) => handleObjectArrayChange('contraindications', index, 'description', e.target.value)}
                                                placeholder="Description"
                                                rows="2"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                                disabled={saving}
                                            />
                                        </div>
                                        {formData.contraindications.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeArrayItem('contraindications', index)}
                                                className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                                                disabled={saving}
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
                                    disabled={saving}
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
                                        disabled={saving}
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
                                        disabled={saving}
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
                                        disabled={saving}
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
                                        disabled={saving}
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
                                                disabled={saving}
                                            />
                                            <input
                                                type="text"
                                                value={cert.name}
                                                onChange={(e) => handleObjectArrayChange('certification', index, 'name', e.target.value)}
                                                placeholder="Certification Name (e.g., FSSAI)"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                                disabled={saving}
                                            />
                                            <textarea
                                                value={cert.description}
                                                onChange={(e) => handleObjectArrayChange('certification', index, 'description', e.target.value)}
                                                placeholder="Description"
                                                rows="2"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                                disabled={saving}
                                            />
                                        </div>
                                        {formData.certification.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeArrayItem('certification', index)}
                                                className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                                                disabled={saving}
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
                                    disabled={saving}
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
                                        disabled={saving}
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
                                        disabled={saving}
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
                                        disabled={saving}
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
                                    disabled={saving}
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
                                    disabled={saving}
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
                                                disabled={saving}
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
                                                disabled={saving}
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
                                                disabled={saving}
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
                                                disabled={saving}
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
                                        disabled={saving}
                                    />
                                    <input
                                        type="text"
                                        value={item.name}
                                        onChange={(e) => handleObjectArrayChange('howToUse', index, 'name', e.target.value)}
                                        placeholder="Step Name"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                        disabled={saving}
                                    />
                                    <textarea
                                        value={item.description}
                                        onChange={(e) => handleObjectArrayChange('howToUse', index, 'description', e.target.value)}
                                        placeholder="Description"
                                        rows="2"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                        disabled={saving}
                                    />
                                </div>
                                {formData.howToUse.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeArrayItem('howToUse', index)}
                                        className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                                        disabled={saving}
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
                            disabled={saving}
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
                                        disabled={saving}
                                    />
                                    <input
                                        type="text"
                                        value={item.name}
                                        onChange={(e) => handleObjectArrayChange('howToStore', index, 'name', e.target.value)}
                                        placeholder="Storage Tip Name"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                        disabled={saving}
                                    />
                                    <textarea
                                        value={item.description}
                                        onChange={(e) => handleObjectArrayChange('howToStore', index, 'description', e.target.value)}
                                        placeholder="Description"
                                        rows="2"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                        disabled={saving}
                                    />
                                </div>
                                {formData.howToStore.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeArrayItem('howToStore', index)}
                                        className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                                        disabled={saving}
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
                            disabled={saving}
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
                                        disabled={saving}
                                    />
                                    <input
                                        type="text"
                                        value={item.name}
                                        onChange={(e) => handleObjectArrayChange('howToConsume', index, 'name', e.target.value)}
                                        placeholder="Consumption Method Name"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                        disabled={saving}
                                    />
                                    <textarea
                                        value={item.description}
                                        onChange={(e) => handleObjectArrayChange('howToConsume', index, 'description', e.target.value)}
                                        placeholder="Description"
                                        rows="2"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                        disabled={saving}
                                    />
                                </div>
                                {formData.howToConsume.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeArrayItem('howToConsume', index)}
                                        className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                                        disabled={saving}
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
                            disabled={saving}
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
                                        disabled={saving}
                                    />
                                    <textarea
                                        value={item.answer}
                                        onChange={(e) => handleObjectArrayChange('faq', index, 'answer', e.target.value)}
                                        placeholder="Answer"
                                        rows="2"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                        disabled={saving}
                                    />
                                </div>
                                {formData.faq.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeArrayItem('faq', index)}
                                        className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                                        disabled={saving}
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
                            disabled={saving}
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
                                            disabled={saving}
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
                                            disabled={saving}
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
                                            disabled={saving}
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
                                            disabled={saving}
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
                                                disabled={saving}
                                            />
                                            <label
                                                htmlFor={`pack-image-${index}`}
                                                className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer text-xs"
                                            >
                                                Upload
                                            </label>
                                            {pack.image && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleObjectArrayChange('packOptions', index, 'image', '')}
                                                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-xs"
                                                    disabled={saving}
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
                                            disabled={saving}
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
                                disabled={saving}
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
                                            disabled={saving}
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
                                            disabled={saving}
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
                                                disabled={saving}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeArrayItem('freeProducts', index)}
                                            className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 self-end"
                                            disabled={saving}
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
                                disabled={saving}
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
                                            disabled={saving}
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
                                            disabled={saving}
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
                                                disabled={saving}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeArrayItem('bundleWith', index)}
                                            className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 self-end"
                                            disabled={saving}
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
                                disabled={saving}
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
                                disabled={saving}
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
                                    disabled={saving}
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
                                    disabled={saving}
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
                                    disabled={saving}
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
                                    disabled={saving}
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
                                    disabled={saving}
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
                                    disabled={saving}
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
                                            disabled={saving}
                                        />
                                        {formData.keywords.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeArrayItem('keywords', index)}
                                                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                                disabled={saving}
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
                                    disabled={saving}
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
                            disabled={saving}
                            className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:bg-gray-400"
                        >
                            {saving ? 'Updating...' : 'Update Product'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/admin/products')}
                            disabled={saving}
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

export default AdminProductEdit;
