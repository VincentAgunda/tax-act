import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";

const fadeIn = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get redirect URL from query string (if exists)
  const params = new URLSearchParams(location.search);
  const redirectTo = params.get("redirect") || "/admin";

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate(redirectTo, { replace: true });
    }
  }, [currentUser, navigate, redirectTo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      navigate(redirectTo, { replace: true }); // Redirect where they came from
    } catch (error) {
      console.error("Login error:", error.message);
      setError(error.message || "Failed to sign in. Please check your credentials.");
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
        className="relative z-10 max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl"
      >
        <h2 className="text-center text-3xl font-extrabold text-white mb-4">
          Sign In
        </h2>
        <p className="text-center text-gray-300 text-sm mb-6">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="text-white font-medium hover:underline"
          >
            Create one here
          </Link>
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
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
            placeholder="Password"
            required
            className="w-full p-3 rounded-md bg-black/20 border border-gray-400 text-white placeholder-gray-300 focus:ring-2 focus:ring-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black py-3 rounded-md font-semibold hover:bg-gray-200 transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
