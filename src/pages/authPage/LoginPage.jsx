import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { BsChevronLeft, BsChevronDown } from "react-icons/bs";
import { loginUser, sendOtp, verifyOtp } from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";
import GoogleLoginButton from "../../components/auth/GoogleLoginButton";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    // Login Method State: 'email' or 'mobile'
    const [loginMethod, setLoginMethod] = useState('email');
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showManualLogin, setShowManualLogin] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await loginUser({ email, password });

            if (result.success) {
                login(result.data);
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

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await sendOtp(phone);
            if (result.success) {
                setOtpSent(true);
                if (result.data && result.data.debugOtp) {
                    console.log('OTP:', result.data.debugOtp);
                }
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await verifyOtp(phone, otp);

            if (result.success) {
                login(result.data);
                const from = location.state?.from || '/';
                navigate(from);
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('Failed to verify OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white ">
            {/* Left Side - Visual/Brand */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-[#5c2d16] items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2653&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-[#5c2d16]/90 to-[#442112]/90"></div>

                <div className="relative z-10 p-12 text-white max-w-lg">
                    <h1 className="text-5xl font-bold mb-6 font-display leading-tight">
                        Welcome Back to Prolific
                    </h1>
                    <p className="text-lg text-white/80 leading-relaxed mb-8">
                        Sign in to continue accessing your personalized Dosha insights, premium wellness products, and exclusive offers.
                    </p>
                    <div className="flex gap-4">
                        <div className="h-1 w-12 bg-amber-400 rounded-full"></div>
                        <div className="h-1 w-4 bg-white/30 rounded-full"></div>
                        <div className="h-1 w-4 bg-white/30 rounded-full"></div>
                    </div>
                </div>

                {/* Decorative circles */}
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl"></div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 overflow-y-auto">
                <div className="w-full max-w-[420px] space-y-8">
                    {/* Header for Mobile/Desktop */}
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                            Sign in
                        </h2>
                        <p className="mt-2 text-sm text-gray-500">
                            Don't have an account?{' '}
                            <Link to="/signup" className="font-medium text-[#5c2d16] hover:text-[#442112] transition-colors">
                                Create one here
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

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <button
                                type="button"
                                onClick={() => setShowManualLogin(!showManualLogin)}
                                className="bg-white px-5 py-2.5 text-gray-500 hover:text-gray-800 hover:bg-gray-50 border border-gray-200 rounded-full shadow-sm hover:shadow text-[11px] font-semibold tracking-wider flex items-center gap-2 transition-all duration-200 group z-10"
                            >
                                {showManualLogin ? 'Hide Options' : 'Or continue with Email / Mobile'}
                                <BsChevronDown className={`transition-transform duration-300 ${showManualLogin ? 'rotate-180' : ''} text-gray-400 group-hover:text-gray-600`} />
                            </button>
                        </div>
                    </div>

                    {/* Manual Login Container */}
                    <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showManualLogin ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="space-y-6 pt-4">
                            {/* Login Method Toggle */}
                            <div className="flex p-1.5 bg-gray-50 rounded-xl border border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => { setLoginMethod('email'); setError(''); }}
                                    className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${loginMethod === 'email'
                                        ? 'bg-white text-[#5c2d16] shadow-sm ring-1 ring-black/5'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    Email Address
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setLoginMethod('mobile'); setError(''); }}
                                    className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${loginMethod === 'mobile'
                                        ? 'bg-white text-[#5c2d16] shadow-sm ring-1 ring-black/5'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    Mobile OTP
                                </button>
                            </div>

                            {/* Email Form */}
                            {loginMethod === 'email' && (
                                <form onSubmit={handleEmailLogin} className="space-y-5 animate-fadeIn">
                                    <div className="space-y-5">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-semibold text-gray-700 ml-1">Email</label>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:bg-white focus:border-[#5c2d16] focus:ring-4 focus:ring-[#5c2d16]/5 transition-all duration-200"
                                                placeholder="name@example.com"
                                                required
                                                disabled={loading}
                                                tabIndex={showManualLogin ? 0 : -1}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between ml-1">
                                                <label className="text-sm font-semibold text-gray-700">Password</label>
                                                <button type="button" className="text-xs font-medium text-[#5c2d16] hover:text-[#442112]" tabIndex={showManualLogin ? 0 : -1}>
                                                    Forgot password?
                                                </button>
                                            </div>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:bg-white focus:border-[#5c2d16] focus:ring-4 focus:ring-[#5c2d16]/5 transition-all duration-200"
                                                    placeholder="Enter your password"
                                                    required
                                                    disabled={loading}
                                                    tabIndex={showManualLogin ? 0 : -1}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                                    tabIndex={showManualLogin ? 0 : -1}
                                                >
                                                    {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-[#5c2d16] text-white py-3.5 rounded-xl text-sm font-semibold shadow-lg shadow-[#5c2d16]/20 hover:bg-[#442112] hover:shadow-xl hover:shadow-[#5c2d16]/30 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                                        tabIndex={showManualLogin ? 0 : -1}
                                    >
                                        {loading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Signing in...
                                            </span>
                                        ) : 'Sign in'}
                                    </button>
                                </form>
                            )}

                            {/* Mobile OTP Form */}
                            {loginMethod === 'mobile' && (
                                <div className="space-y-5 animate-fadeIn">
                                    {!otpSent ? (
                                        <form onSubmit={handleSendOtp} className="space-y-5">
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-semibold text-gray-700 ml-1">Mobile Number</label>
                                                <input
                                                    type="tel"
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:bg-white focus:border-[#5c2d16] focus:ring-4 focus:ring-[#5c2d16]/5 transition-all duration-200"
                                                    placeholder="Enter your mobile number"
                                                    required
                                                    maxLength={15}
                                                    disabled={loading}
                                                    tabIndex={showManualLogin ? 0 : -1}
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={loading || phone.length < 10}
                                                className="w-full bg-[#5c2d16] text-white py-3.5 rounded-xl text-sm font-semibold shadow-lg shadow-[#5c2d16]/20 hover:bg-[#442112] hover:shadow-xl hover:shadow-[#5c2d16]/30 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                                                tabIndex={showManualLogin ? 0 : -1}
                                            >
                                                {loading ? 'Sending Code...' : 'Send Verification Code'}
                                            </button>
                                        </form>
                                    ) : (
                                        <form onSubmit={handleVerifyOtp} className="space-y-5">
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center ml-1">
                                                    <label className="text-sm font-semibold text-gray-700">Verification Code</label>
                                                    <button
                                                        type="button"
                                                        onClick={() => setOtpSent(false)}
                                                        className="text-xs font-medium text-[#5c2d16] hover:underline"
                                                    >
                                                        Change Number
                                                    </button>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={otp}
                                                    onChange={(e) => setOtp(e.target.value)}
                                                    className="w-full px-4 py-4 text-center text-2xl font-bold tracking-[0.5em] bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-300 shadow-sm focus:outline-none focus:bg-white focus:border-[#5c2d16] focus:ring-4 focus:ring-[#5c2d16]/5 transition-all duration-200"
                                                    placeholder="000000"
                                                    required
                                                    maxLength={6}
                                                    disabled={loading}
                                                    tabIndex={showManualLogin ? 0 : -1}
                                                />
                                                <p className="text-xs text-center text-gray-500">
                                                    Code sent to <span className="font-medium text-gray-900">{phone}</span>
                                                </p>
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={loading || otp.length < 6}
                                                className="w-full bg-[#5c2d16] text-white py-3.5 rounded-xl text-sm font-semibold shadow-lg shadow-[#5c2d16]/20 hover:bg-[#442112] hover:shadow-xl hover:shadow-[#5c2d16]/30 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                                                tabIndex={showManualLogin ? 0 : -1}
                                            >
                                                {loading ? 'Verifying...' : 'Verify & Sign In'}
                                            </button>
                                        </form>
                                    )}
                                </div>
                            )}
                        </div>
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
export default LoginPage;
