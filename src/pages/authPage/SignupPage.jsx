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

        if (password.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }

        setLoading(true);

        try {
            const result = await registerUser({ fullname, email, phone, password });

            if (result.success) {
                login(result.data);
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
            <div className="flex-1 flex items-center justify-center px-4 sm:px-10 lg:px-24 py-10 bg-gradient-to-br from-amber-50 via-rose-50 to-white overflow-y-auto">
                <div className="w-full max-w-lg mx-auto bg-white/90 backdrop-blur border border-amber-200 shadow-xl rounded-2xl p-6 sm:p-8">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#5c2d16] mb-2">
                            Create your account
                        </h2>
                        <p className="text-sm sm:text-base text-gray-600">
                            Join us and start your wellness journey.
                        </p>
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
                                onClick={() => setShowEmailSignup(!showEmailSignup)}
                                className="inline-flex items-center gap-2 px-4 py-1.5 bg-white text-gray-500 hover:text-[#5c2d16] border border-gray-200 rounded-full shadow-sm hover:shadow-md transition-all"
                            >
                                <span>{showEmailSignup ? 'Hide email signup' : 'Or sign up with email'}</span>
                                <BsChevronDown
                                    className={`transition-transform duration-300 ${showEmailSignup ? 'rotate-180' : ''}`}
                                />
                            </button>
                        </div>
                    </div>

                    {/* Email Signup */}
                    <div
                        className={`transition-all duration-300 ease-in-out overflow-hidden ${showEmailSignup ? 'max-h-[1100px] opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-2'
                            }`}
                    >
                        <form onSubmit={handleSignup} className="space-y-5">
                            {/* Row 1 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-semibold tracking-wide text-[#5c2d16] mb-2 uppercase">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={fullname}
                                        onChange={(e) => setFullname(e.target.value)}
                                        placeholder="Enter your full name"
                                        className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#5c2d16]/70 focus:border-transparent placeholder:text-gray-400"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold tracking-wide text-[#5c2d16] mb-2 uppercase">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) =>
                                            setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))
                                        }
                                        placeholder="10-digit mobile number"
                                        className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#5c2d16]/70 focus:border-transparent placeholder:text-gray-400"
                                        required
                                        maxLength={10}
                                    />
                                </div>
                            </div>

                            {/* Row 2 */}
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
                                    tabIndex={showEmailSignup ? 0 : -1}
                                />
                            </div>

                            {/* Row 3 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-semibold tracking-wide text-[#5c2d16] mb-2 uppercase">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Create a strong password"
                                            className="w-full px-4 py-3 pr-12 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#5c2d16]/70 focus:border-transparent placeholder:text-gray-400"
                                            required
                                            tabIndex={showEmailSignup ? 0 : -1}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#5c2d16] transition-colors"
                                            tabIndex={showEmailSignup ? 0 : -1}
                                        >
                                            {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                                        </button>
                                    </div>
                                    <p className="mt-1 text-[11px] text-gray-400">
                                        Use at least 8 characters with a mix of letters & numbers.
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold tracking-wide text-[#5c2d16] mb-2 uppercase">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Re-enter your password"
                                            className="w-full px-4 py-3 pr-12 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#5c2d16]/70 focus:border-transparent placeholder:text-gray-400"
                                            required
                                            tabIndex={showEmailSignup ? 0 : -1}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#5c2d16] transition-colors"
                                            tabIndex={showEmailSignup ? 0 : -1}
                                        >
                                            {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full bg-[#5c2d16] text-white py-3.5 rounded-lg mt-2 text-sm sm:text-base font-semibold shadow-md hover:bg-[#442112] hover:shadow-lg transition disabled:bg-gray-300 disabled:text-gray-100 disabled:shadow-none disabled:cursor-not-allowed"
                                disabled={loading}
                                tabIndex={showEmailSignup ? 0 : -1}
                            >
                                {loading ? 'Creating your account...' : 'Create Account'}
                            </button>
                        </form>
                    </div>

                    {/* Footer */}
                    <p className="mt-8 text-gray-500 text-center text-xs sm:text-sm">
                        Already have an account?{' '}
                        <Link
                            to="/login"
                            className="text-[#5c2d16] hover:text-[#442112] font-semibold underline-offset-2 hover:underline transition"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>

        </div>
    );
};

export default SignupPage;
