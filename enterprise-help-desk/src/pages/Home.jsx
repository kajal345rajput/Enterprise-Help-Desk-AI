import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import {
  ArrowRight,
  Bot,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Headphones,
  LockKeyhole,
  MessageCircle,
  Network,
  Send,
  ShieldCheck,
  Sparkles,
  Ticket,
  Users,
  Zap,
} from "lucide-react";

function Home() {
  const features = [
    {
      icon: Bot,
      title: "AI Support Agent",
      text: "Get instant answers to common IT problems through an intelligent AI support assistant.",
    },
    {
      icon: BookOpen,
      title: "Knowledge-Based Answers",
      text: "The AI searches your organization's knowledge base before generating a helpful response.",
    },
    {
      icon: Ticket,
      title: "Smart Escalation",
      text: "When AI cannot confidently resolve an issue, the conversation can become a support ticket.",
    },
    {
      icon: ShieldCheck,
      title: "Secure Enterprise Access",
      text: "Role-based access and JWT authentication protect employees, support staff and administrators.",
    },
  ];

  const workflow = [
    {
      number: "01",
      icon: MessageCircle,
      title: "Ask",
      text: "Employee describes the IT problem in natural language.",
    },
    {
      number: "02",
      icon: BookOpen,
      title: "Retrieve",
      text: "RAG searches relevant information from the organization knowledge base.",
    },
    {
      number: "03",
      icon: Bot,
      title: "Resolve",
      text: "The AI agent generates a contextual solution using Gemini.",
    },
    {
      number: "04",
      icon: Headphones,
      title: "Escalate",
      text: "Unresolved issues are sent to human support staff through tickets.",
    },
  ];

  const fadeUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.6 },
  };

  return (
    <div className="home-page">
      {/* ================= NAVBAR ================= */}
      <header className="navbar">
        <div className="container navbar-inner">
          <Link to="/" className="brand">
            <div className="brand-icon">
              <Bot size={22} />
            </div>

            <div>
              <div className="brand-name">Enterprise Help Desk</div>
              <div className="brand-subtitle">AI-Powered IT Support</div>
            </div>
          </Link>

          <nav className="nav-links">
            <a href="#features">Features</a>
            <a href="#workflow">How It Works</a>
            <a href="#security">Security</a>
          </nav>

          <div className="nav-actions">
            <Link to="/login" className="nav-login">
              Login
            </Link>

            <Link to="/register" className="btn btn-primary btn-small">
              Get Started
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <main>
        <section className="hero">
          <div className="hero-glow hero-glow-one"></div>
          <div className="hero-glow hero-glow-two"></div>

          <div className="container hero-grid">
            <motion.div
              className="hero-content"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="hero-badge">
                <Sparkles size={15} />
                AI-POWERED ENTERPRISE SUPPORT
              </div>

              <h1>
                Smarter IT support.
                <span> Faster resolution.</span>
              </h1>

              <p className="hero-description">
                Enterprise Help Desk combines AI, organizational knowledge,
                and human support to solve employee IT problems quickly and
                intelligently.
              </p>

              <div className="hero-actions">
                <Link to="/register" className="btn btn-primary">
                  Start Using Support
                  <ArrowRight size={18} />
                </Link>

                <a href="#features" className="btn btn-secondary">
                  Explore Features
                  <ChevronRight size={18} />
                </a>
              </div>

              <div className="hero-trust">
                <div>
                  <CheckCircle2 size={17} />
                  Secure access
                </div>

                <div>
                  <CheckCircle2 size={17} />
                  Knowledge-driven
                </div>

                <div>
                  <CheckCircle2 size={17} />
                  Human escalation
                </div>
              </div>
            </motion.div>

            {/* AI CHAT PREVIEW */}
            <motion.div
              className="hero-visual"
              initial={{ opacity: 0, x: 40, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.15 }}
            >
              <div className="chat-window">
                <div className="chat-header">
                  <div className="chat-agent">
                    <div className="chat-agent-icon">
                      <Bot size={19} />
                    </div>

                    <div>
                      <strong>AI Support Agent</strong>
                      <span>
                        <span className="online-dot"></span>
                        Online
                      </span>
                    </div>
                  </div>

                  <div className="chat-status">
                    <LockKeyhole size={15} />
                    Secure
                  </div>
                </div>

                <div className="chat-body">
                  <div className="chat-date">TODAY</div>

                  <div className="message message-ai">
                    <div className="message-avatar">
                      <Bot size={15} />
                    </div>

                    <div className="message-content">
                      <span className="message-name">AI Support</span>
                      <p>
                        Hello! I'm your AI Support Agent. How can I help you
                        today?
                      </p>
                    </div>
                  </div>

                  <div className="message message-user">
                    <div className="message-content">
                      <span className="message-name">Employee</span>
                      <p>
                        I cannot connect my laptop to the company Wi-Fi.
                      </p>
                    </div>
                  </div>

                  <div className="message message-ai">
                    <div className="message-avatar">
                      <Bot size={15} />
                    </div>

                    <div className="message-content">
                      <span className="message-name">AI Support</span>
                      <p>
                        I found a relevant network troubleshooting guide. Try
                        reconnecting to the corporate Wi-Fi and verify your
                        network credentials.
                      </p>

                      <div className="knowledge-result">
                        <BookOpen size={15} />
                        <span>Network Troubleshooting Guide</span>
                      </div>
                    </div>
                  </div>

                  <div className="chat-suggestions">
                    <button>Still not working</button>
                    <button>Show troubleshooting steps</button>
                  </div>
                </div>

                <div className="chat-input">
                  <span>Ask your IT support question...</span>

                  <button>
                    <Send size={16} />
                  </button>
                </div>
              </div>

              <div className="floating-card floating-card-one">
                <div className="floating-icon">
                  <Zap size={17} />
                </div>

                <div>
                  <strong>Instant Assistance</strong>
                  <span>AI response generated</span>
                </div>
              </div>

              <div className="floating-card floating-card-two">
                <div className="floating-icon">
                  <Ticket size={17} />
                </div>

                <div>
                  <strong>Smart Escalation</strong>
                  <span>Human support available</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ================= STATS ================= */}
        <section className="stats-section">
          <div className="container stats-grid">
            <div className="stat-item">
              <strong>24/7</strong>
              <span>AI availability</span>
            </div>

            <div className="stat-item">
              <strong>RAG</strong>
              <span>Knowledge search</span>
            </div>

            <div className="stat-item">
              <strong>JWT</strong>
              <span>Secure authentication</span>
            </div>

            <div className="stat-item">
              <strong>3</strong>
              <span>Support roles</span>
            </div>
          </div>
        </section>

        {/* ================= FEATURES ================= */}
        <section id="features" className="features-section">
          <div className="container">
            <motion.div className="section-heading" {...fadeUp}>
              <div className="section-label">
                <Sparkles size={15} />
                CORE CAPABILITIES
              </div>

              <h2>
                Everything needed for
                <span> modern IT support.</span>
              </h2>

              <p>
                A complete help desk experience connecting employees,
                intelligent assistance, organizational knowledge, and human
                support.
              </p>
            </motion.div>

            <div className="features-grid">
              {features.map((feature, index) => {
                const Icon = feature.icon;

                return (
                  <motion.div
                    className="feature-card"
                    key={feature.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.08,
                    }}
                  >
                    <div className="feature-icon">
                      <Icon size={23} />
                    </div>

                    <h3>{feature.title}</h3>

                    <p>{feature.text}</p>

                    <div className="feature-link">
                      Learn more
                      <ArrowRight size={15} />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================= WORKFLOW ================= */}
        <section id="workflow" className="workflow-section">
          <div className="container">
            <motion.div className="section-heading" {...fadeUp}>
              <div className="section-label">
                <Network size={15} />
                AI SUPPORT WORKFLOW
              </div>

              <h2>
                From question to
                <span> resolution.</span>
              </h2>

              <p>
                The system combines retrieval, AI reasoning, and human
                escalation into one simple support workflow.
              </p>
            </motion.div>

            <div className="workflow-grid">
              {workflow.map((step, index) => {
                const Icon = step.icon;

                return (
                  <motion.div
                    className="workflow-step"
                    key={step.number}
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.1,
                    }}
                  >
                    <div className="workflow-top">
                      <span>{step.number}</span>

                      <div className="workflow-icon">
                        <Icon size={21} />
                      </div>
                    </div>

                    <h3>{step.title}</h3>

                    <p>{step.text}</p>

                    {index < workflow.length - 1 && (
                      <div className="workflow-arrow">
                        <ArrowRight size={17} />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================= SECURITY ================= */}
        <section id="security" className="security-section">
          <div className="container security-grid">
            <motion.div {...fadeUp}>
              <div className="section-label">
                <ShieldCheck size={15} />
                ENTERPRISE SECURITY
              </div>

              <h2>
                Designed with
                <span> secure access</span> in mind.
              </h2>

              <p>
                Employees, support staff, and administrators get appropriate
                access based on their role. JWT authentication keeps API
                access protected.
              </p>

              <div className="security-points">
                <div>
                  <CheckCircle2 size={18} />
                  Role-based access
                </div>

                <div>
                  <CheckCircle2 size={18} />
                  JWT authentication
                </div>

                <div>
                  <CheckCircle2 size={18} />
                  Protected support workflows
                </div>
              </div>
            </motion.div>

            <motion.div
              className="security-card"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="security-card-icon">
                <LockKeyhole size={27} />
              </div>

              <h3>Protected Support Environment</h3>

              <p>
                Authentication and role-based permissions help keep employee
                support data inside the correct workflow.
              </p>

              <div className="security-status">
                <span></span>
                Authentication active
              </div>
            </motion.div>
          </div>
        </section>

        {/* ================= CTA ================= */}
        <section className="cta-section">
          <div className="container">
            <motion.div
              className="cta-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="cta-icon">
                <Bot size={30} />
              </div>

              <div className="cta-content">
                <div className="section-label">
                  <Clock3 size={15} />
                  READY WHEN YOU ARE
                </div>

                <h2>Make IT support simpler.</h2>

                <p>
                  Start using an AI-powered help desk designed for modern
                  enterprise support.
                </p>
              </div>

              <Link to="/register" className="btn btn-light">
                Create Account
                <ArrowRight size={18} />
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="footer">
        <div className="container footer-inner">
          <div className="footer-brand">
            <div className="brand-icon">
              <Bot size={20} />
            </div>

            <div>
              <strong>Enterprise Help Desk</strong>
              <span>AI-Powered IT Support</span>
            </div>
          </div>

          <div className="footer-center">
            <span>Built with React.js</span>
            <span>•</span>
            <span>Django REST API</span>
            <span>•</span>
            <span>MySQL</span>
          </div>

          <div className="footer-right">
            <Users size={15} />
            <span>Enterprise Support Platform</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;