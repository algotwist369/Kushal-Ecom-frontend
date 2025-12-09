import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
    const [currentStep, setCurrentStep] = useState(0);
    
    // Refs to prevent multiple simultaneous requests
    const fetchingRef = useRef(false);
    const abortControllerRef = useRef(null);
    const idRef = useRef(id); // Track ID to prevent unnecessary re-fetches
    const isMountedRef = useRef(true); // Track if component is mounted
    
    const [formData, setFormData] = useState({
        // Basic fields
        name: '',
        description: '',
        price: '',
        discountPrice: '',
        stock: '',
        category: '', // Keep for backward compatibility
        categories: [], // New multiple categories array
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

    // Ref to always have latest formData for submission (declared after formData state)
    const formDataRef = useRef(formData);

    const fetchData = useCallback(async () => {
        // Prevent multiple simultaneous requests
        if (fetchingRef.current) {
            return;
        }

        // Validate ID exists
        if (!id) {
            setError('Product ID is missing. Please navigate from the products list.');
            setLoading(false);
            return;
        }

        // Abort previous request if still pending
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Create new AbortController for this request
        abortControllerRef.current = new AbortController();
        const currentAbortController = abortControllerRef.current;

        fetchingRef.current = true;
        setLoading(true);
        setError('');

        try {
            // Make API calls with individual error handling and abort signal
            let productResult, categoriesResult;
            try {
                productResult = await getProductById(id, currentAbortController.signal);
                
                // Check if request was aborted or superseded after API call
                if (productResult.aborted) {
                    return;
                }
                
                if (currentAbortController.signal.aborted || abortControllerRef.current !== currentAbortController) {
                    return;
                }
            } catch (productErr) {
                // Don't treat abort as error
                if (productErr.name === 'AbortError' || currentAbortController.signal.aborted) {
                    return;
                }
                productResult = {
                    success: false,
                    message: productErr.message || 'Failed to fetch product'
                };
            }
            
            // Check again before categories call
            if (currentAbortController.signal.aborted || abortControllerRef.current !== currentAbortController) {
                return;
            }
            
            try {
                categoriesResult = await getAllCategories();
                
                // Check if request was aborted after categories API call
                if (currentAbortController.signal.aborted || abortControllerRef.current !== currentAbortController) {
                    return;
                }
            } catch (categoryErr) {
                // Don't treat abort as error
                if (categoryErr.name === 'AbortError' || currentAbortController.signal.aborted) {
                    return;
                }
                categoriesResult = {
                    success: false,
                    message: categoryErr.message || 'Failed to fetch categories'
                };
            }

            // Check if request was aborted or superseded BEFORE processing results
            if (currentAbortController.signal.aborted) {
                return;
            }

            // Double check - ensure we're still the current request
            if (abortControllerRef.current !== currentAbortController) {
                return;
            }

            if (productResult.success) {
                const product = productResult.data;
                
                // Validate product data exists
                if (!product) {
                    setError('Product data is missing. Please try again.');
                    return;
                }
                
                // Note: We intentionally don't include 'slug' in formData as it's auto-generated from name
                const newFormData = {
                    name: product.name || '',
                    description: product.description || '',
                    price: product.price !== undefined && product.price !== null ? product.price : '',
                    discountPrice: product.discountPrice !== undefined && product.discountPrice !== null ? product.discountPrice : '',
                    stock: product.stock !== undefined && product.stock !== null ? product.stock : '',
                    category: product.category?._id || product.category || '',
                    categories: Array.isArray(product.categories) && product.categories.length > 0
                        ? product.categories.map(cat => cat._id || cat)
                        : (product.category ? [product.category._id || product.category] : []),
                    images: Array.isArray(product.images) && product.images.length > 0 ? product.images : [''],
                    attributes: product.attributes && typeof product.attributes === 'object' ? product.attributes : {},
                    isActive: product.isActive !== undefined ? product.isActive : true,
                    
                    ingredients: Array.isArray(product.ingredients) && product.ingredients.length > 0 ? product.ingredients : [{ image: '', name: '', description: '' }],
                    benefits: Array.isArray(product.benefits) && product.benefits.length > 0 ? product.benefits : [{ image: '', name: '', description: '' }],
                    dosage: product.dosage || '',
                    contraindications: Array.isArray(product.contraindications) && product.contraindications.length > 0 ? product.contraindications : [{ image: '', name: '', description: '' }],
                    shelfLife: product.shelfLife || '',
                    storageInstructions: product.storageInstructions || '',
                    manufacturer: product.manufacturer || '',
                    batchNumber: product.batchNumber || '',
                    expiryDate: product.expiryDate 
                        ? (typeof product.expiryDate === 'string' 
                            ? product.expiryDate.split('T')[0] 
                            : new Date(product.expiryDate).toISOString().split('T')[0])
                        : '',
                    certification: Array.isArray(product.certification) && product.certification.length > 0 ? product.certification : [{ image: '', name: '', description: '' }],
                    origin: product.origin || '',
                    processingMethod: product.processingMethod || '',
                    potency: product.potency || '',
                    formulation: product.formulation || '',
                    ageGroup: Array.isArray(product.ageGroup) ? product.ageGroup : [],
                    gender: Array.isArray(product.gender) ? product.gender : (product.gender ? [product.gender] : []),
                    season: Array.isArray(product.season) ? product.season : [],
                    timeOfDay: Array.isArray(product.timeOfDay) ? product.timeOfDay : [],
                    faq: Array.isArray(product.faq) && product.faq.length > 0 ? product.faq : [{ question: '', answer: '' }],
                    howToUse: Array.isArray(product.howToUse) && product.howToUse.length > 0 ? product.howToUse : [{ image: '', name: '', description: '' }],
                    howToStore: Array.isArray(product.howToStore) && product.howToStore.length > 0 ? product.howToStore : [{ image: '', name: '', description: '' }],
                    howToConsume: Array.isArray(product.howToConsume) && product.howToConsume.length > 0 ? product.howToConsume : [{ image: '', name: '', description: '' }],
                    
                    // Pack & Combo Options - show empty array if no data, otherwise show actual data
                    packOptions: Array.isArray(product.packOptions) && product.packOptions.length > 0 
                        ? product.packOptions.map(p => ({
                            packSize: p.packSize !== undefined ? p.packSize : '',
                            packPrice: p.packPrice !== undefined ? p.packPrice : '',
                            savingsPercent: p.savingsPercent !== undefined ? p.savingsPercent : '',
                            label: p.label || '',
                            image: p.image || ''
                        }))
                        : [],
                    freeProducts: Array.isArray(product.freeProducts) && product.freeProducts.length > 0
                        ? product.freeProducts.map(f => ({
                            product: f.product?._id || f.product || '',
                            minQuantity: f.minQuantity !== undefined ? f.minQuantity : '',
                            quantity: f.quantity !== undefined ? f.quantity : ''
                        }))
                        : [],
                    bundleWith: Array.isArray(product.bundleWith) && product.bundleWith.length > 0
                        ? product.bundleWith.map(b => ({
                            product: b.product?._id || b.product || '',
                            bundlePrice: b.bundlePrice !== undefined ? b.bundlePrice : '',
                            savingsAmount: b.savingsAmount !== undefined ? b.savingsAmount : ''
                        }))
                        : [],
                    offerText: product.offerText || '',
                    isOnOffer: product.isOnOffer || false,
                    
                    // Shipping Options
                    freeShipping: product.freeShipping || false,
                    shippingCost: product.shippingCost !== undefined ? product.shippingCost : 0,
                    minOrderForFreeShipping: product.minOrderForFreeShipping !== undefined ? product.minOrderForFreeShipping : 0,
                    
                    metaTitle: product.metaTitle || '',
                    metaDescription: product.metaDescription || '',
                    keywords: Array.isArray(product.keywords) && product.keywords.length > 0 ? product.keywords : ['']
                };
                
                // Double check again before setting state - ensure we're still the current request and component is mounted
                if (abortControllerRef.current === currentAbortController 
                    && !currentAbortController.signal.aborted 
                    && isMountedRef.current) {
                    // Use functional update to ensure we're setting the complete state
                    setFormData(prev => newFormData);
                    formDataRef.current = newFormData;
                }
            } else {
                // Set detailed error message
                let errorMessage = 'Failed to fetch product. ';
                if (productResult.message) {
                    errorMessage += productResult.message;
                } else if (productResult.data?.message) {
                    errorMessage += productResult.data.message;
                } else {
                    errorMessage += 'Please check if the product exists or try again later.';
                }
                
                setError(errorMessage);
                setLoading(false);
                return; // Exit early if product fetch failed
            }

            if (categoriesResult.success) {
                // Backend returns { categories: [...], total, page, pages }
                const categoriesData = categoriesResult.data.categories || categoriesResult.data;
                setCategories(Array.isArray(categoriesData) ? categoriesData : []);
            } else {
                setCategories([]);
            }
        } catch (err) {
            // Don't show error if request was aborted
            if (err.name === 'AbortError' || currentAbortController.signal.aborted) {
                return;
            }

            // Check if request was superseded
            if (abortControllerRef.current !== currentAbortController) {
                return;
            }

            // Show more detailed error message
            const errorMessage = err.response?.data?.message 
                || err.message 
                || 'Failed to fetch product details. Please try again.';
            setError(errorMessage);
            setCategories([]);
        } finally {
            // Only reset if this is still the current request
            if (abortControllerRef.current === currentAbortController) {
                fetchingRef.current = false;
                setLoading(false);
            }
        }
    }, [id]);

    useEffect(() => {
        // Only fetch if we have an ID
        if (!id) {
            setLoading(false);
            return;
        }

        // Skip if ID hasn't changed and fetch is already in progress
        if (idRef.current === id && fetchingRef.current) {
            return;
        }

        // Update ID ref and mounted status
        const previousId = idRef.current;
        idRef.current = id;
        isMountedRef.current = true;
        
        // Call fetchData - it's stable and will use the current id
        fetchData();
        
        // Cleanup function to abort request on unmount or when id changes
        return () => {
            // Only abort if ID actually changed (not on initial mount in strict mode)
            if (previousId !== id && previousId) {
                if (abortControllerRef.current) {
                    abortControllerRef.current.abort();
                }
                fetchingRef.current = false;
            } else if (!isMountedRef.current) {
                // On unmount, abort current request
                if (abortControllerRef.current) {
                    abortControllerRef.current.abort();
                }
                fetchingRef.current = false;
            }
        };
        // Only depend on id - fetchData is stable due to useCallback
    }, [id, fetchData]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            isMountedRef.current = false;
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            fetchingRef.current = false;
        };
    }, []);

    // Keep formDataRef in sync with formData state for reliable access in handleSubmit
    useEffect(() => {
        formDataRef.current = formData;
    }, [formData]);

    // Keyboard shortcut handler - Ctrl+S or Cmd+S to save
    useEffect(() => {
        const handleKeyPress = (e) => {
            // Ctrl+S or Cmd+S to save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (!saving && !loading) {
                    // Trigger form submission
                    const form = document.querySelector('form');
                    if (form) {
                        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
                        form.dispatchEvent(submitEvent);
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [saving, loading]);

    const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    }, []);

    const handleArrayChange = useCallback((field, index, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].map((item, i) => i === index ? value : item)
        }));
    }, []);

    const handleObjectArrayChange = useCallback((field, index, key, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].map((item, i) => 
                i === index ? { ...item, [key]: value } : item
            )
        }));
    }, []);

    const addArrayItem = useCallback((field, defaultValue = '') => {
        setFormData(prev => ({
            ...prev,
            [field]: [...prev[field], defaultValue]
        }));
    }, []);

    const addObjectArrayItem = useCallback((field, defaultValue) => {
        setFormData(prev => ({
            ...prev,
            [field]: [...prev[field], defaultValue]
        }));
    }, []);

    const handlePackOptionImageUpload = useCallback(async (packIndex, file) => {
        if (!file) return;
        
        try {
            const uploadFormData = new FormData();
            uploadFormData.append('packOptionImages', file);
            
            const response = await api.post('/upload/products/pack-options', uploadFormData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (response.data.images && response.data.images.length > 0) {
                handleObjectArrayChange('packOptions', packIndex, 'image', response.data.images[0]);
                toast.success('Pack option image uploaded successfully');
            }
        } catch (error) {
            toast.error('Failed to upload pack option image');
        }
    }, [handleObjectArrayChange]);

    const removeArrayItem = useCallback((field, index) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    }, []);

    const handleMultiSelect = useCallback((field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].includes(value)
                ? prev[field].filter(v => v !== value)
                : [...prev[field], value]
        }));
    }, []);

    const handleAttributeChange = useCallback((key, value) => {
        setFormData(prev => ({
            ...prev,
            attributes: {
                ...prev.attributes,
                [key]: value
            }
        }));
    }, []);

    const removeAttribute = useCallback((key) => {
        setFormData(prev => {
            const newAttributes = { ...prev.attributes };
            delete newAttributes[key];
            return {
                ...prev,
                attributes: newAttributes
            };
        });
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setError('');
        
        // Prevent multiple submissions
        if (saving) {
            return;
        }
        
        setSaving(true);

        try {
            // Get current formData - use state directly to ensure latest values, fallback to ref
            // This ensures we have the most up-to-date data, especially for categories
            let currentFormData = formData;
            
            // Double-check with ref if state seems stale (shouldn't happen but safety check)
            if (!currentFormData || !currentFormData.categories || currentFormData.categories.length === 0) {
                currentFormData = formDataRef.current;
            }

            // Validate formData exists
            if (!currentFormData || typeof currentFormData !== 'object') {
                setError('Form data is not available. Please refresh the page and try again.');
                setSaving(false);
                return;
            }

            // Validate required fields
            if (!currentFormData.name || currentFormData.name.trim() === '') {
                setError('Product name is required');
                setSaving(false);
                return;
            }

            const priceNum = Number(currentFormData.price);
            if (isNaN(priceNum) || priceNum < 0) {
                setError('Valid product price is required');
                setSaving(false);
                return;
            }

            const stockNum = Number(currentFormData.stock);
            if (isNaN(stockNum) || stockNum < 0) {
                setError('Valid stock quantity is required');
                setSaving(false);
                return;
            }

            // Validate categories
            if (!currentFormData.categories || !Array.isArray(currentFormData.categories) || currentFormData.categories.length === 0) {
                setError('At least one category is required');
                setSaving(false);
                return;
            }

            // Validate discount price if provided
            let discountPriceNum = null;
            if (currentFormData.discountPrice !== undefined && currentFormData.discountPrice !== null && currentFormData.discountPrice.toString().trim() !== '') {
                discountPriceNum = Number(currentFormData.discountPrice);
                if (isNaN(discountPriceNum) || discountPriceNum < 0) {
                    setError('Invalid discount price');
                    setSaving(false);
                    return;
                }
                if (discountPriceNum >= priceNum) {
                    setError('Discount price must be less than regular price');
                    setSaving(false);
                    return;
                }
            }

            // Clean up data before submission - explicitly exclude slug (it's auto-generated from name in backend)
            const { slug, category, categories, ...formDataWithoutSlug } = currentFormData;
            
            // Ensure categories is a valid array of category IDs
            const categoriesArray = Array.isArray(currentFormData.categories) && currentFormData.categories.length > 0
                ? currentFormData.categories.filter(cat => cat && (typeof cat === 'string' || cat._id))
                    .map(cat => typeof cat === 'string' ? cat : (cat._id || cat))
                : [];
            
            // Debug logging (only in development)
            if (import.meta.env.DEV) {
                console.log('📦 Categories before submission:', {
                    originalCategories: currentFormData.categories,
                    processedCategories: categoriesArray,
                    categoriesLength: categoriesArray.length
                });
            }
            
            // Validate categories array is not empty
            if (categoriesArray.length === 0) {
                setError('At least one category is required');
                setSaving(false);
                return;
            }
            
            // Prepare submitData with proper transformations
            const submitData = {
                ...formDataWithoutSlug,
                price: priceNum,
                discountPrice: discountPriceNum,
                stock: stockNum,
                category: categoriesArray[0], // Keep for backward compatibility - first category
                categories: categoriesArray, // New multiple categories array - explicitly set
                images: Array.isArray(currentFormData.images) ? currentFormData.images.filter(img => img && typeof img === 'string' && img.trim() !== '') : [],
                keywords: Array.isArray(currentFormData.keywords) 
                    ? currentFormData.keywords
                        .filter(k => k && typeof k === 'string' && k.trim() !== '')
                        .slice(0, 50) // Limit to 50 keywords max
                        .map(k => k.trim().substring(0, 100)) // Limit each keyword to 100 chars
                    : [],
                // Object arrays - send as-is after filtering empty objects (always send array)
                ingredients: Array.isArray(currentFormData.ingredients) ? currentFormData.ingredients.filter(item => {
                    if (!item || typeof item !== 'object') return false;
                    return (item.name && typeof item.name === 'string' && item.name.trim() !== '') ||
                           (item.image && typeof item.image === 'string' && item.image.trim() !== '') ||
                           (item.description && typeof item.description === 'string' && item.description.trim() !== '');
                }) : [],
                benefits: Array.isArray(currentFormData.benefits) ? currentFormData.benefits.filter(item => {
                    if (!item || typeof item !== 'object') return false;
                    return (item.name && typeof item.name === 'string' && item.name.trim() !== '') ||
                           (item.image && typeof item.image === 'string' && item.image.trim() !== '') ||
                           (item.description && typeof item.description === 'string' && item.description.trim() !== '');
                }) : [],
                contraindications: Array.isArray(currentFormData.contraindications) ? currentFormData.contraindications.filter(item => {
                    if (!item || typeof item !== 'object') return false;
                    return (item.name && typeof item.name === 'string' && item.name.trim() !== '') ||
                           (item.image && typeof item.image === 'string' && item.image.trim() !== '') ||
                           (item.description && typeof item.description === 'string' && item.description.trim() !== '');
                }) : [],
                certification: Array.isArray(currentFormData.certification) ? currentFormData.certification.filter(item => {
                    if (!item || typeof item !== 'object') return false;
                    return (item.name && typeof item.name === 'string' && item.name.trim() !== '') ||
                           (item.image && typeof item.image === 'string' && item.image.trim() !== '') ||
                           (item.description && typeof item.description === 'string' && item.description.trim() !== '');
                }) : [],
                howToUse: Array.isArray(currentFormData.howToUse) ? currentFormData.howToUse.filter(item => {
                    if (!item || typeof item !== 'object') return false;
                    return (item.name && typeof item.name === 'string' && item.name.trim() !== '') ||
                           (item.image && typeof item.image === 'string' && item.image.trim() !== '') ||
                           (item.description && typeof item.description === 'string' && item.description.trim() !== '');
                }) : [],
                howToStore: Array.isArray(currentFormData.howToStore) ? currentFormData.howToStore.filter(item => {
                    if (!item || typeof item !== 'object') return false;
                    return (item.name && typeof item.name === 'string' && item.name.trim() !== '') ||
                           (item.image && typeof item.image === 'string' && item.image.trim() !== '') ||
                           (item.description && typeof item.description === 'string' && item.description.trim() !== '');
                }) : [],
                howToConsume: Array.isArray(currentFormData.howToConsume) ? currentFormData.howToConsume.filter(item => {
                    if (!item || typeof item !== 'object') return false;
                    return (item.name && typeof item.name === 'string' && item.name.trim() !== '') ||
                           (item.image && typeof item.image === 'string' && item.image.trim() !== '') ||
                           (item.description && typeof item.description === 'string' && item.description.trim() !== '');
                }) : [],
                // String fields - send as strings (empty string is valid)
                dosage: currentFormData.dosage?.trim() || '',
                shelfLife: currentFormData.shelfLife?.trim() || '',
                storageInstructions: currentFormData.storageInstructions?.trim() || '',
                formulation: currentFormData.formulation?.trim() || '',
                metaTitle: currentFormData.metaTitle?.trim() || '',
                metaDescription: currentFormData.metaDescription?.trim() || '',
                // Array fields - send empty arrays if no values (controller handles empty arrays)
                ageGroup: currentFormData.ageGroup || [],
                gender: currentFormData.gender || [],
                season: currentFormData.season || [],
                timeOfDay: currentFormData.timeOfDay || [],
                faq: Array.isArray(currentFormData.faq) ? currentFormData.faq.filter(f => {
                    if (!f || typeof f !== 'object') return false;
                    return (f.question && typeof f.question === 'string' && f.question.trim() !== '') &&
                           (f.answer && typeof f.answer === 'string' && f.answer.trim() !== '');
                }) : [],
                packOptions: Array.isArray(currentFormData.packOptions) ? currentFormData.packOptions.filter(p => p && p.packSize && p.packPrice).map(p => {
                    const packSizeNum = Number(p.packSize);
                    const packPriceNum = Number(p.packPrice);
                    if (isNaN(packSizeNum) || packSizeNum < 1 || isNaN(packPriceNum) || packPriceNum < 0) {
                        return null; // Filter out invalid entries
                    }
                    return {
                        packSize: packSizeNum,
                        packPrice: packPriceNum,
                        savingsPercent: p.savingsPercent && !isNaN(Number(p.savingsPercent)) ? Number(p.savingsPercent) : undefined,
                        label: p.label?.trim() || undefined,
                        image: p.image?.trim() || undefined
                    };
                }).filter(p => p !== null) : [],
                freeProducts: Array.isArray(currentFormData.freeProducts) ? currentFormData.freeProducts.filter(f => f && f.product && f.minQuantity && f.quantity).map(f => {
                    const minQty = Number(f.minQuantity);
                    const qty = Number(f.quantity);
                    if (isNaN(minQty) || minQty < 1 || isNaN(qty) || qty < 1) {
                        return null;
                    }
                    return {
                        product: f.product,
                        minQuantity: minQty,
                        quantity: qty
                    };
                }).filter(f => f !== null) : [],
                bundleWith: Array.isArray(currentFormData.bundleWith) ? currentFormData.bundleWith.filter(b => b && b.product && b.bundlePrice).map(b => {
                    const bundlePriceNum = Number(b.bundlePrice);
                    if (isNaN(bundlePriceNum) || bundlePriceNum < 0) {
                        return null;
                    }
                    return {
                        product: b.product,
                        bundlePrice: bundlePriceNum,
                        savingsAmount: b.savingsAmount && !isNaN(Number(b.savingsAmount)) ? Number(b.savingsAmount) : undefined
                    };
                }).filter(b => b !== null) : []
            };
            
            // Explicitly remove slug if it somehow exists (triple safety)
            delete submitData.slug;
            
            // Ensure categories are explicitly included (double-check)
            if (!submitData.categories || !Array.isArray(submitData.categories) || submitData.categories.length === 0) {
                setError('Categories are required. Please select at least one category.');
                setSaving(false);
                return;
            }

            // Debug logging (only in development)
            if (import.meta.env.DEV) {
                console.log('📤 Submitting product update:', {
                    productId: id,
                    categories: submitData.categories,
                    category: submitData.category,
                    categoriesCount: submitData.categories.length
                });
            }

            // Validate submitData is not empty
            if (!submitData || Object.keys(submitData).length === 0) {
                setError('No data to update. Please fill in at least one field.');
                setSaving(false);
                return;
            }

            const updatePromise = updateProduct(id, submitData);
            
            toast.promise(
                updatePromise,
                {
                    loading: 'Updating product...',
                    success: 'Product updated successfully!',
                    error: (err) => {
                        // Extract error message from various possible locations
                        let errorMsg = 'Failed to update product';
                        if (err?.response?.data?.message) {
                            errorMsg = err.response.data.message;
                        } else if (err?.message) {
                            errorMsg = err.message;
                        } else if (typeof err === 'string') {
                            errorMsg = err;
                        } else if (err?.data?.message) {
                            errorMsg = err.data.message;
                        }
                        return errorMsg;
                    },
                }
            );

            const result = await updatePromise;
            
            if (result.success && result.data) {
                // Validate response data exists
                if (result.data && typeof result.data === 'object') {
                    // Navigate back to products list after successful update
                    setTimeout(() => {
                        navigate('/admin/products', { replace: true, state: { refresh: Date.now() } });
                    }, 1000);
                } else {
                    // Response structure unexpected but success=true, still navigate
                    console.warn('Unexpected response structure:', result);
                    setTimeout(() => {
                        navigate('/admin/products', { replace: true, state: { refresh: Date.now() } });
                    }, 1000);
                }
            } else {
                // Handle validation errors from backend
                const errorMessage = result?.message || result?.error?.message || 'Failed to update product. Please try again.';
                setError(errorMessage);
                
                // Show detailed error in toast
                toast.error(errorMessage, {
                    duration: 5000,
                });
                
                // If it's a validation error with details, show them
                if (result.errors && Array.isArray(result.errors)) {
                    const errorDetails = result.errors.map(err => `${err.msg || err.message || err}`).join(', ');
                    setError(`${errorMessage}: ${errorDetails}`);
                    toast.error(`${errorMessage}: ${errorDetails}`, {
                        duration: 6000,
                    });
                }
            }
        } catch (err) {
            // Don't show error if it's already handled
            if (err.name === 'AbortError' || err.code === 'ERR_CANCELED') {
                setSaving(false);
                return;
            }
            
            const errorMessage = err.response?.data?.message || err.message || 'Failed to update product. Please try again.';
            setError(errorMessage);
            
            // Handle validation errors
            if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
                const errorDetails = err.response.data.errors.map(err => `${err.msg || err.message || err}`).join(', ');
                setError(`${errorMessage}: ${errorDetails}`);
            }
            
            toast.error(errorMessage, {
                duration: 5000,
            });
        } finally {
            setSaving(false);
        }
    }, [id, navigate, saving]);

    const goToStep = useCallback((step) => {
        setCurrentStep(step);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    // Memoize navigation sections
    const navigationSections = useMemo(() => [
        { id: 'basic', title: 'Basic', icon: '📝' },
        { id: 'ayurvedic', title: 'Ayurvedic', icon: '🌿' },
        { id: 'usage', title: 'Usage', icon: '📋' },
        { id: 'faq', title: 'FAQ', icon: '❓' },
        { id: 'pack', title: 'Pack & Combo', icon: '📦' },
        { id: 'shipping', title: 'Shipping', icon: '🚚' },
        { id: 'seo', title: 'SEO', icon: '🔍' }
    ], []);

    // Memoize category options
    const categoryOptions = useMemo(() => 
        Array.isArray(categories) ? categories : []
    , [categories]);

    // Memoize navigation handlers
    const handleNavigateBack = useCallback(() => {
        navigate('/admin/products');
    }, [navigate]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading product data...</p>
                </div>
            </div>
        );
    }

    // Show error if no product data loaded and not in initial state
    if (!formData.name && !loading && id) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <BackButton to="/admin/products" label="Back to Products" />
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r-lg mb-6 shadow-sm">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-medium">
                                {error || 'Failed to load product data. Please try again.'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <BackButton to="/admin/products" label="Back to Products" />
                
                {/* Header */}
                <div className="mb-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-1">Edit Product</h1>
                                <p className="text-gray-500 text-sm">Update product information and details</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
                                    <span className="text-xs font-medium text-blue-600">Step {currentStep + 1} of 7</span>
                                </div>
                                {/* Quick Update Button */}
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleSubmit(e);
                                    }}
                                    disabled={saving || loading}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md"
                                >
                                    {saving ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Updating...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span>Update Product</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r-lg mb-6 shadow-sm">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm font-medium">{error}</span>
                            </div>
                        </div>
                    )}

                    {/* Tab Navigation */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 overflow-x-auto">
                        <nav className="flex gap-2 min-w-max">
                            {navigationSections.map((section, index) => {
                                const isActive = index === currentStep;
                                return (
                                    <button
                                        key={section.id}
                                        type="button"
                                        onClick={() => goToStep(index)}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                                            isActive
                                                ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md shadow-green-500/30'
                                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                                        }`}
                                        disabled={saving}
                                    >
                                        <span className="text-base">{section.icon}</span>
                                        <span>{section.title}</span>
                                        {isActive && (
                                            <span className="ml-1 w-2 h-2 bg-white rounded-full"></span>
                                        )}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Basic Information */}
                    {currentStep === 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                        <div className="mb-6 pb-4 border-b border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
                            <p className="text-sm text-gray-500 mt-1">Essential product details</p>
                        </div>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Product Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g., Kapiva Dia Free Juice 1L"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white text-gray-900 placeholder-gray-400"
                                    required
                                    disabled={saving}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Enter product description..."
                                    rows="4"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white text-gray-900 placeholder-gray-400 resize-none"
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
                                        Categories <span className="text-red-500">*</span>
                                        <span className="text-xs text-gray-500 ml-2">(Select multiple categories)</span>
                                    </label>
                                    <div className="border border-gray-300 rounded-lg p-3 min-h-[42px] max-h-48 overflow-y-auto bg-white">
                                        {categoryOptions.length === 0 ? (
                                            <p className="text-gray-500 text-sm">Loading categories...</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {categoryOptions.map((category) => {
                                                    const isSelected = formData.categories.includes(category._id);
                                                    return (
                                                        <label
                                                            key={category._id}
                                                            className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={(e) => {
                                                                    setFormData(prev => {
                                                                        const newCategories = e.target.checked
                                                                            ? [...prev.categories, category._id]
                                                                            : prev.categories.filter(id => id !== category._id);
                                                                        
                                                                        const newFormData = {
                                                                            ...prev,
                                                                            categories: newCategories,
                                                                            category: newCategories.length > 0 ? newCategories[0] : prev.category // Keep first for backward compatibility
                                                                        };
                                                                        
                                                                        // Update ref immediately for synchronous access
                                                                        formDataRef.current = newFormData;
                                                                        
                                                                        return newFormData;
                                                                    });
                                                                }}
                                                                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                                                disabled={saving}
                                                            />
                                                            <span className="text-sm text-gray-700">{category.name}</span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                    {formData.categories.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {formData.categories.map((catId) => {
                                                const cat = categoryOptions.find(c => c._id === catId);
                                                return cat ? (
                                                    <span
                                                        key={catId}
                                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                                                    >
                                                        {cat.name}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    categories: prev.categories.filter(id => id !== catId),
                                                                    category: prev.categories[0] === catId && prev.categories.length > 1 
                                                                        ? prev.categories[1] 
                                                                        : (prev.categories.length === 1 ? '' : prev.category)
                                                                }));
                                                            }}
                                                            className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-green-200"
                                                            disabled={saving}
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                ) : null;
                                            })}
                                        </div>
                                    )}
                                    {formData.categories.length === 0 && (
                                        <p className="mt-1 text-xs text-red-500">At least one category is required</p>
                                    )}
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
                                                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-200 font-medium transition-all duration-200"
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
                                    className="mt-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 border border-gray-300 font-medium transition-all duration-200 shadow-sm hover:shadow"
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
                    )}

                    {/* Ayurvedic Details */}
                    {currentStep === 1 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                        <div className="mb-6 pb-4 border-b border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900">Ayurvedic Details</h2>
                            <p className="text-sm text-gray-500 mt-1">Traditional and medicinal information</p>
                        </div>
                        
                        <div className="space-y-6">
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
                    )}

                    {/* Usage & Storage - How To Use, How To Store, How To Consume */}
                    {currentStep === 2 && (
                    <div className="space-y-6">
                    {/* How To Use */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                        <div className="mb-6 pb-4 border-b border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900">How To Use</h2>
                            <p className="text-sm text-gray-500 mt-1">Usage instructions and guidelines</p>
                        </div>
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
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                        <div className="mb-6 pb-4 border-b border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900">How To Store</h2>
                            <p className="text-sm text-gray-500 mt-1">Storage instructions and tips</p>
                        </div>
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
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                        <div className="mb-6 pb-4 border-b border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900">How To Consume</h2>
                            <p className="text-sm text-gray-500 mt-1">Consumption methods and recommendations</p>
                        </div>
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
                    </div>
                    )}

                    {/* FAQ */}
                    {currentStep === 3 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                        <div className="mb-6 pb-4 border-b border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
                            <p className="text-sm text-gray-500 mt-1">Common questions and answers</p>
                        </div>
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
                    )}

                    {/* Pack & Combo Options */}
                    {currentStep === 4 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                        <div className="mb-6 pb-4 border-b border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900">Pack & Combo Options</h2>
                            <p className="text-sm text-gray-500 mt-1">Create special offers and bundles</p>
                        </div>
                        
                        {/* Pack Options */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Pack Options</h3>
                            {(!formData.packOptions || formData.packOptions.length === 0) && (
                                <p className="text-sm text-gray-500 mb-3">No pack options added yet. Click "Add Pack Option" to create one.</p>
                            )}
                            {(formData.packOptions || []).map((pack, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Pack Size *</label>
                                        <input
                                            type="number"
                                            min="1"
                                            placeholder="Pack Size"
                                            value={pack.packSize !== undefined && pack.packSize !== null ? pack.packSize : ''}
                                            onChange={(e) => handleObjectArrayChange('packOptions', index, 'packSize', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                            disabled={saving}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Pack Price (₹) *</label>
                                        <input
                                            type="number"
                                            min="0"
                                            placeholder="Pack Price"
                                            value={pack.packPrice !== undefined && pack.packPrice !== null ? pack.packPrice : ''}
                                            onChange={(e) => handleObjectArrayChange('packOptions', index, 'packPrice', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                            disabled={saving}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Savings %</label>
                                        <input
                                            type="number"
                                            min="0"
                                            placeholder="Savings %"
                                            value={pack.savingsPercent !== undefined && pack.savingsPercent !== null ? pack.savingsPercent : ''}
                                            onChange={(e) => handleObjectArrayChange('packOptions', index, 'savingsPercent', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                            disabled={saving}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Label</label>
                                        <input
                                            type="text"
                                            placeholder="Label"
                                            value={pack.label || ''}
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
                                                    loading="lazy"
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
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Free Products (Buy X Get Y)</h3>
                            {(!formData.freeProducts || formData.freeProducts.length === 0) && (
                                <p className="text-sm text-gray-500 mb-3">No free product rules added yet. Click "Add Free Product Rule" to create one.</p>
                            )}
                            {(formData.freeProducts || []).map((item, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                                    <input
                                        type="text"
                                        placeholder="Product ID"
                                        value={item.product || ''}
                                        onChange={(e) => handleObjectArrayChange('freeProducts', index, 'product', e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg"
                                        disabled={saving}
                                    />
                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="Min Quantity"
                                        value={item.minQuantity !== undefined && item.minQuantity !== null ? item.minQuantity : ''}
                                        onChange={(e) => handleObjectArrayChange('freeProducts', index, 'minQuantity', e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg"
                                        disabled={saving}
                                    />
                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="Free Quantity"
                                        value={item.quantity !== undefined && item.quantity !== null ? item.quantity : ''}
                                        onChange={(e) => handleObjectArrayChange('freeProducts', index, 'quantity', e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg"
                                        disabled={saving}
                                    />
                                    <div className="md:col-span-3 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => removeArrayItem('freeProducts', index)}
                                            className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                            disabled={saving}
                                        >
                                            Remove
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
                                + Add Free Product Rule
                            </button>
                        </div>

                        {/* Bundle With */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Bundle With</h3>
                            {(!formData.bundleWith || formData.bundleWith.length === 0) && (
                                <p className="text-sm text-gray-500 mb-3">No bundle options added yet. Click "Add Bundle Option" to create one.</p>
                            )}
                            {(formData.bundleWith || []).map((item, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                                    <input
                                        type="text"
                                        placeholder="Bundle Product ID"
                                        value={item.product || ''}
                                        onChange={(e) => handleObjectArrayChange('bundleWith', index, 'product', e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg"
                                        disabled={saving}
                                    />
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="Bundle Price"
                                        value={item.bundlePrice !== undefined && item.bundlePrice !== null ? item.bundlePrice : ''}
                                        onChange={(e) => handleObjectArrayChange('bundleWith', index, 'bundlePrice', e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg"
                                        disabled={saving}
                                    />
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="Savings Amount"
                                        value={item.savingsAmount !== undefined && item.savingsAmount !== null ? item.savingsAmount : ''}
                                        onChange={(e) => handleObjectArrayChange('bundleWith', index, 'savingsAmount', e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg"
                                        disabled={saving}
                                    />
                                    <div className="md:col-span-3 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => removeArrayItem('bundleWith', index)}
                                            className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                            disabled={saving}
                                        >
                                            Remove
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
                    )}

                    {/* Shipping Options */}
                    {currentStep === 5 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                        <div className="mb-6 pb-4 border-b border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900">Shipping Options</h2>
                            <p className="text-sm text-gray-500 mt-1">Configure shipping settings</p>
                        </div>
                        
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
                    )}

                    {/* SEO */}
                    {currentStep === 6 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                        <div className="mb-6 pb-4 border-b border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900">SEO Information</h2>
                            <p className="text-sm text-gray-500 mt-1">Search engine optimization settings</p>
                        </div>
                        
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
                    )}

                    {/* Navigation & Submit Buttons */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            {/* Previous Button */}
                            <div className="w-full sm:w-auto">
                                {currentStep > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => goToStep(currentStep - 1)}
                                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium shadow-sm hover:shadow"
                                        disabled={saving}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                        Previous
                                    </button>
                                )}
                            </div>

                            {/* Step Indicator */}
                            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
                                <span className="text-sm font-medium text-gray-600">
                                    Step <span className="text-green-600 font-bold">{currentStep + 1}</span> of <span className="font-bold">7</span>
                                </span>
                            </div>

                            {/* Next Button */}
                            <div className="w-full sm:w-auto flex gap-3">
                                {currentStep < 6 && (
                                    <button
                                        type="button"
                                        onClick={() => goToStep(currentStep + 1)}
                                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                                        disabled={saving}
                                    >
                                        Next
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                )}
                                
                                {/* Submit Button - Show on last step */}
                                {currentStep === 6 && (
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-semibold shadow-md hover:shadow-lg disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed"
                                    >
                                        {saving ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Update Product
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Cancel Button */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={handleNavigateBack}
                                disabled={saving}
                                className="w-full sm:w-auto px-6 py-2.5 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Floating Update Button - Always visible */}
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        handleSubmit(e);
                    }}
                    disabled={saving || loading}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-full shadow-2xl hover:from-green-700 hover:to-green-800 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-2xl group"
                    title="Update product (Ctrl+S)"
                >
                    {saving ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="hidden sm:inline">Updating...</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="hidden sm:inline">Update</span>
                            <span className="sm:hidden">Save</span>
                        </>
                    )}
                </button>
            </div>

        </div>
    );
};

export default AdminProductEdit;
