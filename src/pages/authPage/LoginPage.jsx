import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { BsChevronLeft, BsChevronDown } from "react-icons/bs";
import { loginUser } from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";
import GoogleLoginButton from "../../components/auth/GoogleLoginButton";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [showEmailLogin, setShowEmailLogin] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation(); // Add useLocation
    const { login } = useAuth();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await loginUser({ email, password });

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
        <div className="min-h-screen flex bg-gradient-to-br from-amber-50 via-rose-50 to-white">
            <div className="flex-1 flex items-center justify-center px-4 sm:px-10 lg:px-24 py-10 bg-white/80 backdrop-blur">
                <div className="w-full max-w-md mx-auto bg-white rounded-2xl border border-amber-100 shadow-xl p-6 sm:p-8">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-gray-500 hover:text-[#5c2d16] mb-6 sm:mb-8 transition group text-sm"
                    >
                        <div className="h-8 w-8 rounded-full border border-gray-200 flex items-center justify-center group-hover:border-[#5c2d16] transition-colors">
                            <BsChevronLeft className="text-base group-hover:-translate-x-1 transition-transform" />
                        </div>
                        <span className="font-medium">Back to home</span>
                    </button>

                    {/* Header */}
                    <div className="mb-6 sm:mb-8">
                        <h2 className="text-2xl sm:text-3xl font-bold text-[#5c2d16] mb-2">
                            Welcome back
                        </h2>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm flex items-start gap-2">
                            <span className="mt-0.5 text-red-500 text-lg">⚠️</span>
                            <p className="leading-snug">{error}</p>
                        </div>
                    )}

                    {/* Google Login */}
                    <div className="mb-4">
                        <GoogleLoginButton />
                    </div>

                    {/* Divider / Toggle */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-xs sm:text-sm">
                            <button
                                type="button"
                                onClick={() => setShowEmailLogin(!showEmailLogin)}
                                className="px-4 py-1.5 bg-white text-gray-500 hover:text-[#5c2d16] hover:bg-gray-50 border border-gray-200 rounded-full shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                            >
                                <span>{showEmailLogin ? 'Hide email login' : 'Or sign in with email'}</span>
                                <BsChevronDown
                                    className={`transition-transform duration-300 ${showEmailLogin ? 'rotate-180' : ''
                                        }`}
                                />
                            </button>
                        </div>
                    </div>

                    {/* Email Login */}
                    <div
                        className={`transition-all duration-300 ease-in-out overflow-hidden ${showEmailLogin
                                ? 'max-h-[600px] opacity-100 translate-y-0'
                                : 'max-h-0 opacity-0 -translate-y-2'
                            }`}
                    >
                        <form onSubmit={handleLogin} className="space-y-5">
                            {/* Email */}
                            <div>
                                <label className="block text-xs font-semibold tracking-wide text-[#5c2d16] mb-2 uppercase">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#5c2d16]/70 focus:border-transparent placeholder:text-gray-400"
                                    required
                                    disabled={loading}
                                    tabIndex={showEmailLogin ? 0 : -1}
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-xs font-semibold tracking-wide text-[#5c2d16] mb-2 uppercase">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        className="w-full px-4 py-3 pr-12 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#5c2d16]/70 focus:border-transparent placeholder:text-gray-400"
                                        required
                                        tabIndex={showEmailLogin ? 0 : -1}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#5c2d16] transition-colors"
                                        tabIndex={showEmailLogin ? 0 : -1}
                                    >
                                        {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                                    </button>
                                </div>
                                <div className="mt-2 flex justify-between items-center text-[11px] text-gray-400">
                                    <span>Use at least 8 characters.</span>
                                    {/* Optional: add forgot password route later */}
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                className="w-full bg-[#5c2d16] text-white py-3.5 rounded-lg text-sm sm:text-base font-semibold shadow-md hover:bg-[#442112] hover:shadow-lg transition disabled:bg-gray-300 disabled:text-gray-100 disabled:shadow-none disabled:cursor-not-allowed"
                                disabled={loading}
                                tabIndex={showEmailLogin ? 0 : -1}
                            >
                                {loading ? 'Logging you in...' : 'Login'}
                            </button>
                        </form>
                    </div>

                    {/* Footer */}
                    <p className="mt-8 text-gray-500 text-center text-xs sm:text-sm">
                        Don&apos;t have an account?{' '}
                        <Link
                            to="/signup"
                            className="text-[#5c2d16] hover:text-[#442112] font-semibold underline-offset-2 hover:underline transition"
                        >
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>

    );
};

export default LoginPage;
