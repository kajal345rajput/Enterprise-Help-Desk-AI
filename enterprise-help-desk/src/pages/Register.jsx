import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Building2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";


function Register() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    department: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");


  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setError("");
  };


  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");


    /* PASSWORD CHECK */

    if (form.password !== form.confirmPassword) {

      setError("Passwords do not match.");

      return;
    }


    try {

      const response = await fetch(
        "http://127.0.0.1:8000/api/register/",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({

            username: form.username,

            email: form.email,

            password: form.password,

            department: form.department,

          }),
        }
      );


      const data = await response.json();


      /* BACKEND ERROR */

      if (!response.ok) {

        setError(
          data.error || "Registration failed."
        );

        return;
      }


      /* SUCCESS */

      navigate("/login", {

        state: {
          message:
            "Account created successfully. Please sign in.",
        },

      });

    }

    catch (error) {

      setError(
        "Unable to connect to the server. Please make sure Django is running."
      );

    }

  };


  return (

    <div className="register-page">


      {/* =================================================
          BACKGROUND
      ================================================= */}

      <div className="register-bg-grid"></div>

      <div className="register-glow register-glow-blue"></div>

      <div className="register-glow register-glow-purple"></div>


      {/* =================================================
          NAVBAR
      ================================================= */}

      <header className="register-navbar">


        <Link
          to="/"
          className="register-brand"
        >

          <div className="register-brand-icon">

            <Bot size={20} />

          </div>


          <div className="register-brand-text">

            <strong>
              Enterprise Help Desk
            </strong>

            <span>
              AI-POWERED IT SUPPORT
            </span>

          </div>

        </Link>


        <Link
          to="/"
          className="register-back"
        >

          <ArrowLeft size={14} />

          Back to Home

        </Link>

      </header>


      {/* =================================================
          MAIN
      ================================================= */}

      <main className="register-main">


        {/* =================================================
            LEFT SIDE
        ================================================= */}

        <motion.section

          className="register-left"

          initial={{
            opacity: 0,
            x: -35,
          }}

          animate={{
            opacity: 1,
            x: 0,
          }}

          transition={{
            duration: 0.7,
            ease: "easeOut",
          }}

        >


          {/* BADGE */}

          <motion.div

            className="register-badge"

            initial={{
              opacity: 0,
              y: 10,
            }}

            animate={{
              opacity: 1,
              y: 0,
            }}

            transition={{
              delay: 0.2,
              duration: 0.5,
            }}

          >

            <span>✦</span>

            INTELLIGENT ENTERPRISE SUPPORT

          </motion.div>


          {/* HEADING */}

          <motion.h1

            initial={{
              opacity: 0,
              y: 20,
            }}

            animate={{
              opacity: 1,
              y: 0,
            }}

            transition={{
              delay: 0.25,
              duration: 0.6,
            }}

          >

            Create your

            <br />

            <span>
              smarter IT workspace.
            </span>

          </motion.h1>


          {/* DESCRIPTION */}

          <motion.p

            className="register-description"

            initial={{
              opacity: 0,
            }}

            animate={{
              opacity: 1,
            }}

            transition={{
              delay: 0.45,
              duration: 0.6,
            }}

          >

            One secure workspace for AI-powered IT
            support, find solutions faster, and connect
            with human support whenever you need it.

          </motion.p>


          {/* FEATURE 1 */}

          <motion.div

            className="register-feature"

            initial={{
              opacity: 0,
              x: -15,
            }}

            animate={{
              opacity: 1,
              x: 0,
            }}

            transition={{
              delay: 0.5,
            }}

          >

            <div className="register-feature-icon">

              <Bot size={18} />

            </div>


            <div>

              <strong>
                AI Support Agent
              </strong>

              <span>
                Get intelligent answers instantly.
              </span>

            </div>

          </motion.div>


          {/* FEATURE 2 */}

          <motion.div

            className="register-feature"

            initial={{
              opacity: 0,
              x: -15,
            }}

            animate={{
              opacity: 1,
              x: 0,
            }}

            transition={{
              delay: 0.6,
            }}

          >

            <div className="register-feature-icon">

              <ShieldCheck size={18} />

            </div>


            <div>

              <strong>
                Enterprise Security
              </strong>

              <span>
                Protected role-based access.
              </span>

            </div>

          </motion.div>


          {/* FEATURE 3 */}

          <motion.div

            className="register-feature"

            initial={{
              opacity: 0,
              x: -15,
            }}

            animate={{
              opacity: 1,
              x: 0,
            }}

            transition={{
              delay: 0.7,
            }}

          >

            <div className="register-feature-icon">

              <Users size={18} />

            </div>


            <div>

              <strong>
                Human Support
              </strong>

              <span>
                Expert assistance when needed.
              </span>

            </div>

          </motion.div>


          {/* =================================================
              AI ORB
          ================================================= */}

          <motion.div

            className="register-orb-area"

            animate={{
              y: [0, -7, 0],
            }}

            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}

          >

            <div
              className="register-orbit register-orbit-one"
            ></div>


            <div
              className="register-orbit register-orbit-two"
            ></div>


            <div className="register-orb">

              <Bot size={31} />

            </div>

          </motion.div>


          {/* FOOTER */}

          <div className="register-left-footer">

            © 2026 Enterprise Help Desk

          </div>

        </motion.section>


        {/* =================================================
            RIGHT CARD
        ================================================= */}

        <motion.section

          className="register-card"

          initial={{
            opacity: 0,
            y: 25,
            scale: 0.98,
          }}

          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}

          transition={{
            duration: 0.7,
            delay: 0.1,
            ease: "easeOut",
          }}

        >


          {/* TOP LINE */}

          <div className="register-card-line"></div>


          {/* HEADER */}

          <div className="register-card-header">


            <div className="register-card-icon">

              <User size={22} />

            </div>


            <div>

              <span>
                SECURE REGISTRATION
              </span>

              <h2>
                Create account
              </h2>

            </div>

          </div>


          <p className="register-card-description">

            Create your credentials to access your
            support workspace.

          </p>


          {/* =================================================
              FORM
          ================================================= */}

          <form onSubmit={handleSubmit}>


            {/* USERNAME */}

            <div className="register-input-group">

              <label>
                Username
              </label>


              <div className="register-input-box">

                <User size={18} />

                <input

                  type="text"

                  name="username"

                  value={form.username}

                  onChange={handleChange}

                  placeholder="Enter your username"

                  required

                />

              </div>

            </div>


            {/* EMAIL */}

            <div className="register-input-group">

              <label>
                Work Email
              </label>


              <div className="register-input-box">

                <Mail size={18} />

                <input

                  type="email"

                  name="email"

                  value={form.email}

                  onChange={handleChange}

                  placeholder="Enter your work email"

                  required

                />

              </div>

            </div>


            {/* DEPARTMENT */}

            <div className="register-input-group">

              <label>
                Department
              </label>


              <div className="register-input-box">

                <Building2 size={18} />

                <input

                  type="text"

                  name="department"

                  value={form.department}

                  onChange={handleChange}

                  placeholder="IT, HR, Finance..."

                />

              </div>

            </div>


            {/* PASSWORDS */}

            <div className="register-password-row">


              <div className="register-input-group">

                <label>
                  Password
                </label>


                <div className="register-input-box">

                  <LockKeyhole size={18} />

                  <input

                    type="password"

                    name="password"

                    value={form.password}

                    onChange={handleChange}

                    placeholder="Create password"

                    required

                  />

                </div>

              </div>


              <div className="register-input-group">

                <label>
                  Confirm Password
                </label>


                <div className="register-input-box">

                  <LockKeyhole size={18} />

                  <input

                    type="password"

                    name="confirmPassword"

                    value={form.confirmPassword}

                    onChange={handleChange}

                    placeholder="Confirm password"

                    required

                  />

                </div>

              </div>

            </div>


            {/* ERROR */}

            {error && (

              <motion.div

                className="register-error"

                initial={{
                  opacity: 0,
                  y: -5,
                }}

                animate={{
                  opacity: 1,
                  y: 0,
                }}

              >

                {error}

              </motion.div>

            )}


            {/* TERMS */}

            <label className="register-terms">

              <input
                type="checkbox"
                required
              />

              <span>
                I agree to the secure authentication policy.
              </span>

            </label>


            {/* BUTTON */}

            <motion.button

              type="submit"

              className="register-submit"

              whileHover={{
                y: -2,
                scale: 1.01,
              }}

              whileTap={{
                scale: 0.98,
              }}

            >

              Create Account

              <ArrowRight size={18} />

            </motion.button>

          </form>


          {/* SECURITY */}

          <div className="register-security">

            <ShieldCheck size={15} />

            <span>
              Your connection is protected
            </span>

          </div>


          {/* LOGIN */}

          <div className="register-login">

            Already have an account?

            <Link to="/login">
              Sign in
            </Link>

          </div>

        </motion.section>

      </main>

    </div>
  );
}


export default Register;