import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { BsChevronLeft, BsChevronDown } from "react-icons/bs";
import { registerUser } from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";
import GoogleLoginButton from "../../components/auth/GoogleLoginButton";

const SignupPage = () => {
    const [fullname, setFullname] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [showEmailSignup, setShowEmailSignup] = useState(false);
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);


    const navigate = useNavigate();
    const location = useLocation(); // Add useLocation
    const { login } = useAuth();

    const handleSignup = async (e) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        // Validate password strength (matches backend requirements)
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            setError("Password must be at least 8 characters with uppercase, lowercase, and at least one number");
            return;
        }

        setLoading(true);

        try {
            const result = await registerUser({ fullname, email, phone, password });

            if (result.success) {
                login(result.data);

                // Check if there's a return url
                const from = location.state?.from || '/';
                navigate(from);
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white">
            {/* Left Side - Visual/Brand */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-[#5c2d16] items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-[#5c2d16]/90 to-[#442112]/90"></div>

                <div className="relative z-10 p-12 text-white max-w-lg">
                    <h1 className="text-5xl font-bold mb-6 font-display leading-tight">
                        Begin Your Prolific Journey
                    </h1>
                    <p className="text-lg text-white/80 leading-relaxed mb-8">
                        Join our exclusive community to access authentic Prolific products, personalized wellness plans, and a holistic path to health.
                    </p>
                    <div className="flex gap-4">
                        <div className="h-1 w-4 bg-white/30 rounded-full"></div>
                        <div className="h-1 w-12 bg-amber-400 rounded-full"></div>
                        <div className="h-1 w-4 bg-white/30 rounded-full"></div>
                    </div>
                </div>

                {/* Decorative circles */}
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl"></div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 overflow-y-auto">
                <div className="w-full max-w-[480px] space-y-8">
                    {/* Header */}
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                            Create Account
                        </h2>
                        <p className="mt-2 text-sm text-gray-500">
                            Already have an account?{' '}
                            <Link to="/login" className="font-medium text-[#5c2d16] hover:text-[#442112] transition-colors">
                                Sign in here
                            </Link>
                        </p>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 animate-fadeIn">
                            <div className="text-red-500 mt-0.5">⚠️</div>
                            <p className="text-sm text-red-700 font-medium">{error}</p>
                        </div>
                    )}

                    {/* Google Auth */}
                    <div className="w-full">
                        <GoogleLoginButton />
                    </div>

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <button
                                type="button"
                                onClick={() => setShowEmailSignup(!showEmailSignup)}
                                className="bg-white px-5 py-2.5 text-gray-500 hover:text-gray-800 hover:bg-gray-50 border border-gray-200 rounded-full shadow-sm hover:shadow text-[11px] font-semibold tracking-wider flex items-center gap-2 transition-all duration-200 group z-10"
                            >
                                {showEmailSignup ? 'Hide Email Signup' : 'Or Sign up with Email'}
                                <BsChevronDown className={`transition-transform duration-300 ${showEmailSignup ? 'rotate-180' : ''} text-gray-400 group-hover:text-gray-600`} />
                            </button>
                        </div>
                    </div>

                    {/* Email Signup Form */}
                    <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showEmailSignup ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        <form onSubmit={handleSignup} className="space-y-5 pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={fullname}
                                        onChange={(e) => setFullname(e.target.value)}
                                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:bg-white focus:border-[#5c2d16] focus:ring-4 focus:ring-[#5c2d16]/5 transition-all duration-200"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">Phone</label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => {
                                            const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
                                            setPhone(cleaned);
                                        }}
                                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:bg-white focus:border-[#5c2d16] focus:ring-4 focus:ring-[#5c2d16]/5 transition-all duration-200"
                                        placeholder="Mobile Number"
                                        required
                                        maxLength={10}
                                        pattern="[6-9][0-9]{9}"
                                        title="Enter a valid 10-digit Indian phone number starting with 6-9"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 ml-1">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:bg-white focus:border-[#5c2d16] focus:ring-4 focus:ring-[#5c2d16]/5 transition-all duration-200"
                                    placeholder="name@example.com"
                                    required
                                    tabIndex={showEmailSignup ? 0 : -1}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:bg-white focus:border-[#5c2d16] focus:ring-4 focus:ring-[#5c2d16]/5 transition-all duration-200"
                                            placeholder="Create password"
                                            required
                                            tabIndex={showEmailSignup ? 0 : -1}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            tabIndex={showEmailSignup ? 0 : -1}
                                        >
                                            {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">Confirm</label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:bg-white focus:border-[#5c2d16] focus:ring-4 focus:ring-[#5c2d16]/5 transition-all duration-200"
                                            placeholder="Confirm password"
                                            required
                                            tabIndex={showEmailSignup ? 0 : -1}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            tabIndex={showEmailSignup ? 0 : -1}
                                        >
                                            {showConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                Password must be at least 8 characters with uppercase, lowercase, and a number.
                            </p>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#5c2d16] text-white py-3.5 rounded-xl text-sm font-semibold shadow-lg shadow-[#5c2d16]/20 hover:bg-[#442112] hover:shadow-xl hover:shadow-[#5c2d16]/30 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                                tabIndex={showEmailSignup ? 0 : -1}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating Account...
                                    </span>
                                ) : 'Create Account'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>
    );
};
export default SignupPage;
