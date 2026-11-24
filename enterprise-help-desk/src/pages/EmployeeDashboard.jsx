
import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Bot,
  LayoutDashboard,
  Ticket,
  MessageCircle,
  Clock3,
  CheckCircle2,
  Plus,
  ArrowRight,
  Settings,
  LogOut,
  Search,
  Bell,
  Sparkles,
  Wifi,
  Mail,
  Printer,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

function EmployeeDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Logged-in user details
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

  const displayName = storedUser.username || "Employee";
  const firstName = displayName.trim().split(/\s+/)[0];
  const avatarInitial = displayName.trim().charAt(0).toUpperCase();

  // Fetch real tickets from Django
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const token =
          localStorage.getItem("access_token") ||
          localStorage.getItem("access") ||
          localStorage.getItem("accessToken") ||
          localStorage.getItem("token");

        if (!token) {
          console.error("No access token found.");
          return;
        }

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"}/api/tickets/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Dashboard tickets loaded:", response.data);
        setTickets(response.data);
      } catch (error) {
        console.error("Failed to load dashboard tickets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  // Convert backend status into readable text
  const getStatusText = (status) => {
    const value = (status || "OPEN").toUpperCase();

    if (value === "IN_PROGRESS") return "In Progress";
    if (value === "WAITING_FOR_USER") return "Waiting for User";
    if (value === "RESOLVED") return "Resolved";
    if (value === "CLOSED") return "Closed";

    return "Open";
  };

  // Select an icon based on ticket category
  const getTicketIcon = (ticket) => {
    const category = String(ticket.category || "").toLowerCase();
    const title = String(ticket.title || "").toLowerCase();

    if (category.includes("wifi") || category.includes("network") ||
        title.includes("wifi")) {
      return Wifi;
    }

    if (category.includes("email") || category.includes("mail") ||
        title.includes("email")) {
      return Mail;
    }

    if (category.includes("printer") || title.includes("printer")) {
      return Printer;
    }

    return Ticket;
  };

  // Dynamic dashboard statistics
  const openCount = tickets.filter((ticket) =>
    ["OPEN", "WAITING_FOR_USER"].includes(
      (ticket.status || "OPEN").toUpperCase()
    )
  ).length;

  const progressCount = tickets.filter(
    (ticket) => (ticket.status || "").toUpperCase() === "IN_PROGRESS"
  ).length;

  const resolvedCount = tickets.filter((ticket) =>
    ["RESOLVED", "CLOSED"].includes(
      (ticket.status || "").toUpperCase()
    )
  ).length;

  const stats = [
    {
      label: "Open Tickets",
      value: loading ? "..." : String(openCount).padStart(2, "0"),
      icon: Ticket,
    },
    {
      label: "In Progress",
      value: loading ? "..." : String(progressCount).padStart(2, "0"),
      icon: Clock3,
    },
    {
      label: "Resolved",
      value: loading ? "..." : String(resolvedCount).padStart(2, "0"),
      icon: CheckCircle2,
    },
    {
      label: "AI Resolutions",
      value: "—",
      icon: Bot,
    },
  ];

  // Show the latest three tickets
  const recentTickets = [...tickets]
    .sort(
      (a, b) =>
        new Date(b.created_at || 0) - new Date(a.created_at || 0)
    )
    .slice(0, 3);

  return (
    <div className="dashboard-page">

      {/* Sidebar */}
      <aside className="dashboard-sidebar">

        <div className="dashboard-brand">
          <div className="dashboard-brand-icon">
            <Bot size={22} />
          </div>

          <div>
            <strong>HelpDesk AI</strong>
            <span>Enterprise Support</span>
          </div>
        </div>

        <nav className="dashboard-nav">

          <p className="nav-heading">MAIN MENU</p>

          <Link className="dashboard-nav-link active" to="/dashboard">
            <LayoutDashboard size={19} />
            Dashboard
          </Link>

          <Link className="dashboard-nav-link" to="/tickets">
            <Ticket size={19} />
            My Tickets
            <span className="nav-badge">{tickets.length}</span>
          </Link>

          <Link className="dashboard-nav-link" to="/ai-support">
            <MessageCircle size={19} />
            AI Support Agent
          </Link>

          <p className="nav-heading second-heading">ACCOUNT</p>

          <Link className="dashboard-nav-link" to="/settings">
            <Settings size={19} />
            Settings
          </Link>

        </nav>

        <div className="sidebar-help-card">
          <Sparkles size={22} />

          <strong>Need instant help?</strong>

          <p>
            Ask our AI Support Agent and get an answer in seconds.
          </p>

          <Link to="/ai-support">
            Start Chat
            <ArrowRight size={15} />
          </Link>
        </div>

        <button
          className="sidebar-logout"
          onClick={() => {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            window.location.href = "/login";
          }}
        >
          <LogOut size={18} />
          Sign Out
        </button>

      </aside>

      {/* Main Dashboard */}
      <main className="dashboard-main">

        {/* Header */}
        <header className="dashboard-header">

          <div>
            <p className="dashboard-breadcrumb">
              Employee Portal / Dashboard
            </p>

            <h1>
              Hello, {firstName} 👋
            </h1>

            <p>
              Here's what's happening with your support requests.
            </p>
          </div>

          <div className="dashboard-header-actions">

            <button className="icon-button">
              <Search size={20} />
            </button>

            <button className="icon-button notification-button">
              <Bell size={20} />
              <span></span>
            </button>

            <div className="dashboard-avatar">
              {avatarInitial}
            </div>

          </div>

        </header>

        {/* AI Support Banner */}
        <motion.section
          className="ai-dashboard-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >

          <div className="ai-dashboard-content">

            <div className="ai-dashboard-icon">
              <Bot size={30} />
            </div>

            <div>

              <div className="ai-title-row">

                <h2>
                  How can I help you today?
                </h2>

                <span className="ai-online">
                  <span></span>
                  AI Online
                </span>

              </div>

              <p>
                Describe your technical issue and our AI Support Agent
                will help you solve it instantly.
              </p>

              <Link
                to="/ai-support"
                className="ai-chat-button"
              >
                <MessageCircle size={18} />
                Start AI Support Chat
                <ArrowRight size={17} />
              </Link>

            </div>

          </div>

          <div className="ai-decoration">
            <div className="ai-orb orb-one"></div>
            <div className="ai-orb orb-two"></div>
            <Sparkles size={70} />
          </div>

        </motion.section>

        {/* Statistics */}
        <section className="dashboard-stats">

          {stats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <motion.div
                className="dashboard-stat-card"
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
              >

                <div className="stat-icon">
                  <Icon size={20} />
                </div>

                <div>
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>
                </div>

              </motion.div>
            );
          })}

        </section>

        {/* Dashboard Content */}
        <section className="dashboard-content-grid">

          {/* Recent Tickets */}
          <div className="dashboard-panel tickets-panel">

            <div className="panel-header">

              <div>
                <h2>Recent Tickets</h2>
                <p>Your latest support requests</p>
              </div>

              <Link to="/tickets">
                View all
                <ArrowRight size={16} />
              </Link>

            </div>

            <div className="ticket-list">

              {loading ? (

                <div className="dashboard-ticket">
                  <div className="ticket-info">
                    <strong>Loading tickets...</strong>
                    <span>Please wait.</span>
                  </div>
                </div>

              ) : recentTickets.length === 0 ? (

                <div className="dashboard-ticket">
                  <div className="ticket-icon">
                    <Ticket size={19} />
                  </div>

                  <div className="ticket-info">
                    <strong>No tickets yet</strong>
                    <span>Your support requests will appear here.</span>
                  </div>
                </div>

              ) : (

                recentTickets.map((ticket) => {
                  const Icon = getTicketIcon(ticket);
                  const statusText = getStatusText(ticket.status);

                  return (
                    <div
                      className="dashboard-ticket"
                      key={ticket.id}
                    >

                      <div className="ticket-icon">
                        <Icon size={19} />
                      </div>

                      <div className="ticket-info">

                        <strong>{ticket.title}</strong>

                        <span>
                          #HD-{String(ticket.id).padStart(4, "0")}
                          {" · "}
                          {ticket.created_at
                            ? new Date(ticket.created_at).toLocaleString()
                            : "Date unavailable"}
                        </span>

                      </div>

                      <span
                        className={`ticket-status ${statusText
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        {statusText}
                      </span>

                    </div>
                  );
                })

              )}

            </div>

          </div>

          {/* Quick Actions */}
          <div className="dashboard-panel quick-actions-panel">

            <div className="panel-header">

              <div>
                <h2>Quick Actions</h2>
                <p>Get support faster</p>
              </div>

            </div>

            <div className="quick-actions">

              <Link
                to="/ai-support"
                className="quick-action primary-action"
              >

                <div>
                  <Bot size={21} />
                </div>

                <span>
                  <strong>Ask AI Support</strong>
                  <small>Get instant help</small>
                </span>

                <ArrowRight size={17} />

              </Link>

              <Link
                to="/tickets/new"
                className="quick-action"
              >

                <div>
                  <Plus size={21} />
                </div>

                <span>
                  <strong>Create Ticket</strong>
                  <small>Contact support staff</small>
                </span>

                <ArrowRight size={17} />

              </Link>

              <Link
                to="/tickets"
                className="quick-action"
              >

                <div>
                  <Ticket size={21} />
                </div>

                <span>
                  <strong>Track Tickets</strong>
                  <small>Check your requests</small>
                </span>

                <ArrowRight size={17} />

              </Link>

            </div>

          </div>

        </section>

        {/* Security Notice */}
        <motion.section
          className="dashboard-notice"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >

          <div className="notice-icon">
            <ShieldCheck size={21} />
          </div>

          <div>

            <strong>
              Your support data is secure
            </strong>

            <p>
              Your conversations and support requests are protected
              with enterprise-level security.
            </p>

          </div>

        </motion.section>

      </main>

    </div>
  );
}

export default EmployeeDashboard;
