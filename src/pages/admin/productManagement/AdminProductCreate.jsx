import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createProduct, getAllCategories, getAllProducts } from '../../../services/adminService';
import BackButton from '../../../components/common/BackButton';
import api from '../../../api/axiosConfig';

const AGE_GROUP_OPTIONS = [
    { value: 'child', label: 'Child' },
    { value: 'teen', label: 'Teen' },
    { value: 'adult', label: 'Adult' },
    { value: 'senior', label: 'Senior' }
];

const SEASON_OPTIONS = [
    { value: 'summer', label: 'Summer' },
    { value: 'monsoon', label: 'Monsoon' },
    { value: 'winter', label: 'Winter' },
    { value: 'all', label: 'All Season' }
];

const TIME_OF_DAY_OPTIONS = [
    { value: 'morning', label: 'Morning' },
    { value: 'afternoon', label: 'Afternoon' },
    { value: 'evening', label: 'Evening' },
    { value: 'night', label: 'Night' },
    { value: 'anytime', label: 'Anytime' }
];

const GENDER_OPTIONS = [
    { value: '', label: 'Select Gender / Applicability' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'unisex', label: 'Unisex' }
];

const initialFormState = {
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    stock: '',
    category: '',
    images: [''],
    attributes: [{ key: '', value: '' }],
    isActive: true,
    // Ayurvedic-specific fields - object arrays for ingredients, benefits, etc.
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
    packOptions: [{ packSize: '', packPrice: '', savingsPercent: '', label: '', image: '' }],
    freeProducts: [{ product: '', minQuantity: '', quantity: '' }],
    bundleWith: [{ product: '', bundlePrice: '', savingsAmount: '' }],
    offerText: '',
    isOnOffer: false,
    freeShipping: false,
    shippingCost: 0,
    minOrderForFreeShipping: 0,
    metaTitle: '',
    metaDescription: '',
    keywords: ['']
};

const AdminProductCreate = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState(initialFormState);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [currentStep, setCurrentStep] = useState(0);
    
    // Refs to prevent duplicate API calls
    const fetchingRef = useRef(false);
    const fetchingProductsRef = useRef(false);
    const abortControllerRef = useRef(null);
    const abortProductsControllerRef = useRef(null);

    const fetchCategories = useCallback(async () => {
        if (fetchingRef.current) return;
        
        fetchingRef.current = true;
        abortControllerRef.current = new AbortController();
        
        try {
            const result = await getAllCategories();
            if (result.success) {
                const categoriesData = result.data.categories || result.data;
                setCategories(Array.isArray(categoriesData) ? categoriesData : []);
            } else {
                toast.error('Failed to fetch categories');
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                toast.error('Failed to fetch categories');
            }
        } finally {
            fetchingRef.current = false;
            abortControllerRef.current = null;
        }
    }, []);

    const fetchProducts = useCallback(async () => {
        if (fetchingProductsRef.current) return;
        
        fetchingProductsRef.current = true;
        abortProductsControllerRef.current = new AbortController();
        
        try {
            const result = await getAllProducts({ limit: 1000, isActive: true });
            if (result.success) {
                const productsData = result.data.products || result.data || [];
                setProducts(Array.isArray(productsData) ? productsData : []);
            } else {
                console.error('Failed to fetch products');
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Failed to fetch products:', err);
            }
        } finally {
            fetchingProductsRef.current = false;
            abortProductsControllerRef.current = null;
        }
    }, []);

    useEffect(() => {
        fetchCategories();
        fetchProducts();
        
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            if (abortProductsControllerRef.current) {
                abortProductsControllerRef.current.abort();
            }
        };
    }, [fetchCategories, fetchProducts]);

    const handleInputChange = useCallback((event) => {
        const { name, value, type, checked } = event.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    }, []);

    const updateListValue = useCallback((field, index, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: prev[field].map((item, i) => (i === index ? value : item))
        }));
    }, []);

    const addListItem = useCallback((field, defaultValue) => {
        setFormData((prev) => ({
            ...prev,
            [field]: [...prev[field], defaultValue]
        }));
    }, []);

    const removeListItem = useCallback((field, index) => {
        setFormData((prev) => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    }, []);

    const updateObjectList = useCallback((field, index, key, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: prev[field].map((item, i) => (i === index ? { ...item, [key]: value } : item))
        }));
    }, []);

    const addObjectListItem = useCallback((field, defaultValue) => {
        setFormData((prev) => ({
            ...prev,
            [field]: [...prev[field], defaultValue]
        }));
    }, []);

    const handleToggleListValue = useCallback((field, value) => {
        const normalized = value.toLowerCase();
        setFormData((prev) => ({
            ...prev,
            [field]: prev[field].includes(normalized)
                ? prev[field].filter((item) => item !== normalized)
                : [...prev[field], normalized]
        }));
    }, []);

    const handlePackOptionImageUpload = useCallback(async (packIndex, file) => {
        if (!file) return;
        
        try {
            const formData = new FormData();
            formData.append('packOptionImages', file);
            
            const response = await api.post('/upload/products/pack-options', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (response.data.images && response.data.images.length > 0) {
                updateObjectList('packOptions', packIndex, 'image', response.data.images[0]);
                toast.success('Pack option image uploaded successfully');
            }
        } catch (error) {
            console.error('Error uploading pack option image:', error);
            toast.error('Failed to upload pack option image');
        }
    }, [updateObjectList]);

    const attributePairs = useMemo(() => formData.attributes, [formData.attributes]);

    const handleSubmit = useCallback(async (event) => {
        event.preventDefault();
        setError('');

        // Get latest formData using functional update pattern
        let submitData;
        setFormData(prev => {
            if (!prev.price || Number(prev.price) <= 0) {
                toast.error('Price must be greater than zero.');
                return prev;
            }

            if (!prev.stock || Number(prev.stock) < 0) {
                toast.error('Stock must be zero or a positive number.');
                return prev;
            }

            const attributes = {};
            prev.attributes
                .filter(({ key, value }) => key.trim() && value.trim())
                .forEach(({ key, value }) => {
                    attributes[key.trim()] = value.trim();
                });

            const numericOrUndefined = (value) => {
                if (value === '' || value === null || value === undefined) return undefined;
                const parsed = Number(value);
                return Number.isNaN(parsed) ? undefined : parsed;
            };

            submitData = {
                name: prev.name.trim(),
                description: prev.description.trim() || undefined,
                price: Number(prev.price),
                discountPrice: numericOrUndefined(prev.discountPrice),
                stock: Number(prev.stock),
                category: prev.category,
                images: Array.isArray(prev.images) ? prev.images.map((image) => image.trim()).filter(Boolean) : [],
                attributes,
                isActive: prev.isActive,
                // Object arrays - send as-is after filtering empty objects
                ingredients: Array.isArray(prev.ingredients) ? prev.ingredients.filter(item => item && (item.name || item.image || item.description)) : [],
                benefits: Array.isArray(prev.benefits) ? prev.benefits.filter(item => item && (item.name || item.image || item.description)) : [],
                contraindications: Array.isArray(prev.contraindications) ? prev.contraindications.filter(item => item && (item.name || item.image || item.description)) : [],
                certification: Array.isArray(prev.certification) ? prev.certification.filter(item => item && (item.name || item.image || item.description)) : [],
                howToUse: Array.isArray(prev.howToUse) ? prev.howToUse.filter(item => item && (item.name || item.image || item.description)) : [],
                howToStore: Array.isArray(prev.howToStore) ? prev.howToStore.filter(item => item && (item.name || item.image || item.description)) : [],
                howToConsume: Array.isArray(prev.howToConsume) ? prev.howToConsume.filter(item => item && (item.name || item.image || item.description)) : [],
                // String fields - send as strings (empty string is valid)
                dosage: prev.dosage?.trim() || '',
                shelfLife: prev.shelfLife?.trim() || '',
                storageInstructions: prev.storageInstructions?.trim() || '',
                formulation: prev.formulation?.trim() || '',
                metaTitle: prev.metaTitle?.trim() || '',
                // Other string fields
                manufacturer: prev.manufacturer.trim() || undefined,
                batchNumber: prev.batchNumber.trim() || undefined,
                expiryDate: prev.expiryDate || undefined,
                origin: prev.origin.trim() || undefined,
                processingMethod: prev.processingMethod.trim() || undefined,
                potency: prev.potency.trim() || undefined,
                metaDescription: prev.metaDescription.trim() || undefined,
                // Array fields - send empty arrays if no values (controller handles empty arrays)
                ageGroup: Array.isArray(prev.ageGroup) ? prev.ageGroup : [],
                gender: Array.isArray(prev.gender) ? prev.gender : [],
                season: Array.isArray(prev.season) ? prev.season : [],
                timeOfDay: Array.isArray(prev.timeOfDay) ? prev.timeOfDay : [],
                faq: Array.isArray(prev.faq) ? prev.faq
                    .map(({ question, answer }) => ({ question: question.trim(), answer: answer.trim() }))
                    .filter(({ question, answer }) => question && answer) : [],
                keywords: Array.isArray(prev.keywords) ? prev.keywords.map((keyword) => keyword.trim()).filter(Boolean) : [],
                packOptions: Array.isArray(prev.packOptions) ? prev.packOptions
                    .filter(({ packSize, packPrice }) => packSize && packPrice)
                    .map(({ packSize, packPrice, savingsPercent, label, image }) => ({
                        packSize: Number(packSize),
                        packPrice: Number(packPrice),
                        savingsPercent: numericOrUndefined(savingsPercent),
                        label: label.trim() || undefined,
                        image: image?.trim() || undefined
                    })) : [],
                freeProducts: Array.isArray(prev.freeProducts) ? prev.freeProducts
                    .filter(({ product, minQuantity, quantity }) => product && minQuantity && quantity)
                    .map(({ product, minQuantity, quantity }) => ({
                        product: product.trim(),
                        minQuantity: Number(minQuantity),
                        quantity: Number(quantity)
                    })) : [],
                bundleWith: Array.isArray(prev.bundleWith) ? prev.bundleWith
                    .filter(({ product, bundlePrice }) => product && bundlePrice)
                    .map(({ product, bundlePrice, savingsAmount }) => ({
                        product: product.trim(),
                        bundlePrice: Number(bundlePrice),
                        savingsAmount: numericOrUndefined(savingsAmount)
                    })) : [],
                offerText: prev.offerText.trim() || undefined,
                isOnOffer: prev.isOnOffer,
                freeShipping: prev.freeShipping,
                shippingCost: prev.freeShipping ? 0 : numericOrUndefined(prev.shippingCost) || 0,
                minOrderForFreeShipping: prev.freeShipping ? 0 : numericOrUndefined(prev.minOrderForFreeShipping) || 0
            };
            return prev; // Return unchanged state
        });

        if (!submitData) return; // Validation failed

        setLoading(true);
        try {
            const response = await createProduct(submitData);
            if (response.success) {
                toast.success('Product created successfully!');
                setTimeout(() => navigate('/admin/products'), 600);
            } else {
                const message = response.message || 'Failed to create product';
                if (Array.isArray(response.errors) && response.errors.length) {
                    const details = response.errors.map((err) => err.msg || err.message).join(', ');
                    setError(`${message}: ${details}`);
                } else {
                    setError(message);
                }
                toast.error(message);
            }
        } catch (submitError) {
            const message = submitError.response?.data?.message || submitError.message || 'Failed to create product. Please try again.';
            if (Array.isArray(submitError.response?.data?.errors)) {
                const details = submitError.response.data.errors.map((err) => err.msg || err.message).join(', ');
                setError(`${message}: ${details}`);
            } else {
                setError(message);
            }
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    const goToStep = useCallback((step) => {
        setCurrentStep(step);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleNavigateBack = useCallback(() => {
        navigate('/admin/products');
    }, [navigate]);

    // Memoize static options
    const genderOptions = useMemo(() => GENDER_OPTIONS.filter(opt => opt.value !== ''), []);
    const categoryOptions = useMemo(() => categories, [categories]);
    const productOptions = useMemo(() => products, [products]);

    const sections = useMemo(() => [
        {
            id: 'basic',
            title: 'Basic Information',
            description: 'Core product details, pricing, inventory & media.',
            content: (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Product Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="e.g., Ashwagandha Vitality Capsules"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Enter product description"
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
                                onChange={handleInputChange}
                                min="0"
                                step="0.01"
                                placeholder="899"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                required
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Discount Price (₹)</label>
                            <input
                                type="number"
                                name="discountPrice"
                                value={formData.discountPrice}
                                onChange={handleInputChange}
                                min="0"
                                step="0.01"
                                placeholder="749"
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
                                onChange={handleInputChange}
                                min="0"
                                placeholder="120"
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
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                required
                                disabled={loading}
                            >
                                <option value="">Select Category</option>
                                {categoryOptions.map((category) => (
                                    <option key={category._id} value={category._id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
                        {formData.images.map((image, index) => (
                            <div key={index} className="flex gap-2 mb-2">
                                <input
                                    type="url"
                                    value={image}
                                    onChange={(event) => updateListValue('images', index, event.target.value)}
                                    placeholder="https://cdn.example.com/product.jpg"
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    disabled={loading}
                                />
                                {formData.images.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeListItem('images', index)}
                                        className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                        disabled={loading}
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => addListItem('images', '')}
                            className="mt-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                            disabled={loading}
                        >
                            + Add Image
                        </button>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Custom Attributes</label>
                        <p className="text-xs text-gray-500 mb-2">Add custom key/value pairs such as weight, flavour, dimensions, etc.</p>
                        {attributePairs.map((pair, index) => (
                            <div key={index} className="flex flex-col md:flex-row gap-2 mb-2">
                                <input
                                    type="text"
                                    value={pair.key}
                                    onChange={(event) => updateObjectList('attributes', index, 'key', event.target.value)}
                                    placeholder="Attribute (e.g., weight)"
                                    className="md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    disabled={loading}
                                />
                                <input
                                    type="text"
                                    value={pair.value}
                                    onChange={(event) => updateObjectList('attributes', index, 'value', event.target.value)}
                                    placeholder="Value (e.g., 500g)"
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => removeListItem('attributes', index)}
                                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                    disabled={loading}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => addListItem('attributes', { key: '', value: '' })}
                            className="mt-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                            disabled={loading}
                        >
                            + Add Attribute
                        </button>
                    </div>

                    <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                        <input
                            type="checkbox"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                            disabled={loading}
                        />
                        Active (show in store)
                    </label>
                </div>
            )
        },
        {
            id: 'ayurvedic',
            title: 'Ayurvedic & Product Details',
            description: 'Document ingredients, formulation, certifications and demographic targeting.',
            content: (
                <div className="space-y-4">
                    {/* Object Array Fields */}
                    {[
                        { label: 'Ingredients', name: 'ingredients' },
                        { label: 'Benefits', name: 'benefits' },
                        { label: 'Contraindications', name: 'contraindications' },
                        { label: 'Certification', name: 'certification' }
                    ].map(({ label, name }) => (
                        <div key={name}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                            {formData[name].map((item, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-3">
                                    <div className="grid grid-cols-1 gap-3">
                                        <input
                                            type="url"
                                            value={item.image || ''}
                                            onChange={(e) => updateObjectList(name, index, 'image', e.target.value)}
                                            placeholder="Image URL (optional)"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                            disabled={loading}
                                        />
                                        <input
                                            type="text"
                                            value={item.name || ''}
                                            onChange={(e) => updateObjectList(name, index, 'name', e.target.value)}
                                            placeholder={`${label.slice(0, -1)} name`}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                            disabled={loading}
                                        />
                                        <textarea
                                            value={item.description || ''}
                                            onChange={(e) => updateObjectList(name, index, 'description', e.target.value)}
                                            placeholder={`${label.slice(0, -1)} description`}
                                            rows="2"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                            disabled={loading}
                                        />
                                    </div>
                                    {formData[name].length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeListItem(name, index)}
                                            className="mt-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                            disabled={loading}
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => addObjectListItem(name, { image: '', name: '', description: '' })}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                disabled={loading}
                            >
                                + Add {label}
                            </button>
                        </div>
                    ))}

                    {/* String Fields */}
                    {[
                        { label: 'Dosage', name: 'dosage', placeholder: 'e.g., 30ml twice daily after meals' },
                        { label: 'Shelf Life', name: 'shelfLife', placeholder: 'e.g., 24 months' },
                        { label: 'Storage Instructions', name: 'storageInstructions', placeholder: 'e.g., Store in a cool, dry place' },
                        { label: 'Formulation', name: 'formulation', placeholder: 'e.g., Vegetarian capsule' }
                    ].map(({ label, name, placeholder }) => (
                        <div key={name}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                            <input
                                type="text"
                                name={name}
                                value={formData[name]}
                                onChange={handleInputChange}
                                placeholder={placeholder}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                disabled={loading}
                            />
                        </div>
                    ))}

                    {/* Other String Fields */}
                    {[
                        { label: 'Manufacturer', name: 'manufacturer', placeholder: 'Manufacturer name' },
                        { label: 'Batch Number', name: 'batchNumber', placeholder: 'e.g., BATCH123' },
                        { label: 'Origin', name: 'origin', placeholder: 'Country / region of origin' },
                        { label: 'Processing Method', name: 'processingMethod', placeholder: 'e.g., Standardized extraction' },
                        { label: 'Potency', name: 'potency', placeholder: 'e.g., 600 mg per capsule' }
                    ].map(({ label, name, placeholder }) => (
                        <div key={name}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                            <input
                                type="text"
                                name={name}
                                value={formData[name]}
                                onChange={handleInputChange}
                                placeholder={placeholder}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                disabled={loading}
                            />
                        </div>
                    ))}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                        <input
                            type="date"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Gender (select multiple)</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {genderOptions.map(({ value, label }) => (
                                <label key={value} className="flex items-center gap-2 text-sm text-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={formData.gender.includes(value)}
                                        onChange={() => handleToggleListValue('gender', value)}
                                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                        disabled={loading}
                                    />
                                    {label}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Age Group (select multiple)</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {AGE_GROUP_OPTIONS.map(({ value, label }) => (
                                <label key={value} className="flex items-center gap-2 text-sm text-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={formData.ageGroup.includes(value)}
                                        onChange={() => handleToggleListValue('ageGroup', value)}
                                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                        disabled={loading}
                                    />
                                    {label}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Season (select multiple)</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {SEASON_OPTIONS.map(({ value, label }) => (
                                <label key={value} className="flex items-center gap-2 text-sm text-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={formData.season.includes(value)}
                                        onChange={() => handleToggleListValue('season', value)}
                                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                        disabled={loading}
                                    />
                                    {label}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Time of Day (select multiple)</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {TIME_OF_DAY_OPTIONS.map(({ value, label }) => (
                                <label key={value} className="flex items-center gap-2 text-sm text-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={formData.timeOfDay.includes(value)}
                                        onChange={() => handleToggleListValue('timeOfDay', value)}
                                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                        disabled={loading}
                                    />
                                    {label}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'usage',
            title: 'Usage Guidance',
            description: 'Explain how customers should use, store, and consume the product.',
            content: (
                <div className="space-y-4">
                    {[
                        { name: 'howToUse', label: 'How to Use' },
                        { name: 'howToStore', label: 'How to Store' },
                        { name: 'howToConsume', label: 'How to Consume' }
                    ].map(({ name, label }) => (
                        <div key={name}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                            {formData[name].map((item, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-3">
                                    <div className="grid grid-cols-1 gap-3">
                                        <input
                                            type="url"
                                            value={item.image || ''}
                                            onChange={(e) => updateObjectList(name, index, 'image', e.target.value)}
                                            placeholder="Image URL (optional)"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                            disabled={loading}
                                        />
                                        <input
                                            type="text"
                                            value={item.name || ''}
                                            onChange={(e) => updateObjectList(name, index, 'name', e.target.value)}
                                            placeholder={`${label} name`}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                            disabled={loading}
                                        />
                                        <textarea
                                            value={item.description || ''}
                                            onChange={(e) => updateObjectList(name, index, 'description', e.target.value)}
                                            placeholder={`${label} description`}
                                            rows="2"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                            disabled={loading}
                                        />
                                    </div>
                                    {formData[name].length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeListItem(name, index)}
                                            className="mt-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                            disabled={loading}
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => addObjectListItem(name, { image: '', name: '', description: '' })}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                disabled={loading}
                            >
                                + Add {label}
                            </button>
                        </div>
                    ))}
                </div>
            )
        },
        {
            id: 'faq',
            title: 'FAQs',
            description: 'Address common customer questions with concise answers.',
            content: (
                <div className="space-y-4">
                    {formData.faq.map((item, index) => (
                        <div key={index} className="space-y-2 border border-gray-200 rounded-lg p-4">
                            <input
                                type="text"
                                value={item.question}
                                onChange={(event) => updateObjectList('faq', index, 'question', event.target.value)}
                                placeholder="Question"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                disabled={loading}
                            />
                            <textarea
                                value={item.answer}
                                onChange={(event) => updateObjectList('faq', index, 'answer', event.target.value)}
                                placeholder="Answer"
                                rows="2"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                disabled={loading}
                            />
                            {formData.faq.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeListItem('faq', index)}
                                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                    disabled={loading}
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => addListItem('faq', { question: '', answer: '' })}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                        disabled={loading}
                    >
                        + Add FAQ
                    </button>
                </div>
            )
        },
        {
            id: 'packs',
            title: 'Packs & Promotions',
            description: 'Configure pack discounts, bundle offers, and marketing flags.',
            content: (
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Pack Options</h3>
                        {formData.packOptions.map((option, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                                <div>
                                    <label className="block text-xs text-gray-600 mb-1">Pack Size *</label>
                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="Pack Size"
                                        value={option.packSize}
                                        onChange={(event) => updateObjectList('packOptions', index, 'packSize', event.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        disabled={loading}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-600 mb-1">Pack Price (₹) *</label>
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="Pack Price"
                                        value={option.packPrice}
                                        onChange={(event) => updateObjectList('packOptions', index, 'packPrice', event.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        disabled={loading}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-600 mb-1">Savings %</label>
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="Savings %"
                                        value={option.savingsPercent}
                                        onChange={(event) => updateObjectList('packOptions', index, 'savingsPercent', event.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        disabled={loading}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-600 mb-1">Label</label>
                                    <input
                                        type="text"
                                        placeholder="Label"
                                        value={option.label}
                                        onChange={(event) => updateObjectList('packOptions', index, 'label', event.target.value)}
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
                                            className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer text-xs"
                                        >
                                            Upload
                                        </label>
                                        {option.image && (
                                            <button
                                                type="button"
                                                onClick={() => updateObjectList('packOptions', index, 'image', '')}
                                                className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-xs"
                                                disabled={loading}
                                            >
                                                Clear
                                            </button>
                                        )}
                                    </div>
                                    {option.image && (
                                        <div className="mt-2">
                                            <img
                                                src={option.image}
                                                alt="Pack preview"
                                                className="w-16 h-16 object-cover rounded border"
                                            />
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => removeListItem('packOptions', index)}
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
                            onClick={() => addListItem('packOptions', { packSize: '', packPrice: '', savingsPercent: '', label: '', image: '' })}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                            disabled={loading}
                        >
                            + Add Pack Option
                        </button>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Free Products (Buy X Get Y)</h3>
                        {formData.freeProducts.map((item, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                                <select
                                    value={item.product || ''}
                                    onChange={(event) => updateObjectList('freeProducts', index, 'product', event.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    disabled={loading}
                                >
                                    <option value="">Select Product</option>
                                    {productOptions.map((product) => (
                                        <option key={product._id} value={product._id}>
                                            {product.name} (₹{product.price})
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    min="1"
                                    placeholder="Min Quantity"
                                    value={item.minQuantity}
                                    onChange={(event) => updateObjectList('freeProducts', index, 'minQuantity', event.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    disabled={loading}
                                />
                                <input
                                    type="number"
                                    min="1"
                                    placeholder="Free Quantity"
                                    value={item.quantity}
                                    onChange={(event) => updateObjectList('freeProducts', index, 'quantity', event.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    disabled={loading}
                                />
                                <div className="md:col-span-3 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => removeListItem('freeProducts', index)}
                                        className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                        disabled={loading}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => addListItem('freeProducts', { product: '', minQuantity: '', quantity: '' })}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            disabled={loading}
                        >
                            + Add Free Product Rule
                        </button>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Bundle With</h3>
                        {formData.bundleWith.map((item, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                                <select
                                    value={item.product || ''}
                                    onChange={(event) => updateObjectList('bundleWith', index, 'product', event.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    disabled={loading}
                                >
                                    <option value="">Select Product</option>
                                    {productOptions.map((product) => (
                                        <option key={product._id} value={product._id}>
                                            {product.name} (₹{product.price})
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="Bundle Price (₹)"
                                    value={item.bundlePrice}
                                    onChange={(event) => updateObjectList('bundleWith', index, 'bundlePrice', event.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    disabled={loading}
                                />
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="Savings Amount (₹)"
                                    value={item.savingsAmount}
                                    onChange={(event) => updateObjectList('bundleWith', index, 'savingsAmount', event.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    disabled={loading}
                                />
                                <div className="md:col-span-3 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => removeListItem('bundleWith', index)}
                                        className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                        disabled={loading}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => addListItem('bundleWith', { product: '', bundlePrice: '', savingsAmount: '' })}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            disabled={loading}
                        >
                            + Add Bundle Option
                        </button>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Offer Text</label>
                        <input
                            type="text"
                            name="offerText"
                            value={formData.offerText}
                            onChange={handleInputChange}
                            placeholder="e.g., Buy 2 get free shipping"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            disabled={loading}
                        />
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input
                                type="checkbox"
                                name="isOnOffer"
                                checked={formData.isOnOffer}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                disabled={loading}
                            />
                            Highlight as a special offer
                        </label>
                    </div>
                </div>
            )
        },
        {
            id: 'shipping',
            title: 'Shipping Options',
            description: 'Set shipping costs and free shipping thresholds.',
            content: (
                <div className="space-y-4">
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                            type="checkbox"
                            name="freeShipping"
                            checked={formData.freeShipping}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                            disabled={loading}
                        />
                        Offer free shipping on this product
                    </label>
                    {!formData.freeShipping && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Custom Shipping Cost (₹)</label>
                                <input
                                    type="number"
                                    name="shippingCost"
                                    value={formData.shippingCost}
                                    onChange={handleInputChange}
                                    min="0"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    disabled={loading}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Free Shipping Threshold (₹)</label>
                                <input
                                    type="number"
                                    name="minOrderForFreeShipping"
                                    value={formData.minOrderForFreeShipping}
                                    onChange={handleInputChange}
                                    min="0"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    disabled={loading}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )
        },
        {
            id: 'seo',
            title: 'SEO Information',
            description: 'Optimize product for search engines with meta tags and keywords.',
            content: (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
                        <input
                            type="text"
                            name="metaTitle"
                            value={formData.metaTitle}
                            onChange={handleInputChange}
                            placeholder="Enter meta title..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                        <textarea
                            name="metaDescription"
                            value={formData.metaDescription}
                            onChange={handleInputChange}
                            placeholder="Meta description"
                            rows="2"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Keywords</label>
                        {formData.keywords.map((keyword, index) => (
                            <div key={index} className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={keyword}
                                    onChange={(event) => updateListValue('keywords', index, event.target.value)}
                                    placeholder="Keyword"
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    disabled={loading}
                                />
                                {formData.keywords.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeListItem('keywords', index)}
                                        className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                        disabled={loading}
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => addListItem('keywords', '')}
                            className="mt-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                            disabled={loading}
                        >
                            + Add Keyword
                        </button>
                    </div>
                </div>
            )
        }
    ], [formData, loading, handleInputChange, updateListValue, addListItem, removeListItem, updateObjectList, addObjectListItem, handleToggleListValue, handlePackOptionImageUpload, attributePairs, genderOptions, categoryOptions, productOptions]);

    const currentSection = sections[currentStep];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <BackButton to="/admin/products" label="Back to Products" />

                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Product</h1>
                    <p className="text-gray-600">Fill in the details below to publish a new product.</p>
                    <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                        <span className="font-medium">Step {currentStep + 1} of {sections.length}</span>
                        <span>•</span>
                        <span>{currentSection.title}</span>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start gap-3">
                        <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Step Navigation */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                        <nav className="flex flex-wrap gap-2">
                            {sections.map((section, index) => {
                                const isActive = index === currentStep;
                                const isCompleted = index < currentStep;
                                return (
                                    <button
                                        key={section.id}
                                        type="button"
                                        onClick={() => goToStep(index)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                            isActive
                                                ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md'
                                                : isCompleted
                                                ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                                                : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                                        }`}
                                        disabled={loading}
                                    >
                                        {isCompleted && (
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                        <span>{index + 1}.</span>
                                        <span className="hidden sm:inline">{section.title}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Form Content */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                        <div className="mb-6 pb-4 border-b border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentSection.title}</h2>
                            <p className="text-gray-600">{currentSection.description}</p>
                        </div>
                        
                        <div className="space-y-6">
                            {currentSection.content}
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                            <div className="flex-1">
                                {currentStep > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => goToStep(currentStep - 1)}
                                        className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                        disabled={loading}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                        Previous
                                    </button>
                                )}
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={handleNavigateBack}
                                    className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                            </div>

                            <div className="flex-1 flex justify-end">
                                {currentStep < sections.length - 1 ? (
                                    <button
                                        type="button"
                                        onClick={() => goToStep(currentStep + 1)}
                                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-medium shadow-md hover:shadow-lg"
                                        disabled={loading}
                                    >
                                        Next
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Create Product
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminProductCreate;
