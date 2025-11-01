import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { BsCartPlus, BsStarFill, BsStar, BsX, BsImage, BsChevronLeft, BsChevronRight, BsTruck, BsShieldCheck } from "react-icons/bs";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import api from "../../api/axiosConfig";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";
import PopUpModal from "../common/PopUpModal";

// Professional Image Magnifier Component
const ImageMagnifier = ({ src, alt, className = "" }) => {
    const [isHovering, setIsHovering] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [screenPosition, setScreenPosition] = useState({ x: 0, y: 0 });
    const [isMobile, setIsMobile] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const imageRef = useRef(null);
    const containerRef = useRef(null);

    const ZOOM_LEVEL = 2.5;
    const MAGNIFIER_SIZE = 200;

    // Check if device is mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024 || 'ontouchstart' in window);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleMouseMove = (e) => {
        if (!imageRef.current || !containerRef.current || isMobile) return;
        
        const imageRect = imageRef.current.getBoundingClientRect();
        
        // Calculate relative position within the image
        const x = e.clientX - imageRect.left;
        const y = e.clientY - imageRect.top;
        
        // Ensure coordinates are within image bounds
        const boundedX = Math.max(0, Math.min(x, imageRect.width));
        const boundedY = Math.max(0, Math.min(y, imageRect.height));
        
        setMousePosition({ x: boundedX, y: boundedY });
        setScreenPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseEnter = () => {
        if (isMobile) return;
        setIsHovering(true);
    };

    const handleMouseLeave = () => {
        if (isMobile) return;
        setIsHovering(false);
    };

    const handleImageLoad = () => {
        setImageLoaded(true);
    };

    // Calculate background position for zoom effect
    const getBackgroundPosition = () => {
        if (!imageRef.current) return '0px 0px';
        
        const imageRect = imageRef.current.getBoundingClientRect();
        const scaleX = ZOOM_LEVEL;
        const scaleY = ZOOM_LEVEL;
        
        const bgX = -(mousePosition.x * scaleX - MAGNIFIER_SIZE / 2);
        const bgY = -(mousePosition.y * scaleY - MAGNIFIER_SIZE / 2);
        
        return `${bgX}px ${bgY}px`;
    };

    return (
        <div ref={containerRef} className="relative w-full h-full flex items-center justify-center">
            <img
                ref={imageRef}
                src={src}
                alt={alt}
                className={`${className} ${isMobile ? 'cursor-pointer' : 'cursor-zoom-in'} select-none max-w-full max-h-full transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onLoad={handleImageLoad}
                draggable={false}
                style={{ objectFit: 'contain' }}
            />
            
            {/* Magnifier - Desktop only */}
            {!isMobile && isHovering && (
                <div
                    className="fixed pointer-events-none z-50 border-2 border-white rounded-lg overflow-hidden shadow-2xl bg-white"
                    style={{
                        left: `${screenPosition.x + 20}px`,
                        top: `${screenPosition.y - MAGNIFIER_SIZE / 2}px`,
                        width: `${MAGNIFIER_SIZE}px`,
                        height: `${MAGNIFIER_SIZE}px`,
                        backgroundImage: `url(${src})`,
                        backgroundSize: `${imageRef.current?.offsetWidth * ZOOM_LEVEL}px ${imageRef.current?.offsetHeight * ZOOM_LEVEL}px`,
                        backgroundPosition: getBackgroundPosition(),
                        backgroundRepeat: 'no-repeat',
                        transition: 'opacity 0.1s ease-in-out'
                    }}
                >
                    {/* Crosshair overlay */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div 
                            className="absolute w-px h-full bg-red-500 opacity-50"
                            style={{ left: '50%', transform: 'translateX(-50%)' }}
                        />
                        <div 
                            className="absolute h-px w-full bg-red-500 opacity-50"
                            style={{ top: '50%', transform: 'translateY(-50%)' }}
                        />
                    </div>
                </div>
            )}
            
            {/* Zoom indicator - Desktop only */}
            {!isMobile && isHovering && (
                <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded pointer-events-none z-10">
                    {ZOOM_LEVEL}x Zoom
                </div>
            )}
            
            {/* Mobile tap indicator */}
            {isMobile && (
                <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded pointer-events-none z-10">
                    Tap to view full size
                </div>
            )}
        </div>
    );
};

// Simple Image Lightbox
const ImageLightbox = ({ images, currentIndex, onClose, onNext, onPrev }) => {
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90" onClick={onClose}>
            <button onClick={onClose} className="absolute top-6 right-6 text-white hover:text-gray-300">
                <BsX className="text-4xl" />
            </button>
            <div className="h-full flex items-center justify-center p-8" onClick={(e) => e.stopPropagation()}>
                <img src={images[currentIndex]} alt="" className="max-h-full max-w-full object-contain" />
                {images.length > 1 && (
                    <>
                        <button onClick={onPrev} className="absolute left-6 text-white p-3 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70">
                            <BsChevronLeft className="text-2xl" />
                        </button>
                        <button onClick={onNext} className="absolute right-6 text-white p-3 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70">
                            <BsChevronRight className="text-2xl" />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

// Review Card
const ReviewCard = ({ review, user, isAuthenticated, onEdit, onDelete, renderStars }) => {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    return (
        <>
            <div className="border-b border-gray-200 py-6">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-white font-semibold">
                            {review.user?.name?.[0]?.toUpperCase() || 'A'}
                        </div>
                        <div>
                            <p className="font-semibold text-[#5c2d16]">{review.user?.name || 'Anonymous'}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="flex">{renderStars(review.rating)}</div>
                                <span className="text-sm text-gray-400">•</span>
                                <span className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                    {isAuthenticated && (user?._id === review.user?._id || user?.role === 'admin') && (
                        <div className="flex gap-2">
                            <button onClick={() => onEdit(review)} className="text-sm text-gray-600 hover:underline">Edit</button>
                            <button onClick={() => onDelete(review._id)} className="text-sm text-red-600 hover:underline">Delete</button>
                        </div>
                    )}
                </div>
                <p className="text-gray-700 mb-3">{review.comment}</p>
                {review.images && review.images.length > 0 && (
                    <div className="flex gap-2">
                        {review.images.map((img, idx) => (
                            <img
                                key={idx}
                                src={img}
                                alt={`Review ${idx + 1}`}
                                className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-80"
                                onClick={() => { setLightboxIndex(idx); setLightboxOpen(true); }}
                            />
                        ))}
                    </div>
                )}
            </div>
            {lightboxOpen && (
                <ImageLightbox
                    images={review.images}
                    currentIndex={lightboxIndex}
                    onClose={() => setLightboxOpen(false)}
                    onNext={() => setLightboxIndex((prev) => (prev + 1) % review.images.length)}
                    onPrev={() => setLightboxIndex((prev) => (prev - 1 + review.images.length) % review.images.length)}
                />
            )}
        </>
    );
};

const ProductDetails = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { isAuthenticated, user } = useAuth();

    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [bundleProducts, setBundleProducts] = useState([]);
    const [freeProductsData, setFreeProductsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mainImage, setMainImage] = useState("");
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [activeTab, setActiveTab] = useState('description');
    const [faqOpen, setFaqOpen] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedPack, setSelectedPack] = useState(null);
    const [reviewForm, setReviewForm] = useState({ rating: 0, comment: "", images: [] });
    const [editingReviewId, setEditingReviewId] = useState(null);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    
    // Coupon claim state
    const [phoneNumber, setPhoneNumber] = useState('');
    const [claimedCoupon, setClaimedCoupon] = useState(null);
    const [claimingCoupon, setClaimingCoupon] = useState(false);
    const [activeCoupons, setActiveCoupons] = useState([]);
    const [couponError, setCouponError] = useState('');
    const [phoneValidation, setPhoneValidation] = useState({ isValid: false, message: '' });

    useEffect(() => {
        fetchProductDetails();
        fetchActiveCoupons();
        window.scrollTo(0, 0);
    }, [productId]);

    const fetchProductDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/products/${productId}`);
            setProduct(response.data);
            setMainImage(response.data.images?.[0] || "");

            if (response.data.category?._id) {
                fetchRelatedProducts(response.data.category._id);
            }
            
            if (response.data.bundleWith && response.data.bundleWith.length > 0) {
                fetchBundleProducts(response.data.bundleWith);
            }
            
            if (response.data.freeProducts && response.data.freeProducts.length > 0) {
                fetchFreeProducts(response.data.freeProducts);
            }
        } catch (error) {
            console.error("Error fetching product:", error);
            toast.error("Failed to load product");
        } finally {
            setLoading(false);
        }
    };

    const fetchRelatedProducts = async (categoryId) => {
        try {
            const response = await api.post('/products/filter', {
                categories: [categoryId],
                limit: 4
            });
            setRelatedProducts(response.data.products?.filter(p => p._id !== product?._id) || []);
        } catch (error) {
            console.error("Error fetching related products:", error);
        }
    };

    const fetchBundleProducts = async (bundles) => {
        try {
            const productIds = bundles.map(b => typeof b.product === 'object' ? b.product._id : b.product).filter(Boolean);
            if (productIds.length > 0) {
                const promises = productIds.map(id => api.get(`/products/${id}`).catch(() => null));
                const responses = await Promise.all(promises);
                setBundleProducts(responses.filter(r => r !== null).map(r => r.data));
            }
        } catch (error) {
            console.error("Error fetching bundle products:", error);
        }
    };

    const fetchFreeProducts = async (freeOffers) => {
        try {
            const productIds = freeOffers.map(f => typeof f.product === 'object' ? f.product._id : f.product).filter(Boolean);
            if (productIds.length > 0) {
                const promises = productIds.map(id => api.get(`/products/${id}`).catch(() => null));
                const responses = await Promise.all(promises);
                setFreeProductsData(responses.filter(r => r !== null).map(r => r.data));
            }
        } catch (error) {
            console.error("Error fetching free products:", error);
        }
    };

    const fetchActiveCoupons = async () => {
        try {
            const response = await api.get('/coupons/active');
            setActiveCoupons(response.data || []);
        } catch (error) {
            console.error("Error fetching coupons:", error);
        }
    };

    const validatePhoneNumber = (phone) => {
        if (phone.length === 0) {
            setPhoneValidation({ isValid: false, message: '' });
            return false;
        }
        
        if (phone.length < 10) {
            setPhoneValidation({ isValid: false, message: 'Phone number must be 10 digits' });
            return false;
        }
        
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(phone)) {
            setPhoneValidation({ isValid: false, message: 'Phone number must start with 6, 7, 8, or 9' });
            return false;
        }
        
        setPhoneValidation({ isValid: true, message: 'Valid phone number' });
        return true;
    };

    const handleClaimCoupon = async (e) => {
        e.preventDefault();
        setCouponError('');
        
        if (!phoneNumber) {
            setCouponError("Please enter your phone number");
            return;
        }

        // Validate phone number
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(phoneNumber)) {
            setCouponError("Please enter a valid 10-digit Indian mobile number");
            return;
        }

        // Get the first available active coupon
        if (activeCoupons.length === 0) {
            toast.error("No coupons available at the moment");
            return;
        }

        setClaimingCoupon(true);

        try {
            // Claim the first available coupon
            const selectedCoupon = activeCoupons[0];
            const response = await api.post('/coupons/claim', {
                phoneNumber,
                couponCode: selectedCoupon.code
            });

            setClaimedCoupon(response.data.coupon);
            toast.success("Coupon received! Copy and use at checkout.");
            setPhoneNumber('');
            setCouponError('');
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to claim coupon";
            setCouponError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setClaimingCoupon(false);
        }
    };

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            toast.error("Please login to add items to cart");
            navigate("/login");
            return;
        }

        if (product.stock <= 0) {
            toast.error("Out of stock");
            return;
        }

        const finalQuantity = selectedPack ? selectedPack.packSize : quantity;
        const packInfo = selectedPack ? {
            packSize: selectedPack.packSize,
            packPrice: selectedPack.packPrice,
            savingsPercent: selectedPack.savingsPercent,
            label: selectedPack.label
        } : null;

        try {
            await addToCart(product._id, finalQuantity, packInfo);
            toast.success("Added to cart");
            setQuantity(1);
            setSelectedPack(null);
        } catch (error) {
            // Error handled in context
        }
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        if (reviewForm.images.length + files.length > 5) {
            toast.error("Maximum 5 images allowed");
            e.target.value = '';
            return;
        }

        setUploadingImages(true);
        try {
            const formData = new FormData();
            files.forEach(file => formData.append('images', file));
            const response = await api.post('/upload/reviews', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setReviewForm(prev => ({ ...prev, images: [...prev.images, ...(response.data.urls || [])] }));
            toast.success("Images uploaded");
            e.target.value = '';
        } catch (error) {
            toast.error("Failed to upload images");
            e.target.value = '';
        } finally {
            setUploadingImages(false);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            toast.error("Please login to submit a review");
            navigate("/login");
            return;
        }

        if (!reviewForm.rating || !reviewForm.comment.trim()) {
            toast.error("Please provide rating and comment");
            return;
        }

        try {
            const response = await api.post(`/products/${product._id}/review`, {
                rating: reviewForm.rating,
                comment: reviewForm.comment,
                images: reviewForm.images
            });
            toast.success(editingReviewId ? "Review updated" : "Review submitted");
            setReviewForm({ rating: 0, comment: "", images: [] });
            setEditingReviewId(null);
            if (response.data.product) {
                setProduct(response.data.product);
            } else {
                fetchProductDetails();
            }
        } catch (error) {
            toast.error("Failed to submit review");
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm("Delete your review?")) return;
        try {
            await api.delete(`/products/${product._id}/review/${reviewId}`);
            toast.success("Review deleted");
            fetchProductDetails();
        } catch (error) {
            toast.error("Failed to delete review");
        }
    };

    const handleEditReview = (review) => {
        setReviewForm({ rating: review.rating, comment: review.comment, images: review.images || [] });
        setEditingReviewId(review._id);
        document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth' });
    };

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 0; i < 5; i++) {
            if (i < Math.floor(rating)) {
                stars.push(<FaStar key={i} className="text-yellow-500" />);
            } else if (i === Math.floor(rating) && rating % 1 >= 0.5) {
                stars.push(<FaStarHalfAlt key={i} className="text-yellow-500" />);
            } else {
                stars.push(<FaRegStar key={i} className="text-gray-300" />);
            }
        }
        return stars;
    };

    const getCurrentPrice = () => {
        if (selectedPack) return selectedPack.packPrice;
        return product.discountPrice || product.price;
    };

    const getDiscount = () => {
        if (selectedPack && selectedPack.savingsPercent) return selectedPack.savingsPercent;
        if (product.discountPrice && product.discountPrice < product.price) {
            return Math.round(((product.price - product.discountPrice) / product.price) * 100);
        }
        return 0;
    };

    if (loading) {
        return (
            <>
                <PopUpModal />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5c2d16]"></div>
                </div>
            </>
        );
    }

    if (!product) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold mb-4">Product not found</h2>
                <button onClick={() => navigate("/products")} className="text-gray-600 hover:underline">
                    Back to Products
                </button>
            </div>
        );
    }

    const tabs = [
        { id: 'description', label: 'Description', show: true },
        { id: 'ingredients', label: 'Ingredients', show: product.ingredients?.length > 0 },
        { id: 'benefits', label: 'Benefits', show: product.benefits?.length > 0 },
        { id: 'usage', label: 'How to Use', show: product.dosage || product.howToUse?.length > 0 },
        { id: 'specifications', label: 'Specifications', show: true },
        { id: 'reviews', label: `Reviews (${product.numReviews || 0})`, show: true }
    ].filter(tab => tab.show);

    return (
        <>
            <PopUpModal />
            <Helmet>
                <title>{product?.metaTitle || `${product?.name} - Prolific Healing Herbs`}</title>
                <meta name="description" content={product?.metaDescription || product?.description} />
                {product?.keywords && <meta name="keywords" content={product.keywords.join(', ')} />}
            </Helmet>

            <div className="bg-white">
                {/* Breadcrumb */}
                <div className="border-b">
                    <div className="max-w-[99rem] mx-auto px-6 py-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <button onClick={() => navigate("/")} className="hover:text-[#5c2d16]">Home</button>
                            <span>/</span>
                            <button onClick={() => navigate("/products")} className="hover:text-[#5c2d16]">Products</button>
                            {product.category?.name && (
                                <>
                                    <span>/</span>
                                    <span className="text-[#5c2d16]">{product.category.name}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="max-w-[99rem] mx-auto px-6 py-8">
                    {/* Back Button */}
                    <button 
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-600 hover:text-[#5c2d16] mb-6 transition group"
                    >
                        <BsChevronLeft className="text-xl group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">Back</span>
                    </button>
                    {/* Main Product Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
                        {/* Images */}
                        <div className="relative lg:pr-80">
                            <div 
                                className="bg-gray-50 rounded-lg mb-4 aspect-square max-h-[600px] flex items-center justify-center cursor-zoom-in hover:bg-gray-100 transition group relative overflow-hidden"
                                onClick={() => {
                                    setLightboxIndex(selectedImageIndex);
                                    setLightboxOpen(true);
                                }}
                            >
                                <ImageMagnifier
                                    src={mainImage}
                                    alt={product.name}
                                    className="w-full h-full transition-transform"
                                />
                            </div>
                            
                            {/* Magnifier space indicator */}
                            
                            {product.images && product.images.length > 1 && (
                                <div className="grid grid-cols-5 gap-2">
                                    {product.images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => { setMainImage(img); setSelectedImageIndex(idx); }}
                                            className={`border-2 rounded overflow-hidden aspect-square ${
                                                selectedImageIndex === idx ? 'border-[#5c2d16]' : 'border-gray-200 hover:border-gray-400'
                                            }`}
                                        >
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div>
                            <h1 className="text-3xl font-bold text-[#5c2d16] mb-3">{product.name}</h1>
                            
                            {/* Rating */}
                            {product.averageRating > 0 && (
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="flex">{renderStars(product.averageRating)}</div>
                                    <span className="text-sm text-gray-600">
                                        {product.averageRating.toFixed(1)} ({product.numReviews} reviews)
                                    </span>
                                </div>
                            )}

                            {/* Price */}
                            <div className="mb-6">
                                <div className="flex items-baseline gap-3 mb-2">
                                    <span className="text-4xl font-bold text-[#5c2d16]">₹{getCurrentPrice()}</span>
                                    {product.discountPrice && product.discountPrice < product.price && (
                                        <span className="text-xl text-gray-400 line-through">₹{product.price}</span>
                                    )}
                                </div>
                                {getDiscount() > 0 && (
                                    <span className="text-green-600 font-medium">{getDiscount()}% off</span>
                                )}
                            </div>

                            {/* Description */}
                            <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>

                            {/* Certifications */}
                            {product.certification && product.certification.length > 0 && (
                                <div className="flex items-center gap-4 mb-6 pb-6 border-b">
                                    <BsShieldCheck className="text-gray-600 text-xl" />
                                    <div className="flex flex-wrap gap-2">
                                        {product.certification.map((cert, idx) => (
                                            <span key={idx} className="text-xs bg-gray-50 text-gray-700 px-3 py-1 rounded-full font-medium">
                                                {cert.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Pack Options */}
                            {product.packOptions && product.packOptions.length > 0 && (
                                <div className="mb-6">
                                    <p className="text-sm font-semibold text-[#5c2d16] mb-3">Select Size:</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        <button
                                            onClick={() => setSelectedPack(null)}
                                            className={`border-2 rounded-lg p-4 text-left transition-all ${
                                                !selectedPack ? 'border-[#5c2d16] bg-gray-50' : 'border-gray-200 hover:border-gray-400'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                                    <span className="text-lg font-bold text-gray-600">1</span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">Single</p>
                                                    <p className="text-lg font-bold">₹{product.discountPrice || product.price}</p>
                                                </div>
                                            </div>
                                        </button>
                                        {product.packOptions.map((pack, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedPack(pack)}
                                                className={`relative border-2 rounded-lg p-4 text-left transition-all ${
                                                    selectedPack === pack ? 'border-[#5c2d16] bg-gray-50' : 'border-gray-200 hover:border-gray-400'
                                                }`}
                                            >
                                                {pack.savingsPercent > 0 && (
                                                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                                                        -{pack.savingsPercent}%
                                                    </span>
                                                )}
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                                        {pack.image ? (
                                                            <img
                                                                src={pack.image}
                                                                alt={pack.label || `Pack of ${pack.packSize}`}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                                                                <span className="text-lg font-bold text-gray-600">{pack.packSize}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-medium text-sm">{pack.label || `Pack of ${pack.packSize}`}</p>
                                                        <p className="text-lg font-bold">₹{pack.packPrice}</p>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Shipping */}
                            {product.freeShipping ? (
                                <div className="flex items-center gap-2 mb-6 text-green-700">
                                    <BsTruck className="text-xl" />
                                    <span className="font-medium">Free Shipping</span>
                                </div>
                            ) : product.minOrderForFreeShipping > 0 && (
                                <div className="flex items-center gap-2 mb-6 text-gray-600">
                                    <BsTruck className="text-xl" />
                                    <span className="text-sm">Free shipping on orders above ₹{product.minOrderForFreeShipping}</span>
                                </div>
                            )}

                            {/* Stock */}
                            <p className={`text-sm font-medium mb-6 ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                            </p>

                            {/* Quantity & Add to Cart */}
                            {product.stock > 0 && (
                                <div>
                                    {!selectedPack && (
                                        <div className="flex items-center gap-4 mb-4">
                                            <p className="text-sm font-medium text-gray-700">Quantity:</p>
                                            <div className="flex items-center border border-gray-300 rounded">
                                                <button
                                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                    className="px-4 py-2 hover:bg-gray-100"
                                                >
                                                    −
                                                </button>
                                                <span className="px-6 py-2 border-x border-gray-300 font-medium">{quantity}</span>
                                                <button
                                                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                                    className="px-4 py-2 hover:bg-gray-100"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={handleAddToCart}
                                        className="w-full bg-[#5c2d16] hover:bg-gray-800 text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
                                    >
                                        <BsCartPlus className="text-xl" />
                                        Add to Cart
                                    </button>
                                </div>
                            )}

                            {/* Key Info Grid */}
                            {(product.manufacturer || product.origin || product.formulation) && (
                                <div className="mt-8 pt-8 border-t">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        {product.manufacturer && (
                                            <div>
                                                <p className="text-gray-500">Brand</p>
                                                <p className="font-semibold text-[#5c2d16]">{product.manufacturer}</p>
                                            </div>
                                        )}
                                        {product.origin && (
                                            <div>
                                                <p className="text-gray-500">Origin</p>
                                                <p className="font-semibold text-[#5c2d16]">{product.origin}</p>
                                            </div>
                                        )}
                                        {product.formulation && (
                                            <div>
                                                <p className="text-gray-500">Form</p>
                                                <p className="font-semibold text-[#5c2d16]">{product.formulation}</p>
                                            </div>
                                        )}
                                        {product.shelfLife && (
                                            <div>
                                                <p className="text-gray-500">Shelf Life</p>
                                                <p className="font-semibold text-[#5c2d16]">{product.shelfLife}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Coupon Claim Section */}
                    {activeCoupons.length > 0 && (
                        <div className="mb-12">
                            <div className="border border-gray-200 rounded-lg p-8 bg-white">
                                <div className="max-w-2xl mx-auto">
                                    <div className="text-center mb-8">
                                        <h2 className="text-2xl font-bold text-[#5c2d16] mb-2">
                                            Get Extra {activeCoupons[0]?.discountType === 'percentage' 
                                                ? `${activeCoupons[0]?.discountValue}% OFF` 
                                                : `₹${activeCoupons[0]?.discountValue} OFF`}
                                        </h2>
                                        <p className="text-gray-600">
                                            Enter your phone number to receive your discount coupon
                                        </p>
                                    </div>

                                    {!claimedCoupon ? (
                                        <form onSubmit={handleClaimCoupon} className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-medium text-[#5c2d16] mb-2">
                                                    Phone Number
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="tel"
                                                        value={phoneNumber}
                                                        onChange={(e) => {
                                                            const newPhone = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                            setPhoneNumber(newPhone);
                                                            setCouponError(''); // Clear error when user types
                                                            validatePhoneNumber(newPhone);
                                                        }}
                                                        placeholder="Enter 10-digit mobile number"
                                                        className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 text-lg ${
                                                            couponError 
                                                                ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                                                                : phoneValidation.isValid
                                                                ? 'border-green-500 focus:ring-green-500 focus:border-green-500'
                                                                : phoneNumber.length > 0 && !phoneValidation.isValid
                                                                ? 'border-red-300 focus:ring-red-300 focus:border-red-300'
                                                                : 'border-gray-300 focus:ring-[#5c2d16] focus:border-transparent'
                                                        }`}
                                                        required
                                                        maxLength="10"
                                                    />
                                                    {phoneNumber.length > 0 && (
                                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                            {phoneValidation.isValid ? (
                                                                <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                </svg>
                                                            ) : (
                                                                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                {couponError && (
                                                    <p className="mt-2 text-sm text-red-600">
                                                        {couponError}
                                                    </p>
                                                )}
                                                {!couponError && phoneValidation.message && (
                                                    <p className={`mt-2 text-sm ${phoneValidation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                                                        {phoneValidation.message}
                                                    </p>
                                                )}
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={claimingCoupon || !phoneValidation.isValid}
                                                className="w-full bg-[#5c2d16] text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                                            >
                                                {claimingCoupon ? 'Getting Your Coupon...' : 'Get Coupon'}
                                            </button>
                                        </form>
                                    ) : (
                                        <div className="border-2 border-[#5c2d16] rounded-lg p-8">
                                            <div className="text-center space-y-4">
                                                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#5c2d16] text-white rounded-full text-2xl mb-2">
                                                    ✓
                                                </div>
                                                <h3 className="text-xl font-bold text-[#5c2d16]">
                                                    Your Coupon Code
                                                </h3>
                                                <div 
                                                    className="inline-block border-2 border-[#5c2d16] rounded-lg px-8 py-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(claimedCoupon.code);
                                                        toast.success('Coupon code copied!');
                                                    }}
                                                    title="Click to copy"
                                                >
                                                    <p className="text-3xl font-bold text-[#5c2d16] tracking-wider font-mono">
                                                        {claimedCoupon.code}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-2">Click to copy</p>
                                                </div>
                                                <div className="pt-4 space-y-2">
                                                    <p className="text-lg font-semibold text-[#5c2d16]">
                                                        {claimedCoupon.discountType === 'percentage' 
                                                            ? `Get ${claimedCoupon.discountValue}% OFF` 
                                                            : `Get ₹${claimedCoupon.discountValue} OFF`}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {claimedCoupon.description}
                                                    </p>
                                                    {claimedCoupon.minPurchaseAmount > 0 && (
                                                        <p className="text-sm text-gray-600">
                                                            Minimum purchase: ₹{claimedCoupon.minPurchaseAmount}
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-gray-500 pt-2">
                                                        Valid until: {new Date(claimedCoupon.validUntil).toLocaleDateString('en-IN', { 
                                                            day: 'numeric', 
                                                            month: 'long', 
                                                            year: 'numeric' 
                                                        })}
                                                    </p>
                                                </div>
                                                <div className="pt-4 border-t border-gray-200">
                                                    <p className="text-sm text-gray-700 font-medium mb-3">
                                                        Copy this code and apply it at checkout
                                                    </p>
                                                    <button
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(claimedCoupon.code);
                                                            toast.success('Copied to clipboard!');
                                                        }}
                                                        className="bg-[#5c2d16] text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition text-sm font-medium"
                                                    >
                                                        Copy Code
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Bundles & Free Products */}
                    {((product.bundleWith && product.bundleWith.length > 0 && bundleProducts.length > 0) ||
                      (product.freeProducts && product.freeProducts.length > 0 && freeProductsData.length > 0)) && (
                        <div className="mb-12">
                            {/* Bundle Products */}
                            {product.bundleWith && product.bundleWith.length > 0 && bundleProducts.length > 0 && (
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-[#5c2d16] mb-6"> Add for better results</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {product.bundleWith.map((bundle, idx) => {
                                            const bundleProduct = bundleProducts.find(p => p._id === bundle.product || p._id === bundle.product?._id);
                                            if (!bundleProduct) return null;

                                            return (
                                                <div key={idx} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
                                                    <div className="flex gap-4 mb-4">
                                                        <img
                                                            src={bundleProduct.images?.[0]}
                                                            alt={bundleProduct.name}
                                                            className="w-24 h-24 object-cover rounded"
                                                        />
                                                        <div className="flex-1">
                                                            <h3 className="font-semibold text-[#5c2d16] mb-2 line-clamp-2">{bundleProduct.name}</h3>
                                                            <div className="flex items-baseline gap-2">
                                                                <span className="text-2xl font-bold text-[#5c2d16]">₹{bundle.bundlePrice}</span>
                                                                {bundle.savingsAmount > 0 && (
                                                                    <span className="text-sm text-green-600 font-medium">Save ₹{bundle.savingsAmount}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            if (!isAuthenticated) {
                                                                toast.error("Please login");
                                                                navigate("/login");
                                                                return;
                                                            }
                                                            if (product.stock <= 0 || bundleProduct.stock <= 0) {
                                                                toast.error("Out of stock");
                                                                return;
                                                            }
                                                            try {
                                                                await addToCart(product._id, 1);
                                                                await addToCart(bundleProduct._id, 1);
                                                                toast.success("Bundle added to cart");
                                                            } catch (error) {
                                                                // Handled in context
                                                            }
                                                        }}
                                                        className="w-full bg-[#5c2d16] hover:bg-gray-800 text-white py-3 rounded-lg font-semibold transition"
                                                    >
                                                        Add Bundle to Cart
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Free Products */}
                            {product.freeProducts && product.freeProducts.length > 0 && freeProductsData.length > 0 && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                                    <h2 className="text-xl font-bold text-[#5c2d16] mb-4">Special Offer</h2>
                                    {product.freeProducts.map((free, idx) => {
                                        const freeProduct = freeProductsData.find(p => p._id === free.product || p._id === free.product?._id);
                                        if (!freeProduct) return null;

                                        return (
                                            <div key={idx} className="bg-white rounded-lg p-4 mb-4">
                                                <div className="flex gap-4">
                                                    <img
                                                        src={freeProduct.images?.[0]}
                                                        alt={freeProduct.name}
                                                        className="w-20 h-20 object-cover rounded"
                                                    />
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-[#5c2d16] mb-2">{freeProduct.name}</p>
                                                        <p className="text-sm text-green-700 font-medium">
                                                            Buy {free.minQuantity} → Get {free.quantity} Free
                                                        </p>
                                                        <p className="text-sm text-gray-500 line-through">Worth ₹{freeProduct.price}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="border-t mb-12">
                        <div className="flex gap-8 border-b overflow-x-auto">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`py-4 font-medium text-sm whitespace-nowrap border-b-2 transition ${
                                        activeTab === tab.id
                                            ? 'border-[#5c2d16] text-[#5c2d16]'
                                            : 'border-transparent text-gray-500 hover:text-[#5c2d16]'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="py-8">
                            {/* Description Tab */}
                            {activeTab === 'description' && (
                                <div className="prose max-w-none">
                                    <p className="text-gray-700 leading-relaxed mb-6">{product.description}</p>
                                    {product.attributes && Object.keys(product.attributes).length > 0 && (
                                        <div>
                                            <h3 className="text-lg font-bold mb-4">Product Details</h3>
                                            <dl className="grid grid-cols-2 gap-4">
                                                {Object.entries(product.attributes).map(([key, value]) => (
                                                    <div key={key} className="border-b pb-2">
                                                        <dt className="text-sm text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</dt>
                                                        <dd className="text-sm font-medium text-[#5c2d16]">{value}</dd>
                                                    </div>
                                                ))}
                                            </dl>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Ingredients Tab */}
                            {activeTab === 'ingredients' && product.ingredients && product.ingredients.length > 0 && (
                                <div>
                                    <h3 className="text-xl font-bold mb-6">Ingredients</h3>
                                    <div className="space-y-6 max-w-3xl">
                                        {product.ingredients.map((item, idx) => (
                                            <div key={idx} className="flex gap-6 items-start border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                                                {item.image && (
                                                    <div className="flex-shrink-0">
                                                        <img 
                                                            src={item.image} 
                                                            alt={item.name} 
                                                            className="w-24 h-24 rounded-full object-cover border-4 border-gray-100"
                                                        />
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-[#5c2d16] mb-2 text-lg">{item.name}</h4>
                                                    <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Benefits Tab */}
                            {activeTab === 'benefits' && product.benefits && product.benefits.length > 0 && (
                                <div>
                                    <h3 className="text-xl font-bold mb-6">Health Benefits</h3>
                                    <div className="space-y-6 max-w-3xl">
                                        {product.benefits.map((item, idx) => (
                                            <div key={idx} className="flex gap-6 items-start border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                                                {item.image && (
                                                    <div className="flex-shrink-0">
                                                        <img 
                                                            src={item.image} 
                                                            alt={item.name} 
                                                            className="w-20 h-20 rounded-full object-cover border-4 border-green-100"
                                                        />
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-[#5c2d16] mb-2 text-lg">{item.name}</h4>
                                                    <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Usage Tab */}
                            {activeTab === 'usage' && (product.dosage || product.howToUse?.length > 0) && (
                                <div>
                                    {product.dosage && (
                                        <div className="bg-gray-50 border-l-4 border-gray-600 p-6 rounded mb-8">
                                            <p className="font-bold text-[#5c2d16] mb-2">Dosage</p>
                                            <p className="text-gray-700">{product.dosage}</p>
                                        </div>
                                    )}

                                    {product.howToUse && product.howToUse.length > 0 && (
                                        <div className="mb-8">
                                            <h4 className="font-bold mb-4">How to Use</h4>
                                            <div className="space-y-4">
                                                {product.howToUse.map((step, idx) => (
                                                    <div key={idx} className="flex gap-4 border border-gray-200 rounded-lg p-4">
                                                        <div className="w-8 h-8 bg-[#5c2d16] text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                                                            {idx + 1}
                                                        </div>
                                                        {step.image && (
                                                            <img src={step.image} alt={step.name} className="w-20 h-20 object-cover rounded" />
                                                        )}
                                                        <div>
                                                            <p className="font-semibold text-[#5c2d16] mb-1">{step.name}</p>
                                                            <p className="text-sm text-gray-600">{step.description}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {product.howToConsume && product.howToConsume.length > 0 && (
                                        <div className="mb-8">
                                            <h4 className="font-bold mb-4">Consumption Methods</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                {product.howToConsume.map((method, idx) => (
                                                    <div key={idx} className="border border-gray-200 rounded-lg p-4">
                                                        <p className="font-semibold text-[#5c2d16] mb-1">{method.name}</p>
                                                        <p className="text-sm text-gray-600">{method.description}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {product.storageInstructions && (
                                        <div className="bg-yellow-50 border-l-4 border-yellow-600 p-6 rounded">
                                            <p className="font-bold text-[#5c2d16] mb-2">Storage</p>
                                            <p className="text-gray-700">{product.storageInstructions}</p>
                                        </div>
                                    )}

                                    {product.contraindications && product.contraindications.length > 0 && (
                                        <div className="mt-8">
                                            <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded mb-6">
                                                <p className="font-bold text-red-900 mb-2">⚠️ Precautions</p>
                                                <p className="text-red-800 text-sm">Please read carefully and consult your healthcare provider if needed.</p>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {product.contraindications.map((item, idx) => (
                                                    <div key={idx} className="border border-red-200 rounded-lg p-4 bg-red-50">
                                                        <p className="font-bold text-red-900 mb-1">{item.name}</p>
                                                        <p className="text-sm text-red-800">{item.description}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Specifications Tab */}
                            {activeTab === 'specifications' && (
                                <div>
                                    <h3 className="text-xl font-bold mb-6">Specifications</h3>
                                    <dl className="grid grid-cols-2 gap-x-8 gap-y-4">
                                        {product.manufacturer && (
                                            <>
                                                <dt className="text-sm text-gray-500">Manufacturer</dt>
                                                <dd className="text-sm font-medium text-[#5c2d16]">{product.manufacturer}</dd>
                                            </>
                                        )}
                                        {product.origin && (
                                            <>
                                                <dt className="text-sm text-gray-500">Origin</dt>
                                                <dd className="text-sm font-medium text-[#5c2d16]">{product.origin}</dd>
                                            </>
                                        )}
                                        {product.formulation && (
                                            <>
                                                <dt className="text-sm text-gray-500">Form</dt>
                                                <dd className="text-sm font-medium text-[#5c2d16]">{product.formulation}</dd>
                                            </>
                                        )}
                                        {product.potency && (
                                            <>
                                                <dt className="text-sm text-gray-500">Potency</dt>
                                                <dd className="text-sm font-medium text-[#5c2d16]">{product.potency}</dd>
                                            </>
                                        )}
                                        {product.shelfLife && (
                                            <>
                                                <dt className="text-sm text-gray-500">Shelf Life</dt>
                                                <dd className="text-sm font-medium text-[#5c2d16]">{product.shelfLife}</dd>
                                            </>
                                        )}
                                        {product.processingMethod && (
                                            <>
                                                <dt className="text-sm text-gray-500">Processing Method</dt>
                                                <dd className="text-sm font-medium text-[#5c2d16]">{product.processingMethod}</dd>
                                            </>
                                        )}
                                        {product.batchNumber && (
                                            <>
                                                <dt className="text-sm text-gray-500">Batch Number</dt>
                                                <dd className="text-sm font-medium text-[#5c2d16]">{product.batchNumber}</dd>
                                            </>
                                        )}
                                        {product.expiryDate && (
                                            <>
                                                <dt className="text-sm text-gray-500">Expiry Date</dt>
                                                <dd className="text-sm font-medium text-[#5c2d16]">{new Date(product.expiryDate).toLocaleDateString()}</dd>
                                            </>
                                        )}
                                        {product.attributes && Object.entries(product.attributes).map(([key, value]) => (
                                            <React.Fragment key={key}>
                                                <dt className="text-sm text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</dt>
                                                <dd className="text-sm font-medium text-[#5c2d16]">{value}</dd>
                                            </React.Fragment>
                                        ))}
                                    </dl>

                                    {/* Suitability */}
                                    {((product.ageGroup && product.ageGroup.length > 0) ||
                                      (product.gender && product.gender.length > 0) ||
                                      (product.season && product.season.length > 0) ||
                                      (product.timeOfDay && product.timeOfDay.length > 0)) && (
                                        <div className="mt-8 pt-8 border-t">
                                            <h4 className="font-bold mb-4">Suitable For</h4>
                                            <div className="grid grid-cols-4 gap-4">
                                                {product.ageGroup && product.ageGroup.length > 0 && (
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-2">Age Group</p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {product.ageGroup.map((item, i) => (
                                                                <span key={i} className="bg-gray-100 px-2 py-1 rounded text-xs">{item}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {product.gender && product.gender.length > 0 && (
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-2">Gender</p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {product.gender.map((item, i) => (
                                                                <span key={i} className="bg-gray-100 px-2 py-1 rounded text-xs">{item}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {product.season && product.season.length > 0 && (
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-2">Season</p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {product.season.map((item, i) => (
                                                                <span key={i} className="bg-gray-100 px-2 py-1 rounded text-xs">{item}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {product.timeOfDay && product.timeOfDay.length > 0 && (
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-2">Best Time</p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {product.timeOfDay.map((item, i) => (
                                                                <span key={i} className="bg-gray-100 px-2 py-1 rounded text-xs">{item}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Reviews Tab */}
                            {activeTab === 'reviews' && (
                                <div>
                                    {/* Rating Summary */}
                                    {product.ratingStats && product.ratingStats.totalReviews > 0 && (
                                        <div className="bg-gray-50 p-6 rounded-lg mb-8">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="text-center">
                                                    <div className="text-5xl font-bold mb-2">{product.ratingStats.averageRating.toFixed(1)}</div>
                                                    <div className="flex justify-center mb-2">{renderStars(product.ratingStats.averageRating)}</div>
                                                    <p className="text-sm text-gray-600">{product.ratingStats.totalReviews} reviews</p>
                                                </div>
                                                <div>
                                                    {[5, 4, 3, 2, 1].map((star) => (
                                                        <div key={star} className="flex items-center gap-3 mb-2">
                                                            <span className="text-sm w-12">{star} star</span>
                                                            <div className="flex-1 bg-gray-200 h-2 rounded-full">
                                                                <div 
                                                                    className="bg-yellow-500 h-full rounded-full" 
                                                                    style={{ width: `${product.ratingStats.distributionPercentage[star] || 0}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-sm w-12 text-right">{product.ratingStats.distribution[star] || 0}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Reviews List */}
                                    {product.reviews && product.reviews.length > 0 ? (
                                        <div className="mb-8">
                                            {product.reviews.map(review => (
                                                <ReviewCard
                                                    key={review._id}
                                                    review={review}
                                                    user={user}
                                                    isAuthenticated={isAuthenticated}
                                                    onEdit={handleEditReview}
                                                    onDelete={handleDeleteReview}
                                                    renderStars={renderStars}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 mb-8">No reviews yet</p>
                                    )}

                                    {/* Write Review */}
                                    <div id="review-form" className="border-t pt-8">
                                        <h3 className="text-xl font-bold mb-6">Write a Review</h3>
                                        <form onSubmit={handleReviewSubmit} className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Rating</label>
                                                <div className="flex gap-1">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button
                                                            type="button"
                                                            key={star}
                                                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                                        >
                                                            {star <= reviewForm.rating ? (
                                                                <BsStarFill className="text-yellow-500 text-2xl" />
                                                            ) : (
                                                                <BsStar className="text-gray-300 text-2xl" />
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2">Review</label>
                                                <textarea
                                                    value={reviewForm.comment}
                                                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                                    rows={4}
                                                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#5c2d16] focus:border-transparent"
                                                    placeholder="Share your experience..."
                                                    required
                                                />
                                            </div>

                                            {/* Image Upload */}
                                            {reviewForm.images.length < 5 && (
                                                <div>
                                                    <input
                                                        type="file"
                                                        id="review-images"
                                                        multiple
                                                        accept="image/*"
                                                        onChange={handleImageUpload}
                                                        className="hidden"
                                                        disabled={uploadingImages}
                                                    />
                                                    <label
                                                        htmlFor="review-images"
                                                        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                                                    >
                                                        <BsImage />
                                                        {uploadingImages ? 'Uploading...' : 'Add Photos'}
                                                    </label>
                                                </div>
                                            )}

                                            {reviewForm.images.length > 0 && (
                                                <div className="flex gap-2">
                                                    {reviewForm.images.map((img, idx) => (
                                                        <div key={idx} className="relative">
                                                            <img src={img} alt="" className="w-20 h-20 object-cover rounded" />
                                                            <button
                                                                type="button"
                                                                onClick={() => setReviewForm(prev => ({
                                                                    ...prev,
                                                                    images: prev.images.filter((_, i) => i !== idx)
                                                                }))}
                                                                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                                                            >
                                                                <BsX />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <button
                                                type="submit"
                                                disabled={uploadingImages}
                                                className="bg-[#5c2d16] hover:bg-gray-800 text-white px-8 py-3 rounded-lg font-semibold disabled:bg-gray-400 transition"
                                            >
                                                Submit Review
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* FAQs */}
                    {product.faq && product.faq.length > 0 && (
                        <div className="mb-12">
                            <h2 className="text-2xl font-bold text-[#5c2d16] mb-6">Frequently Asked Questions</h2>
                            <div className="space-y-3">
                                {product.faq.map((faq, idx) => (
                                    <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                                        <button
                                            onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                                            className="w-full px-6 py-4 flex justify-between items-center text-left hover:bg-gray-50 transition"
                                        >
                                            <span className="font-semibold text-[#5c2d16]">{faq.question}</span>
                                            <span className={`transform transition ${faqOpen === idx ? 'rotate-180' : ''}`}>
                                                ▼
                                            </span>
                                        </button>
                                        {faqOpen === idx && (
                                            <div className="px-6 py-4 border-t bg-gray-50 text-gray-700">
                                                {faq.answer}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Related Products */}
                    {relatedProducts.length > 0 && (
                        <div>
                            <h2 className="text-2xl font-bold text-[#5c2d16] mb-6">You May Also Like</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                                {relatedProducts.map((item) => (
                                    <div
                                        key={item._id}
                                        onClick={() => navigate(`/products/${item.slug || item._id}`)}
                                        className="border border-gray-200 rounded-lg cursor-pointer hover:shadow-lg transition"
                                    >
                                        <div className="h-48 flex items-center justify-center bg-gray-50 rounded-t-lg">
                                            <img src={item.images?.[0]} alt={item.name} className="max-h-full max-w-full object-contain p-4" />
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-medium text-[#5c2d16] mb-2 line-clamp-2 text-sm">{item.name}</h3>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-[#5c2d16]">₹{item.discountPrice || item.price}</span>
                                                {item.discountPrice && item.discountPrice < item.price && (
                                                    <span className="text-sm text-gray-400 line-through">₹{item.price}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Image Lightbox */}
            {lightboxOpen && product.images && (
                <ImageLightbox
                    images={product.images}
                    currentIndex={lightboxIndex}
                    onClose={() => setLightboxOpen(false)}
                    onNext={() => setLightboxIndex((prev) => (prev + 1) % product.images.length)}
                    onPrev={() => setLightboxIndex((prev) => (prev - 1 + product.images.length) % product.images.length)}
                />
            )}
        </>
    );
};

export default ProductDetails;

