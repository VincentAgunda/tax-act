import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient"; // Make sure this path is correct
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

const fadeIn = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false); // New state for success message

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Reset error on new submission

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    if (password.length < 6) {
      return setError("Password must be at least 6 characters long");
    }

    try {
      setLoading(true);
      
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      if (signUpError) throw signUpError;
      
      // Instead of navigating, show the success message
      setIsSubmitted(true);

    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || "Failed to create an account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(/hero-1.png)" }}
      />
      <div className="absolute inset-0 bg-black/60" />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="relative z-10 max-w-lg w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl"
      >
        {isSubmitted ? (
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white mb-4">
              ✅ Registration Successful!
            </h2>
            <p className="text-gray-200 text-lg">
              We've sent a confirmation link to **{email}**.
            </p>
            <p className="text-gray-300 mt-2">
              Please check your inbox (and spam folder) to activate your account before logging in.
            </p>
            <Link 
              to="/login" 
              className="mt-6 inline-block w-full bg-white text-black py-3 rounded-md font-semibold hover:bg-gray-200 transition"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-center text-3xl font-extrabold text-white mb-4">
              Create Account
            </h2>
            <p className="text-center text-gray-300 text-sm mb-6">
              Already have an account?{" "}
              <Link to="/login" className="text-white font-medium hover:underline">
                Sign in here
              </Link>
            </p>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="First Name"
                  required
                  className="p-3 rounded-md bg-black/20 border border-gray-400 text-white placeholder-gray-300 focus:ring-2 focus:ring-white"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  autoComplete="given-name"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  required
                  className="p-3 rounded-md bg-black/20 border border-gray-400 text-white placeholder-gray-300 focus:ring-2 focus:ring-white"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  autoComplete="family-name"
                />
              </div>

              <input
                type="email"
                placeholder="Email address"
                required
                className="w-full p-3 rounded-md bg-black/20 border border-gray-400 text-white placeholder-gray-300 focus:ring-2 focus:ring-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />

              <input
                type="password"
                placeholder="Password (min. 6 characters)"
                required
                minLength={6}
                className="w-full p-3 rounded-md bg-black/20 border border-gray-400 text-white placeholder-gray-300 focus:ring-2 focus:ring-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />

              <input
                type="password"
                placeholder="Confirm Password"
                required
                className="w-full p-3 rounded-md bg-black/20 border border-gray-400 text-white placeholder-gray-300 focus:ring-2 focus:ring-white"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black py-3 rounded-md font-semibold hover:bg-gray-200 transition disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Register;