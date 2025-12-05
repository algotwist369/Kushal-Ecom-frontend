import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { 
    BsCartPlus, BsStarFill, BsStar, BsX, BsImage, BsChevronLeft, BsChevronRight,
    BsShieldCheck, BsTruck, BsGift, BsInfoCircle, BsCheckCircle, BsHeart
} from "react-icons/bs";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import api from "../../api/axiosConfig";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";

// Image Lightbox Modal
const ImageLightbox = ({ images, currentIndex, onClose, onNext, onPrev }) => {
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center p-4" onClick={onClose}>
            <div className="relative max-w-[99rem] w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-200 transition z-10 shadow-lg"
                >
                    <BsX className="text-3xl text-gray-800" />
                </button>

                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                    {currentIndex + 1} / {images.length}
                </div>

                <img
                    src={images[currentIndex]}
                    alt={`Photo ${currentIndex + 1}`}
                    className="max-h-[90vh] max-w-full object-contain rounded-lg"
                />

                {images.length > 1 && (
                    <>
                        <button
                            onClick={onPrev}
                            className="absolute left-4 bg-white rounded-full p-4 shadow-2xl hover:bg-gray-100 transition"
                        >
                            <BsChevronLeft className="text-2xl text-gray-800" />
                        </button>
                        <button
                            onClick={onNext}
                            className="absolute right-4 bg-white rounded-full p-4 shadow-2xl hover:bg-gray-100 transition"
                        >
                            <BsChevronRight className="text-2xl text-gray-800" />
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
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                            {review.user?.name?.[0]?.toUpperCase() || 'A'}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold text-[#5c2d16]">{review.user?.name || 'Anonymous'}</p>
                                {review.user?._id === user?._id && (
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">You</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-0.5">{renderStars(review.rating)}</div>
                                <span className="text-sm text-gray-400">•</span>
                                <p className="text-sm text-gray-500">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {isAuthenticated && (user?._id === review.user?._id || user?.role === 'admin') && (
                        <div className="flex items-center gap-2">
                            <button onClick={() => onEdit(review)} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium">
                                Edit
                            </button>
                            <button onClick={() => onDelete(review._id)} className="px-4 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition font-medium">
                                Delete
                            </button>
                        </div>
                    )}
                </div>

                <p className="text-gray-700 leading-relaxed mb-4">{review.comment}</p>

                {review.images && review.images.length > 0 && (
                    <div className="pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-600 mb-3 font-medium flex items-center gap-2">
                            <BsImage className="text-green-600" />
                            Customer Photos ({review.images.length})
                        </p>
                        <div className="grid grid-cols-5 gap-2">
                            {review.images.map((img, idx) => (
                                <div
                                    key={idx}
                                    className="relative group cursor-pointer rounded-lg overflow-hidden bg-gray-100 aspect-square hover:ring-2 hover:ring-green-500 transition"
                                    onClick={() => { setLightboxIndex(idx); setLightboxOpen(true); }}
                                >
                                    <img src={img} alt={`Review ${idx + 1}`} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition flex items-center justify-center">
                                        <BsImage className="text-white opacity-0 group-hover:opacity-100 transition text-xl" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {lightboxOpen && review.images && (
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
    const [activeTab, setActiveTab] = useState('overview');
    const [faqOpen, setFaqOpen] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedPack, setSelectedPack] = useState(null);
    const [reviewForm, setReviewForm] = useState({ rating: 0, comment: "", images: [] });
    const [editingReviewId, setEditingReviewId] = useState(null);
    const [uploadingImages, setUploadingImages] = useState(false);

    useEffect(() => {
        fetchProductDetails();
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
            
            // Fetch free products if freeProducts exists
            if (response.data.freeProducts && response.data.freeProducts.length > 0) {
                fetchFreeProducts(response.data.freeProducts);
            }
        } catch (error) {
            console.error("Error fetching product:", error);
            toast.error("Failed to load product details");
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
            const productIds = bundles.map(b => {
                return typeof b.product === 'object' ? b.product._id : b.product;
            }).filter(Boolean);
            
            if (productIds.length > 0) {
                const promises = productIds.map(id => 
                    api.get(`/products/${id}`).catch(err => {
                        console.error(`Failed to fetch bundle product ${id}:`, err);
                        return null;
                    })
                );
                const responses = await Promise.all(promises);
                const products = responses.filter(r => r !== null).map(r => r.data);
                setBundleProducts(products);
            }
        } catch (error) {
            console.error("Error fetching bundle products:", error);
        }
    };

    const fetchFreeProducts = async (freeOffers) => {
        try {
            const productIds = freeOffers.map(f => {
                return typeof f.product === 'object' ? f.product._id : f.product;
            }).filter(Boolean);
            
            if (productIds.length > 0) {
                const promises = productIds.map(id => 
                    api.get(`/products/${id}`).catch(err => {
                        console.error(`Failed to fetch free product ${id}:`, err);
                        return null;
                    })
                );
                const responses = await Promise.all(promises);
                const products = responses.filter(r => r !== null).map(r => r.data);
                setFreeProductsData(products);
            }
        } catch (error) {
            console.error("Error fetching free products:", error);
        }
    };

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            toast.error("Please login to add items to cart");
            navigate("/signup");
            return;
        }

        if (product.stock <= 0) {
            toast.error("Product is out of stock");
            return;
        }

        const finalQuantity = selectedPack ? selectedPack.packSize : quantity;
        const packInfo = selectedPack ? {
            packSize: selectedPack.packSize,
            packPrice: selectedPack.packPrice || getCurrentPrice(),
            savingsPercent: selectedPack.savingsPercent,
            label: selectedPack.label
        } : null;

        try {
            await addToCart(product._id, finalQuantity, packInfo);
            toast.success("Added to cart successfully!");
            setQuantity(1);
            setSelectedPack(null);
        } catch (error) {
            // Error handled in cart context
        }
    };

    const getCurrentPrice = () => {
        if (selectedPack) {
            return selectedPack.packPrice || (product.discountPrice || product.price) * selectedPack.packSize;
        }
        return product.discountPrice || product.price;
    };

    const getSavings = () => {
        if (selectedPack && selectedPack.savingsPercent) {
            return selectedPack.savingsPercent;
        }
        if (product.discountPrice && product.discountPrice < product.price) {
            return Math.round(((product.price - product.discountPrice) / product.price) * 100);
        }
        return 0;
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        if (reviewForm.images.length + files.length > 5) {
            toast.error("Maximum 5 images allowed per review");
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

            const uploadedUrls = response.data.urls || [];
            setReviewForm(prev => ({
                ...prev,
                images: [...prev.images, ...uploadedUrls]
            }));

            toast.success(`${uploadedUrls.length} image(s) uploaded successfully`);
            e.target.value = '';
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to upload images");
            e.target.value = '';
        } finally {
            setUploadingImages(false);
        }
    };

    const removeImage = (indexToRemove) => {
        setReviewForm(prev => ({
            ...prev,
            images: prev.images.filter((_, idx) => idx !== indexToRemove)
        }));
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
            
            toast.success(editingReviewId ? "Review updated successfully" : "Review submitted successfully");
            setReviewForm({ rating: 0, comment: "", images: [] });
            setEditingReviewId(null);
            
            if (response.data.product) {
                setProduct(response.data.product);
            } else {
                fetchProductDetails();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to submit review");
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm("Are you sure you want to delete your review?")) return;

        try {
            await api.delete(`/products/${product._id}/review/${reviewId}`);
            toast.success("Review deleted successfully");
            fetchProductDetails();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete review");
        }
    };

    const handleEditReview = (review) => {
        setReviewForm({
            rating: review.rating,
            comment: review.comment,
            images: review.images || []
        });
        setEditingReviewId(review._id);
        document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth' });
    };

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<FaStar key={i} className="text-yellow-400" />);
            } else if (i === fullStars && hasHalfStar) {
                stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
            } else {
                stars.push(<FaRegStar key={i} className="text-gray-300" />);
            }
        }
        return stars;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading product details...</p>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4 text-[#5c2d16]">Product not found</h2>
                    <button onClick={() => navigate("/products")} className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition">
                        Back to Products
                    </button>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'overview', label: 'Overview', icon: BsInfoCircle },
        { id: 'ingredients', label: 'Ingredients', show: product.ingredients?.length > 0 },
        { id: 'benefits', label: 'Benefits', show: product.benefits?.length > 0 },
        { id: 'usage', label: 'How to Use', show: product.dosage || product.howToUse?.length > 0 },
        { id: 'safety', label: 'Safety', show: product.contraindications?.length > 0 },
        { id: 'reviews', label: `Reviews (${product.numReviews || 0})` }
    ].filter(tab => tab.show !== false);

    return (
        <>
            <Helmet>
                <title>{product?.metaTitle || `${product?.name} - Prolific Healing Herbs`}</title>
                <meta name="description" content={product?.metaDescription || product?.description} />
                {product?.keywords && <meta name="keywords" content={product.keywords.join(', ')} />}
            </Helmet>

            <div className="bg-gray-50 min-h-screen">
                {/* Breadcrumb */}
                <div className="bg-white border-b shadow-sm">
                    <div className="max-w-[99rem] mx-auto px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <button onClick={() => navigate("/")} className="hover:text-green-600 transition font-medium">Home</button>
                            <span>/</span>
                            <button onClick={() => navigate("/products")} className="hover:text-green-600 transition font-medium">Products</button>
                            {product.category?.name && (
                                <>
                                    <span>/</span>
                                    <span className="text-[#5c2d16] font-semibold">{product.category.name}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="max-w-[99rem] mx-auto px-6 py-12">
                    {/* Main Product Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* Left: Image Gallery */}
                        <div className="bg-white rounded-2xl p-6 shadow-md">
                            <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl mb-4 flex items-center justify-center overflow-hidden" style={{ height: '500px' }}>
                                <img
                                    src={mainImage}
                                    alt={product.name}
                                    className="max-w-full max-h-full object-contain p-8 hover:scale-105 transition-transform duration-300"
                                />
                                
                                {/* Badges */}
                                {product.isOnOffer && (
                                    <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                                        SPECIAL OFFER
                                    </div>
                                )}
                                {product.freeShipping && (
                                    <div className="absolute top-4 left-4 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                                        <BsTruck /> FREE SHIPPING
                                    </div>
                                )}
                            </div>

                            {product.images && product.images.length > 1 && (
                                <div className="grid grid-cols-4 gap-3">
                                    {product.images.map((img, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setMainImage(img)}
                                            className={`rounded-lg overflow-hidden bg-gray-100 aspect-square border-3 transition-all ${
                                                mainImage === img 
                                                    ? "border-green-600 ring-2 ring-green-300 shadow-md" 
                                                    : "border-gray-200 hover:border-green-400 hover:shadow-sm"
                                            }`}
                                        >
                                            <img src={img} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right: Product Info */}
                        <div className="space-y-6">
                            {/* Header Card */}
                            <div className="bg-white rounded-2xl p-6 shadow-md">
                                {product.category?.name && (
                                    <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium mb-3">
                                        {product.category.name}
                                    </span>
                                )}

                                <h1 className="text-4xl font-bold text-[#5c2d16] mb-4 leading-tight">{product.name}</h1>

                                {/* Rating */}
                                {product.averageRating > 0 && (
                                    <div className="flex items-center gap-3 mb-6 pb-6 border-b">
                                        <div className="flex items-center gap-1">{renderStars(product.averageRating)}</div>
                                        <span className="text-lg font-semibold text-gray-700">
                                            {product.averageRating.toFixed(1)}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            ({product.numReviews} {product.numReviews === 1 ? 'review' : 'reviews'})
                                        </span>
                                    </div>
                                )}

                                {/* Price */}
                                <div className="mb-6">
                                    <div className="flex items-baseline gap-4 mb-2">
                                        <span className="text-5xl font-bold text-green-600">₹{getCurrentPrice()}</span>
                                        {!selectedPack && product.discountPrice && product.discountPrice < product.price && (
                                            <span className="text-2xl text-gray-400 line-through">₹{product.price}</span>
                                        )}
                                    </div>
                                    {getSavings() > 0 && (
                                        <div className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-lg font-semibold">
                                            {getSavings()}% OFF - Save ₹{selectedPack ? Math.round((product.price * (selectedPack.packSize || 1)) - getCurrentPrice()) : product.price - product.discountPrice}
                                        </div>
                                    )}
                                </div>

                                {/* Description */}
                                <p className="text-gray-700 leading-relaxed mb-6">{product.description}</p>

                                {/* Stock Status */}
                                <div className="flex items-center gap-2 mb-6">
                                    {product.stock > 0 ? (
                                        <>
                                            <BsCheckCircle className="text-green-600 text-xl" />
                                            <span className="text-green-600 font-semibold">In Stock - {product.stock} units available</span>
                                        </>
                                    ) : (
                                        <>
                                            <BsX className="text-red-600 text-2xl" />
                                            <span className="text-red-600 font-semibold">Out of Stock</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Pack Options Card */}
                            {product.packOptions && product.packOptions.length > 0 && (
                                <div className="bg-white rounded-2xl p-6 shadow-md">
                                    <label className="block text-lg font-bold text-[#5c2d16] mb-4 flex items-center gap-2">
                                        <BsGift className="text-green-600" />
                                        Choose Your Pack:
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setSelectedPack(null)}
                                            className={`p-5 border-2 rounded-xl text-left transition-all transform hover:scale-105 ${
                                                !selectedPack 
                                                    ? 'border-green-600 bg-gradient-to-br from-green-50 to-green-100 shadow-lg' 
                                                    : 'border-gray-200 hover:border-green-400 hover:shadow-md bg-white'
                                            }`}
                                        >
                                            <p className="font-bold text-[#5c2d16] mb-1">Single Unit</p>
                                            <p className="text-2xl font-bold text-green-600">₹{product.discountPrice || product.price}</p>
                                            {product.discountPrice && product.discountPrice < product.price && (
                                                <p className="text-sm text-gray-400 line-through mt-1">₹{product.price}</p>
                                            )}
                                        </button>
                                        {product.packOptions.map((pack, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedPack(pack)}
                                                className={`p-5 border-2 rounded-xl text-left transition-all transform hover:scale-105 relative ${
                                                    selectedPack === pack 
                                                        ? 'border-green-600 bg-gradient-to-br from-green-50 to-green-100 shadow-lg' 
                                                        : 'border-gray-200 hover:border-green-400 hover:shadow-md bg-white'
                                                }`}
                                            >
                                                {pack.savingsPercent > 0 && (
                                                    <div className="absolute -top-2 -right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                                                        SAVE {pack.savingsPercent}%
                                                    </div>
                                                )}
                                                <p className="font-bold text-[#5c2d16] mb-1">{pack.label || `Pack of ${pack.packSize}`}</p>
                                                <p className="text-2xl font-bold text-green-600">₹{pack.packPrice}</p>
                                                {pack.savingsPercent > 0 && (
                                                    <p className="text-sm text-green-700 font-medium mt-1">
                                                        Save ₹{Math.round((product.price * pack.packSize) - pack.packPrice)}
                                                    </p>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Offers Card */}
                            {product.offerText && product.isOnOffer && (
                                <div className="bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 border-2 border-yellow-400 rounded-2xl p-6 shadow-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-full p-3 shadow-lg">
                                            <BsGift className="text-white text-2xl" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-orange-700 font-semibold uppercase tracking-wide mb-1">Special Offer</p>
                                            <p className="font-bold text-orange-900 text-xl">{product.offerText}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Shipping Card */}
                            <div className={`rounded-2xl p-6 shadow-md border-2 ${
                                product.freeShipping 
                                    ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-300' 
                                    : 'bg-white border-gray-200'
                            }`}>
                                <div className="flex items-center gap-3">
                                    <BsTruck className={`text-3xl ${product.freeShipping ? 'text-green-600' : 'text-gray-600'}`} />
                                    <div>
                                        {product.freeShipping ? (
                                            <>
                                                <p className="font-bold text-green-900 text-lg">FREE Shipping</p>
                                                <p className="text-sm text-green-700">No delivery charges on this product</p>
                                            </>
                                        ) : product.minOrderForFreeShipping > 0 ? (
                                            <>
                                                <p className="font-bold text-gray-900">Free Shipping Available</p>
                                                <p className="text-sm text-gray-700">On orders above ₹{product.minOrderForFreeShipping}</p>
                                            </>
                                        ) : product.shippingCost > 0 ? (
                                            <>
                                                <p className="font-bold text-[#5c2d16]">Shipping: ₹{product.shippingCost}</p>
                                                <p className="text-sm text-gray-600">Standard delivery charges apply</p>
                                            </>
                                        ) : (
                                            <>
                                                <p className="font-bold text-[#5c2d16]">Standard Shipping</p>
                                                <p className="text-sm text-gray-600">Charges calculated at checkout</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Quantity & Add to Cart Card */}
                            {product.stock > 0 && (
                                <div className="bg-white rounded-2xl p-6 shadow-md">
                                    {!selectedPack && (
                                        <div className="mb-4">
                                            <label className="block text-sm font-bold text-gray-700 mb-3">Quantity</label>
                                            <div className="flex items-center gap-4">
                                                <button
                                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                    className="w-14 h-14 border-2 border-gray-300 rounded-xl font-bold text-2xl hover:bg-gray-100 hover:border-gray-400 transition"
                                                >
                                                    −
                                                </button>
                                                <span className="text-2xl font-bold w-16 text-center">{quantity}</span>
                                                <button
                                                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                                    className="w-14 h-14 border-2 border-gray-300 rounded-xl font-bold text-2xl hover:bg-gray-100 hover:border-gray-400 transition"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={handleAddToCart}
                                        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-5 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition shadow-lg hover:shadow-xl transform hover:scale-105"
                                    >
                                        <BsCartPlus className="text-2xl" />
                                        {selectedPack ? `Add ${selectedPack.packSize} to Cart` : 'Add to Cart'}
                                    </button>
                                </div>
                            )}

                            {/* Certifications Badge */}
                            {product.certification && product.certification.length > 0 && (
                                <div className="bg-white rounded-2xl p-6 shadow-md">
                                    <div className="flex items-center gap-2 mb-4">
                                        <BsShieldCheck className="text-gray-600 text-2xl" />
                                        <p className="font-bold text-[#5c2d16] text-lg">Certified & Verified</p>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        {product.certification.map((cert, idx) => (
                                            <div key={idx} className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition group">
                                                {cert.image && (
                                                    <img 
                                                        src={cert.image} 
                                                        alt={cert.name}
                                                        className="w-12 h-12 object-contain mx-auto mb-2 group-hover:scale-110 transition"
                                                    />
                                                )}
                                                <p className="text-xs font-bold text-gray-900">{cert.name}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bundle Products */}
                    {product.bundleWith && product.bundleWith.length > 0 && bundleProducts.length > 0 && (
                        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8 border border-gray-200">
                            <h2 className="text-3xl font-bold text-[#5c2d16] mb-2 flex items-center gap-3">
                                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-3 shadow-md">
                                    <BsGift className="text-white text-2xl" />
                                </div>
                                Frequently Bought Together
                            </h2>
                            <p className="text-gray-600 mb-8">Save more when you buy these products together</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {product.bundleWith.map((bundle, idx) => {
                                    const bundleProduct = bundleProducts.find(p => 
                                        p._id === bundle.product || p._id === bundle.product?._id
                                    );
                                    
                                    if (!bundleProduct) return null;
                                    
                                    const handleAddBundleToCart = async (e) => {
                                        e.stopPropagation();
                                        
                                        if (!isAuthenticated) {
                                            toast.error("Please login to add items to cart");
                                            navigate("/signup");
                                            return;
                                        }

                                        if (product.stock <= 0 || bundleProduct.stock <= 0) {
                                            toast.error("One or more products are out of stock");
                                            return;
                                        }

                                        try {
                                            // Add current product to cart
                                            await addToCart(product._id, 1);
                                            // Add bundled product to cart
                                            await addToCart(bundleProduct._id, 1);
                                            toast.success(`Bundle added to cart! Both products added.`);
                                        } catch (error) {
                                            // Error handled in cart context
                                        }
                                    };
                                    
                                    return (
                                        <div 
                                            key={idx} 
                                            className="group relative border-2 border-green-300 rounded-2xl p-6 bg-gradient-to-br from-green-50 via-white to-green-50 hover:shadow-2xl transition-all duration-300 overflow-hidden"
                                        >
                                            {/* Savings Badge */}
                                            {bundle.savingsAmount > 0 && (
                                                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 via-red-600 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg rotate-3 z-10">
                                                    SAVE ₹{bundle.savingsAmount}
                                                </div>
                                            )}
                                            
                                            <div 
                                                className="flex gap-5 mb-4 cursor-pointer"
                                                onClick={() => navigate(`/products/${bundleProduct.slug || bundleProduct._id}`)}
                                            >
                                                <div className="relative flex-shrink-0">
                                                    <img 
                                                        src={bundleProduct.images?.[0]} 
                                                        alt={bundleProduct.name}
                                                        className="w-32 h-32 object-cover rounded-xl shadow-lg border-4 border-white group-hover:scale-110 transition-transform duration-300"
                                                    />
                                                    <div className="absolute -bottom-2 -right-2 bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow-md">
                                                        +
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-[#5c2d16] mb-3 text-lg line-clamp-2 group-hover:text-green-700 transition">{bundleProduct.name}</p>
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <span className="text-3xl font-bold text-green-600">₹{bundle.bundlePrice}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <BsCheckCircle className="text-green-600" />
                                                        <span>Special combo pricing</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Add Both to Cart Button */}
                                            <button
                                                onClick={handleAddBundleToCart}
                                                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition shadow-md hover:shadow-xl transform hover:scale-105 mt-2"
                                            >
                                                <BsCartPlus className="text-xl" />
                                                Add Bundle to Cart
                                            </button>
                                            <p className="text-center text-xs text-gray-500 mt-2">Adds both products to your cart</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Free Products Section */}
                    {product.freeProducts && product.freeProducts.length > 0 && freeProductsData.length > 0 && (
                        <div className="bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 rounded-2xl p-8 shadow-lg mb-8 border-2 border-pink-300">
                            <div className="text-center mb-8">
                                <div className="inline-block bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-4 shadow-xl mb-4">
                                    <BsGift className="text-white text-4xl" />
                                </div>
                                <h2 className="text-4xl font-bold text-[#5c2d16] mb-2">Get FREE Products!</h2>
                                <p className="text-lg text-gray-700">Buy qualifying quantity and receive these products absolutely free</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {product.freeProducts.map((free, idx) => {
                                    const freeProduct = freeProductsData.find(p => 
                                        p._id === free.product || p._id === free.product?._id
                                    );
                                    
                                    if (!freeProduct) return null;
                                    
                                    const handleAddWithFreeProduct = async (e) => {
                                        e.stopPropagation();
                                        
                                        if (!isAuthenticated) {
                                            toast.error("Please login to add items to cart");
                                            navigate("/signup");
                                            return;
                                        }

                                        if (product.stock < free.minQuantity) {
                                            toast.error(`Insufficient stock. Need ${free.minQuantity} units for this offer.`);
                                            return;
                                        }

                                        try {
                                            // Add qualifying quantity to cart
                                            await addToCart(product._id, free.minQuantity);
                                            toast.success(`Added ${free.minQuantity} units! Eligible for ${free.quantity} free item(s).`);
                                        } catch (error) {
                                            // Error handled in cart context
                                        }
                                    };
                                    
                                    return (
                                        <div 
                                            key={idx} 
                                            className="group relative bg-white rounded-2xl p-6 shadow-xl border-2 border-pink-200 hover:shadow-2xl transition-all duration-300 overflow-hidden"
                                        >
                                            {/* FREE Badge */}
                                            <div className="absolute -top-3 -right-3 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white px-6 py-3 rounded-full text-lg font-black shadow-2xl rotate-12 animate-pulse">
                                                FREE!
                                            </div>
                                            
                                            <div 
                                                className="flex gap-6 mb-4 cursor-pointer"
                                                onClick={() => navigate(`/products/${freeProduct.slug || freeProduct._id}`)}
                                            >
                                                <div className="relative flex-shrink-0">
                                                    <div className="w-36 h-36 bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl flex items-center justify-center p-2 shadow-lg group-hover:shadow-xl transition">
                                                        <img 
                                                            src={freeProduct.images?.[0]} 
                                                            alt={freeProduct.name}
                                                            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                                                        />
                                                    </div>
                                                    <div className="absolute -bottom-3 -left-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full px-4 py-2 text-xs font-bold shadow-lg">
                                                        {free.quantity}x FREE
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-[#5c2d16] mb-3 text-xl line-clamp-2 group-hover:text-purple-700 transition">{freeProduct.name}</p>
                                                    <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-xl p-4 mb-3">
                                                        <p className="text-sm font-bold text-purple-900 mb-1 flex items-center gap-2">
                                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                            How to Get It FREE:
                                                        </p>
                                                        <p className="text-purple-800 font-semibold text-lg">
                                                            Buy {free.minQuantity} units of {product.name}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <span className="text-gray-400 line-through">Worth ₹{freeProduct.price}</span>
                                                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold text-xs">
                                                            100% FREE
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Buy Qualifying Quantity Button */}
                                            <button
                                                onClick={handleAddWithFreeProduct}
                                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition shadow-md hover:shadow-xl transform hover:scale-105 mt-2"
                                            >
                                                <BsCartPlus className="text-xl" />
                                                Buy {free.minQuantity} & Get {free.quantity} Free
                                            </button>
                                            <p className="text-center text-xs text-gray-500 mt-2">Adds {free.minQuantity} units to qualify for free item</p>
                                        </div>
                                    );
                                })}
                            </div>
                            
                            <div className="mt-6 p-4 bg-white rounded-xl border-2 border-pink-200">
                                <p className="text-center text-sm text-gray-700">
                                    <span className="font-bold text-pink-700">🎉 Limited Time Offer!</span> Free products will be automatically added to your cart when you meet the qualifying purchase quantity.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Tabs Navigation */}
                    <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-8">
                        <div className="border-b border-gray-200 bg-gray-50">
                            <div className="flex gap-2 px-4 overflow-x-auto">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`px-6 py-4 font-semibold text-sm whitespace-nowrap transition-all border-b-4 ${
                                            activeTab === tab.id
                                                ? 'border-green-600 text-green-600 bg-white'
                                                : 'border-transparent text-gray-600 hover:text-green-600 hover:bg-gray-100'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            {tab.icon && <tab.icon className="text-lg" />}
                                            {tab.label}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-8">
                            {/* Overview Tab */}
                            {activeTab === 'overview' && (
                                <div className="space-y-8">
                                    {/* Product Details Grid */}
                                    <div>
                                        <h3 className="text-2xl font-bold text-[#5c2d16] mb-6">Product Information</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                            {product.manufacturer && (
                                                <div className="p-4 bg-gray-50 rounded-lg">
                                                    <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Manufacturer</p>
                                                    <p className="font-bold text-[#5c2d16]">{product.manufacturer}</p>
                                                </div>
                                            )}
                                            {product.origin && (
                                                <div className="p-4 bg-gray-50 rounded-lg">
                                                    <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Origin</p>
                                                    <p className="font-bold text-[#5c2d16]">{product.origin}</p>
                                                </div>
                                            )}
                                            {product.formulation && (
                                                <div className="p-4 bg-gray-50 rounded-lg">
                                                    <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Form</p>
                                                    <p className="font-bold text-[#5c2d16]">{product.formulation}</p>
                                                </div>
                                            )}
                                            {product.potency && (
                                                <div className="p-4 bg-gray-50 rounded-lg">
                                                    <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Potency</p>
                                                    <p className="font-bold text-[#5c2d16]">{product.potency}</p>
                                                </div>
                                            )}
                                            {product.shelfLife && (
                                                <div className="p-4 bg-gray-50 rounded-lg">
                                                    <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Shelf Life</p>
                                                    <p className="font-bold text-[#5c2d16]">{product.shelfLife}</p>
                                                </div>
                                            )}
                                            {product.processingMethod && (
                                                <div className="p-4 bg-gray-50 rounded-lg">
                                                    <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Processing Method</p>
                                                    <p className="font-bold text-[#5c2d16]">{product.processingMethod}</p>
                                                </div>
                                            )}
                                            {product.batchNumber && (
                                                <div className="p-4 bg-gray-50 rounded-lg">
                                                    <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Batch Number</p>
                                                    <p className="font-bold text-[#5c2d16]">{product.batchNumber}</p>
                                                </div>
                                            )}
                                            {product.expiryDate && (
                                                <div className="p-4 bg-gray-50 rounded-lg">
                                                    <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Expiry Date</p>
                                                    <p className="font-bold text-[#5c2d16]">
                                                        {new Date(product.expiryDate).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Attributes */}
                                    {product.attributes && Object.keys(product.attributes).length > 0 && (
                                        <div>
                                            <h3 className="text-2xl font-bold text-[#5c2d16] mb-6">Specifications</h3>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                {Object.entries(product.attributes).map(([key, value]) => (
                                                    <div key={key} className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                                                        <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide capitalize">
                                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                                        </p>
                                                        <p className="font-bold text-[#5c2d16]">{value}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Suitability */}
                                    {((product.ageGroup && product.ageGroup.length > 0) ||
                                      (product.gender && product.gender.length > 0) ||
                                      (product.season && product.season.length > 0) ||
                                      (product.timeOfDay && product.timeOfDay.length > 0)) && (
                                        <div className="p-6 bg-gradient-to-br from-purple-50 to-gray-50 rounded-xl border border-purple-200">
                                            <h3 className="text-xl font-bold text-[#5c2d16] mb-4">Best Suited For</h3>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {product.ageGroup && product.ageGroup.length > 0 && (
                                                    <div>
                                                        <p className="text-xs text-gray-600 mb-2 font-semibold">AGE GROUP</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {product.ageGroup.map((age, i) => (
                                                                <span key={i} className="bg-white px-3 py-1 rounded-full text-sm font-medium text-purple-700 border border-purple-200 shadow-sm">
                                                                    {age}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {product.gender && product.gender.length > 0 && (
                                                    <div>
                                                        <p className="text-xs text-gray-600 mb-2 font-semibold">GENDER</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {product.gender.map((g, i) => (
                                                                <span key={i} className="bg-white px-3 py-1 rounded-full text-sm font-medium text-purple-700 border border-purple-200 shadow-sm">
                                                                    {g}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {product.season && product.season.length > 0 && (
                                                    <div>
                                                        <p className="text-xs text-gray-600 mb-2 font-semibold">SEASON</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {product.season.map((s, i) => (
                                                                <span key={i} className="bg-white px-3 py-1 rounded-full text-sm font-medium text-purple-700 border border-purple-200 shadow-sm">
                                                                    {s}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {product.timeOfDay && product.timeOfDay.length > 0 && (
                                                    <div>
                                                        <p className="text-xs text-gray-600 mb-2 font-semibold">BEST TIME</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {product.timeOfDay.map((t, i) => (
                                                                <span key={i} className="bg-white px-3 py-1 rounded-full text-sm font-medium text-purple-700 border border-purple-200 shadow-sm">
                                                                    {t}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Ingredients Tab */}
                            {activeTab === 'ingredients' && product.ingredients && product.ingredients.length > 0 && (
                                <div>
                                    <div className="mb-8 text-center">
                                        <h3 className="text-4xl font-bold text-[#5c2d16] mb-3">Key Ingredients</h3>
                                        <p className="text-lg text-gray-600">Natural, pure ingredients for maximum effectiveness</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {product.ingredients.map((ingredient, idx) => (
                                            <div key={idx} className="group bg-gradient-to-br from-white via-gray-50 to-green-50 border-2 border-gray-200 rounded-2xl p-6 hover:shadow-2xl hover:border-green-500 transition-all duration-300 transform hover:scale-105">
                                                {ingredient.image && (
                                                    <div className="relative w-full h-48 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl mb-5 flex items-center justify-center border-2 border-green-200 shadow-md overflow-hidden">
                                                        <img 
                                                            src={ingredient.image} 
                                                            alt={ingredient.name}
                                                            className="max-w-full max-h-full object-contain p-3 group-hover:scale-110 transition-transform duration-300"
                                                        />
                                                        <div className="absolute top-2 right-2 bg-white rounded-full px-3 py-1 text-xs font-bold text-green-700 shadow-md">
                                                            #{idx + 1}
                                                        </div>
                                                    </div>
                                                )}
                                                <h4 className="font-bold text-[#5c2d16] mb-3 text-xl group-hover:text-green-700 transition">{ingredient.name}</h4>
                                                <p className="text-sm text-gray-600 leading-relaxed">{ingredient.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Benefits Tab */}
                            {activeTab === 'benefits' && product.benefits && product.benefits.length > 0 && (
                                <div>
                                    <div className="mb-8 text-center">
                                        <h3 className="text-4xl font-bold text-[#5c2d16] mb-3">Health Benefits</h3>
                                        <p className="text-lg text-gray-600">Discover the powerful wellness benefits</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {product.benefits.map((benefit, idx) => (
                                            <div key={idx} className="group relative bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-200 rounded-2xl p-8 hover:shadow-2xl hover:border-green-500 transition-all duration-300 transform hover:scale-105 overflow-hidden">
                                                {/* Decorative Element */}
                                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-200 rounded-full opacity-20 group-hover:opacity-30 transition"></div>
                                                
                                                {benefit.image && (
                                                    <div className="relative w-24 h-24 bg-gradient-to-br from-white to-green-100 rounded-full mb-5 flex items-center justify-center border-4 border-green-200 shadow-lg mx-auto group-hover:shadow-xl transition">
                                                        <img 
                                                            src={benefit.image} 
                                                            alt={benefit.name}
                                                            className="w-16 h-16 object-contain group-hover:scale-110 transition-transform duration-300"
                                                        />
                                                        <div className="absolute -top-1 -right-1 bg-green-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold shadow-md">
                                                            {idx + 1}
                                                        </div>
                                                    </div>
                                                )}
                                                <h4 className="font-bold text-green-900 mb-4 text-2xl text-center group-hover:text-green-700 transition">{benefit.name}</h4>
                                                <p className="text-gray-700 text-center leading-relaxed text-base">{benefit.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Usage Tab */}
                            {activeTab === 'usage' && (product.dosage || product.howToUse?.length > 0) && (
                                <div className="space-y-8">
                                    <div className="text-center mb-8">
                                        <h3 className="text-4xl font-bold text-[#5c2d16] mb-3">How to Use</h3>
                                        <p className="text-lg text-gray-600">Follow these simple instructions for best results</p>
                                    </div>

                                    {product.dosage && (
                                        <div className="relative p-8 bg-gradient-to-r from-gray-50 via-cyan-50 to-gray-50 border-2 border-gray-300 rounded-2xl shadow-lg overflow-hidden">
                                            <div className="absolute -top-8 -right-8 w-32 h-32 bg-gray-300 rounded-full opacity-20"></div>
                                            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-cyan-300 rounded-full opacity-20"></div>
                                            <div className="relative">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="bg-gray-600 rounded-xl p-3 shadow-md">
                                                        <BsInfoCircle className="text-white text-2xl" />
                                                    </div>
                                                    <p className="font-bold text-gray-900 text-2xl">Recommended Dosage</p>
                                                </div>
                                                <p className="text-gray-800 text-lg leading-relaxed pl-1">{product.dosage}</p>
                                            </div>
                                        </div>
                                    )}

                                    {product.howToUse && product.howToUse.length > 0 && (
                                        <div>
                                            <h4 className="text-2xl font-bold text-[#5c2d16] mb-6">Step-by-Step Instructions</h4>
                                            <div className="space-y-5">
                                                {product.howToUse.map((step, idx) => (
                                                    <div key={idx} className="group flex gap-6 items-start p-6 border-2 border-gray-200 rounded-2xl hover:border-green-500 hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-white to-gray-50 transform hover:scale-[1.02]">
                                                        <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-transform">
                                                            {idx + 1}
                                                        </div>
                                                        {step.image && (
                                                            <div className="flex-shrink-0 w-28 h-28 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center shadow-md border-2 border-green-200 overflow-hidden">
                                                                <img 
                                                                    src={step.image} 
                                                                    alt={step.name}
                                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                                />
                                                            </div>
                                                        )}
                                                        <div className="flex-1">
                                                            <h5 className="font-bold text-[#5c2d16] mb-3 text-xl group-hover:text-green-700 transition">{step.name}</h5>
                                                            {step.description && (
                                                                <p className="text-gray-600 leading-relaxed text-base">{step.description}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* How to Consume */}
                                    {product.howToConsume && product.howToConsume.length > 0 && (
                                        <div>
                                            <h4 className="text-2xl font-bold text-[#5c2d16] mb-6">Consumption Methods</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                {product.howToConsume.map((method, idx) => (
                                                    <div key={idx} className="group flex gap-5 items-center p-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-gray-200 hover:border-purple-400 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                                                        {method.image && (
                                                            <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center shadow-md border-2 border-purple-200 overflow-hidden">
                                                                <img 
                                                                    src={method.image} 
                                                                    alt={method.name}
                                                                    className="w-16 h-16 object-cover group-hover:scale-110 transition-transform duration-300"
                                                                />
                                                            </div>
                                                        )}
                                                        <div className="flex-1">
                                                            <p className="font-bold text-[#5c2d16] mb-2 text-lg group-hover:text-purple-700 transition">{method.name}</p>
                                                            {method.description && (
                                                                <p className="text-sm text-gray-600 leading-relaxed">{method.description}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Storage */}
                                    {(product.storageInstructions || (product.howToStore && product.howToStore.length > 0)) && (
                                        <div className="relative p-8 bg-gradient-to-r from-yellow-50 via-amber-50 to-orange-50 border-2 border-yellow-400 rounded-2xl shadow-lg overflow-hidden">
                                            <div className="absolute -top-8 -right-8 w-32 h-32 bg-yellow-300 rounded-full opacity-20"></div>
                                            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-amber-300 rounded-full opacity-20"></div>
                                            <div className="relative">
                                                <div className="flex items-center gap-3 mb-6">
                                                    <div className="bg-yellow-600 rounded-xl p-3 shadow-md">
                                                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                                        </svg>
                                                    </div>
                                                    <h4 className="text-2xl font-bold text-yellow-900">Storage Instructions</h4>
                                                </div>
                                                {product.storageInstructions && (
                                                    <p className="text-gray-800 mb-5 leading-relaxed text-lg bg-white p-4 rounded-xl shadow-sm">{product.storageInstructions}</p>
                                                )}
                                                {product.howToStore && product.howToStore.length > 0 && (
                                                    <div className="space-y-3">
                                                        {product.howToStore.map((item, idx) => (
                                                            <div key={idx} className="flex gap-4 items-start bg-white p-5 rounded-xl shadow-md border border-yellow-200 hover:shadow-lg transition">
                                                                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-full flex items-center justify-center shadow-md">
                                                                    <BsCheckCircle className="text-white text-lg" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-[#5c2d16] mb-1 text-base">{item.name}</p>
                                                                    {item.description && (
                                                                        <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Safety Tab */}
                            {activeTab === 'safety' && product.contraindications && product.contraindications.length > 0 && (
                                <div>
                                    <div className="mb-8 text-center">
                                        <h3 className="text-4xl font-bold text-red-900 mb-3">Safety & Precautions</h3>
                                        <p className="text-lg text-gray-600">Important information for safe and effective use</p>
                                    </div>
                                    <div className="bg-gradient-to-r from-red-50 via-orange-50 to-red-50 border-l-8 border-red-600 p-8 mb-8 rounded-2xl shadow-xl">
                                        <div className="flex items-start gap-4">
                                            <div className="bg-red-600 rounded-xl p-3 shadow-lg flex-shrink-0">
                                                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="font-black text-red-900 text-xl mb-2">⚠️ IMPORTANT</p>
                                                <p className="text-red-800 text-base leading-relaxed">
                                                    Please read these precautions carefully. Consult your healthcare provider if you have any concerns or pre-existing medical conditions.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {product.contraindications.map((item, idx) => (
                                            <div key={idx} className="group p-6 bg-gradient-to-br from-red-50 via-white to-orange-50 border-2 border-red-200 rounded-2xl hover:shadow-2xl hover:border-red-400 transition-all duration-300 transform hover:scale-105">
                                                <div className="flex gap-5">
                                                    {item.image && (
                                                        <div className="flex-shrink-0 w-20 h-20 bg-red-100 rounded-xl flex items-center justify-center shadow-md border-2 border-red-200 overflow-hidden">
                                                            <img 
                                                                src={item.image} 
                                                                alt={item.name}
                                                                className="w-16 h-16 object-cover group-hover:scale-110 transition-transform duration-300"
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-red-900 mb-3 text-xl group-hover:text-red-700 transition">{item.name}</h4>
                                                        <p className="text-sm text-red-800 leading-relaxed">{item.description}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Reviews Tab */}
                            {activeTab === 'reviews' && (
                                <div>
                                    <h3 className="text-3xl font-bold text-[#5c2d16] mb-6">Customer Reviews</h3>

                                    {/* Rating Summary */}
                                    {product.ratingStats && product.ratingStats.totalReviews > 0 && (
                                        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-8 mb-8 shadow-md border border-yellow-200">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="text-center">
                                                    <div className="text-6xl font-bold text-[#5c2d16] mb-3">
                                                        {product.ratingStats.averageRating.toFixed(1)}
                                                    </div>
                                                    <div className="flex items-center justify-center gap-1 mb-3">
                                                        {renderStars(product.ratingStats.averageRating)}
                                                    </div>
                                                    <p className="text-gray-600 font-medium">
                                                        Based on {product.ratingStats.totalReviews} {product.ratingStats.totalReviews === 1 ? 'review' : 'reviews'}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="font-bold text-[#5c2d16] mb-4">Rating Distribution</p>
                                                    {[5, 4, 3, 2, 1].map((star) => {
                                                        const count = product.ratingStats.distribution[star] || 0;
                                                        const percentage = product.ratingStats.distributionPercentage[star] || 0;
                                                        return (
                                                            <div key={star} className="flex items-center gap-4 mb-3">
                                                                <span className="text-sm text-gray-700 w-16 font-medium">{star} Star</span>
                                                                <div className="flex-1 bg-gray-200 h-3 rounded-full overflow-hidden shadow-inner">
                                                                    <div 
                                                                        className="bg-gradient-to-r from-yellow-400 to-orange-400 h-full rounded-full transition-all duration-500" 
                                                                        style={{ width: `${percentage}%` }}
                                                                    ></div>
                                                                </div>
                                                                <span className="text-sm text-gray-700 w-12 text-right font-semibold">{count}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Reviews List */}
                                    {product.reviews && product.reviews.length > 0 ? (
                                        <div className="space-y-4 mb-8">
                                            {product.reviews.map((review) => (
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
                                        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                                            <BsStar className="text-6xl text-gray-300 mx-auto mb-4" />
                                            <p className="text-gray-600 text-lg mb-2">No reviews yet</p>
                                            <p className="text-gray-500 text-sm">Be the first to share your experience!</p>
                                        </div>
                                    )}

                                    {/* Write Review Form */}
                                    <div id="review-form" className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-2xl p-8 shadow-md">
                                        <h4 className="text-2xl font-bold mb-6 text-[#5c2d16]">
                                            {editingReviewId ? 'Edit Your Review' : 'Write a Review'}
                                        </h4>
                                        {editingReviewId && (
                                            <div className="mb-6 p-4 bg-gray-50 border-l-4 border-gray-600 rounded-lg flex items-center justify-between">
                                                <span className="text-sm text-gray-900 font-medium">Editing your review</span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingReviewId(null);
                                                        setReviewForm({ rating: 0, comment: "", images: [] });
                                                    }}
                                                    className="text-sm text-gray-600 hover:text-gray-800 font-semibold"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                        <form onSubmit={handleReviewSubmit} className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-3">Your Rating</label>
                                                <div className="flex gap-2">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button
                                                            type="button"
                                                            key={star}
                                                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                                            className="hover:scale-125 transition-transform"
                                                        >
                                                            {star <= reviewForm.rating ? (
                                                                <BsStarFill className="text-yellow-400 text-4xl drop-shadow" />
                                                            ) : (
                                                                <BsStar className="text-gray-300 text-4xl" />
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                                {reviewForm.rating > 0 && (
                                                    <p className="text-sm text-gray-600 mt-2">
                                                        You rated this product {reviewForm.rating} star{reviewForm.rating > 1 ? 's' : ''}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-3">Your Review</label>
                                                <textarea
                                                    value={reviewForm.comment}
                                                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                                    rows={5}
                                                    className="w-full border-2 border-gray-300 rounded-xl p-4 focus:ring-4 focus:ring-green-200 focus:border-green-500 transition"
                                                    placeholder="Share your experience with this product... What did you like? How did it work for you?"
                                                    required
                                                />
                                            </div>

                                            {/* Image Upload */}
                                            <div className="border-2 border-gray-200 rounded-xl p-6 bg-white">
                                                <label className="block text-sm font-bold text-[#5c2d16] mb-4 flex items-center gap-2">
                                                    <BsImage className="text-green-600 text-lg" />
                                                    Add Photos to Your Review (Optional)
                                                </label>

                                                {reviewForm.images.length > 0 && (
                                                    <div className="grid grid-cols-5 gap-3 mb-4">
                                                        {reviewForm.images.map((img, idx) => (
                                                            <div key={idx} className="relative group">
                                                                <div className="border-2 border-green-300 rounded-lg overflow-hidden bg-white shadow-sm">
                                                                    <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-24 object-cover" />
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeImage(idx)}
                                                                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg hover:bg-red-700"
                                                                >
                                                                    <BsX className="text-xl" />
                                                                </button>
                                                                <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full font-bold">
                                                                    {idx + 1}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {reviewForm.images.length < 5 && (
                                                    <div>
                                                        <input
                                                            type="file"
                                                            id="review-images"
                                                            multiple
                                                            accept="image/jpeg,image/jpg,image/png,image/webp"
                                                            onChange={handleImageUpload}
                                                            className="hidden"
                                                            disabled={uploadingImages}
                                                        />
                                                        <label
                                                            htmlFor="review-images"
                                                            className={`inline-flex items-center gap-3 px-8 py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-700 font-semibold cursor-pointer bg-white transition-all ${
                                                                uploadingImages ? 'opacity-50 cursor-not-allowed' : 'hover:border-green-600 hover:bg-green-50 hover:text-green-700 hover:shadow-md'
                                                            }`}
                                                        >
                                                            {uploadingImages ? (
                                                                <>
                                                                    <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                    </svg>
                                                                    Uploading Photos...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <BsImage className="text-2xl" />
                                                                    <span>Choose Images</span>
                                                                </>
                                                            )}
                                                        </label>
                                                        <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                                                            <span className="flex items-center gap-1 font-medium">
                                                                <BsImage />
                                                                {reviewForm.images.length}/5 photos
                                                            </span>
                                                            <span>•</span>
                                                            <span>JPG, PNG, WebP</span>
                                                            <span>•</span>
                                                            <span>Max 5MB each</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex gap-4">
                                                <button
                                                    type="submit"
                                                    disabled={uploadingImages}
                                                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-4 rounded-xl font-bold text-lg disabled:bg-gray-400 transition shadow-lg hover:shadow-xl transform hover:scale-105"
                                                >
                                                    {editingReviewId ? 'Update Review' : 'Submit Review'}
                                                </button>
                                                {editingReviewId && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setEditingReviewId(null);
                                                            setReviewForm({ rating: 0, comment: "", images: [] });
                                                        }}
                                                        className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* FAQs Section */}
                    {product.faq && product.faq.length > 0 && (
                        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8 border border-gray-200">
                            <div className="text-center mb-8">
                                <h2 className="text-4xl font-bold text-[#5c2d16] mb-3">Frequently Asked Questions</h2>
                                <p className="text-lg text-gray-600">Got questions? We've got answers!</p>
                            </div>
                            <div className="space-y-4">
                                {product.faq.map((faq, idx) => (
                                    <div key={idx} className="border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-green-500 hover:shadow-xl transition-all duration-300">
                                        <button
                                            onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                                            className="w-full text-left px-8 py-6 flex justify-between items-center bg-gradient-to-r from-gray-50 to-gray-100 hover:from-green-50 hover:to-emerald-50 transition-all duration-300"
                                        >
                                            <span className="font-bold text-[#5c2d16] pr-6 text-lg">{faq.question}</span>
                                            <div className={`flex-shrink-0 transition-all duration-300 ${faqOpen === idx ? 'rotate-180' : ''}`}>
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                    faqOpen === idx 
                                                        ? 'bg-green-600 shadow-lg' 
                                                        : 'bg-gray-300'
                                                }`}>
                                                    <svg className={`w-6 h-6 ${faqOpen === idx ? 'text-white' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </button>
                                        {faqOpen === idx && (
                                            <div className="px-8 py-6 text-gray-700 bg-white border-t-2 border-green-100 leading-relaxed text-base">
                                                <div className="flex gap-3">
                                                    <div className="flex-shrink-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center shadow-md mt-1">
                                                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                    <p className="flex-1">{faq.answer}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Related Products */}
                    {relatedProducts.length > 0 && (
                        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 shadow-lg border border-gray-200">
                            <div className="text-center mb-8">
                                <h2 className="text-4xl font-bold text-[#5c2d16] mb-3">You May Also Like</h2>
                                <p className="text-lg text-gray-600">Explore more wellness products</p>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                                {relatedProducts.map((item) => (
                                    <div
                                        key={item._id}
                                        onClick={() => navigate(`/products/${item.slug || item._id}`)}
                                        className="group border-2 border-gray-200 rounded-2xl cursor-pointer hover:border-green-500 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden bg-white"
                                    >
                                        <div className="relative w-full h-56 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center border-b-2 border-gray-100 overflow-hidden">
                                            <img
                                                src={item.images?.[0]}
                                                alt={item.name}
                                                className="max-w-full max-h-full object-contain p-4 group-hover:scale-110 transition-transform duration-300"
                                            />
                                            {item.discountPrice && item.discountPrice < item.price && (
                                                <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                                    {Math.round(((item.price - item.discountPrice) / item.price) * 100)}% OFF
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-5">
                                            <h3 className="font-bold text-[#5c2d16] mb-3 line-clamp-2 text-base group-hover:text-green-700 transition">{item.name}</h3>
                                            {item.averageRating > 0 && (
                                                <div className="flex items-center gap-1 mb-3">
                                                    <div className="flex items-center gap-0.5">
                                                        {renderStars(item.averageRating)}
                                                    </div>
                                                    <span className="text-xs text-gray-600 font-medium">({item.numReviews})</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <p className="text-green-600 font-bold text-xl">
                                                    ₹{item.discountPrice || item.price}
                                                </p>
                                                {item.discountPrice && item.discountPrice < item.price && (
                                                    <p className="text-gray-400 line-through text-sm">₹{item.price}</p>
                                                )}
                                            </div>
                                            <button className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-green-700">
                                                View Product
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default ProductDetails;

