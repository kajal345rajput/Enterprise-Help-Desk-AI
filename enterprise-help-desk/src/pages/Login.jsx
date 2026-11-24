import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  Eye,
  EyeOff,
} from "lucide-react";

const API = `${import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"}/api`;
function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const successMessage = location.state?.message || "";

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API}/login/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: form.username,
            password: form.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid username or password.");
        setLoading(false);
        return;
      }

      // Save JWT tokens
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);

      // Save logged-in user
      localStorage.setItem("user", JSON.stringify(data.user));

      // Role-based navigation
      if (data.user.role === "ADMIN") {
        navigate("/admin");
      } else if (data.user.role === "SUPPORT") {
        navigate("/support");
      } else {
        navigate("/dashboard");
      }

    } catch (error) {
      setError(
        "Unable to connect to the server. Please make sure Django is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-orb auth-orb-one"></div>
      <div className="auth-orb auth-orb-two"></div>
      <div className="auth-grid"></div>

      <header className="auth-navbar">
        <Link to="/" className="auth-brand">
          <div className="brand-icon">
            <Bot size={21} />
          </div>

          <div>
            <strong>Enterprise Help Desk</strong>
            <span>AI-Powered IT Support</span>
          </div>
        </Link>

        <Link to="/" className="back-home">
          <ArrowLeft size={16} />
          Back to Home
        </Link>
      </header>

      <main className="auth-container">

        <motion.section
          className="auth-showcase"
          initial={{ opacity: 0, x: -35 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >

          <div className="auth-label">
            <Sparkles size={14} />
            INTELLIGENT ENTERPRISE SUPPORT
          </div>

          <h1>
            Welcome back to
            <span> smarter IT support.</span>
          </h1>

          <p>
            Access your AI-powered support workspace, find solutions faster,
            and connect with human support whenever you need it.
          </p>

          <div className="auth-features">

            <div className="auth-feature">
              <div>
                <Bot size={19} />
              </div>

              <section>
                <strong>AI Support Agent</strong>
                <span>Get intelligent answers instantly.</span>
              </section>
            </div>

            <div className="auth-feature">
              <div>
                <ShieldCheck size={19} />
              </div>

              <section>
                <strong>Enterprise Security</strong>
                <span>Protected role-based access.</span>
              </section>
            </div>

            <div className="auth-feature">
              <div>
                <LockKeyhole size={19} />
              </div>

              <section>
                <strong>Secure Authentication</strong>
                <span>JWT-protected application access.</span>
              </section>
            </div>

          </div>

          <div className="auth-mini-orb">

            <div className="auth-ai-core">
              <Bot size={34} />
            </div>

            <div className="auth-orbit orbit-one"></div>
            <div className="auth-orbit orbit-two"></div>

          </div>

        </motion.section>

        <motion.section
          className="login-card"
          initial={{ opacity: 0, y: 35, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >

          <div className="login-card-top">

            <div className="login-icon">
              <LockKeyhole size={23} />
            </div>

            <div>
              <span>SECURE ACCESS</span>
              <h2>Sign in</h2>
            </div>

          </div>

          <p className="login-description">
            Enter your credentials to access your support workspace.
          </p>

          {successMessage && (
            <div className="login-success">
              {successMessage}
            </div>
          )}

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <div className="form-group">

              <label>Username</label>

              <div className="input-wrapper">

                <Mail size={17} />

                <input
                  type="text"
                  name="username"
                  placeholder="Enter your username"
                  value={form.username}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>

            <div className="form-group">

              <label>Password</label>

              <div className="input-wrapper">

                <LockKeyhole size={17} />

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>

              </div>

            </div>

            <div className="login-options">

              <label className="remember">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                className="forgot-password"
              >
                Forgot password?
              </button>

            </div>

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}

              {!loading && <ArrowRight size={18} />}
            </button>

          </form>

          <div className="login-divider">
            <span>OR</span>
          </div>

          <div className="login-security">
            <ShieldCheck size={16} />
            <span>Your connection is protected</span>
          </div>

          <p className="register-text">
            Don't have an account?
            <Link to="/register"> Create one</Link>
          </p>

        </motion.section>

      </main>

      <footer className="auth-footer">
        <span>© 2026 Enterprise Help Desk</span>
        <span>AI • RAG • Secure Support</span>
      </footer>

    </div>
  );
}

export default Login;