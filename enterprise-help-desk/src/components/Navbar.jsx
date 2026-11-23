import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";

function Navbar() {
  return (
    <nav className="navbar">

      {/* Logo */}
      <Link to="/" className="brand">

        <div className="brand-icon">
          <ShieldCheck size={22} />
        </div>

        <div className="brand-text">
          <span className="brand-name">HelpDesk AI</span>
          <span className="brand-subtitle">
            Enterprise Support
          </span>
        </div>

      </Link>

      {/* Navigation */}
      <div className="nav-links">

        <a href="#features">Features</a>

        <a href="#how-it-works">
          How it works
        </a>

        <a href="#solutions">
          Solutions
        </a>

      </div>

      {/* Actions */}
      <div className="nav-actions">

        <Link to="/login" className="login-link">
          Sign in
        </Link>

        <Link to="/register" className="nav-button">
          Get Started
          <ArrowRight size={16} />
        </Link>

      </div>

    </nav>
  );
}

export default Navbar;