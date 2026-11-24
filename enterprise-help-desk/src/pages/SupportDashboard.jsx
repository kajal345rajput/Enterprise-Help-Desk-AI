
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Bot,
  LayoutDashboard,
  Ticket,
  Clock3,
  CheckCircle2,
  LogOut,
  RefreshCw,
  Search,
  User,
  MessageCircle,
  Send,
  AlertCircle,
  ShieldCheck,
  UserCheck,
  X,
  ClipboardList,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./SupportDashboard.css";

const API = `${import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"}/api`;

function SupportDashboard() {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const displayName = storedUser.username || "Support Staff";
  const firstName = displayName.trim().split(/\s+/)[0];
  const initial = displayName.charAt(0).toUpperCase();

  const getToken = () =>
    localStorage.getItem("access_token") ||
    localStorage.getItem("access") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token");

  const authConfig = () => ({
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
  });

  const loadTickets = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(
        `${API}/tickets/`,
        authConfig()
      );

      setTickets(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Unable to load assigned tickets:", err);

      if (err.response?.status === 401) {
        setError("Your login session has expired. Please log in again.");
      } else {
        setError(
          err.response?.data?.error ||
          "Unable to load assigned tickets."
        );
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const openTicket = async (ticketId) => {
    setDetailLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.get(
        `${API}/tickets/${ticketId}/`,
        authConfig()
      );

      setSelectedTicket(response.data);
      setMessage("");
      setIsInternal(false);
    } catch (err) {
      console.error("Unable to load ticket details:", err);
      setError(
        err.response?.data?.error ||
        "Unable to open this ticket."
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const refreshSelectedTicket = async () => {
    if (!selectedTicket) return;

    try {
      const response = await axios.get(
        `${API}/tickets/${selectedTicket.id}/`,
        authConfig()
      );

      setSelectedTicket(response.data);
    } catch (err) {
      console.error("Unable to refresh ticket:", err);
    }
  };

  const updateTicket = async (field, value) => {
    if (!selectedTicket) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.patch(
        `${API}/tickets/${selectedTicket.id}/`,
        { [field]: value },
        authConfig()
      );

      setSelectedTicket(response.data);
      setSuccess("Ticket updated successfully.");

      await loadTickets();
    } catch (err) {
      console.error("Ticket update failed:", err);
      setError(
        err.response?.data?.error ||
        "Unable to update ticket."
      );
    } finally {
      setSaving(false);
    }
  };

  const sendMessage = async (event) => {
    event.preventDefault();

    if (!selectedTicket || !message.trim()) return;

    setSending(true);
    setError("");
    setSuccess("");

    try {
      await axios.post(
        `${API}/tickets/${selectedTicket.id}/messages/`,
        {
          message: message.trim(),
          is_internal: isInternal,
        },
        authConfig()
      );

      setMessage("");
      setIsInternal(false);
      setSuccess(
        isInternal
          ? "Internal note added successfully."
          : "Reply sent successfully."
      );

      await refreshSelectedTicket();
    } catch (err) {
      console.error("Message sending failed:", err);
      setError(
        err.response?.data?.error ||
        "Unable to send your message."
      );
    } finally {
      setSending(false);
    }
  };

  const filteredTickets = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return tickets;

    return tickets.filter((ticket) =>
      [
        ticket.title,
        ticket.description,
        ticket.category,
        ticket.status,
        String(ticket.id),
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [tickets, search]);

  const openCount = tickets.filter(
    (ticket) => ticket.status === "OPEN"
  ).length;

  const progressCount = tickets.filter(
    (ticket) => ticket.status === "IN_PROGRESS"
  ).length;

  const resolvedCount = tickets.filter(
    (ticket) => ["RESOLVED", "CLOSED"].includes(ticket.status)
  ).length;

  const stats = [
    { label: "Assigned Tickets", value: tickets.length, icon: Ticket },
    { label: "Open Tickets", value: openCount, icon: AlertCircle },
    { label: "In Progress", value: progressCount, icon: Clock3 },
    { label: "Resolved", value: resolvedCount, icon: CheckCircle2 },
  ];

  const statusLabel = (status) =>
    ({
      OPEN: "Open",
      IN_PROGRESS: "In Progress",
      WAITING_FOR_USER: "Waiting for User",
      RESOLVED: "Resolved",
      CLOSED: "Closed",
    })[status] || status || "Open";

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleString();
  };

  const messages = selectedTicket?.messages || [];

  const logout = () => {
    [
      "access_token",
      "refresh_token",
      "access",
      "refresh",
      "accessToken",
      "token",
      "user",
    ].forEach((key) => localStorage.removeItem(key));

    navigate("/login");
  };

  return (
    <div className="dashboard-page support-dashboard-page">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <div className="dashboard-brand-icon">
            <Bot size={22} />
          </div>

          <div>
            <strong>HelpDesk AI</strong>
            <span>Support Portal</span>
          </div>
        </div>

        <nav className="dashboard-nav">
          <p className="nav-heading">MAIN MENU</p>

          <button className="dashboard-nav-link active">
            <LayoutDashboard size={19} />
            Support Dashboard
          </button>

          <button
            className="dashboard-nav-link"
            onClick={() => {
              setSelectedTicket(null);
              loadTickets();
            }}
          >
            <Ticket size={19} />
            Assigned Tickets
            <span className="nav-badge">{tickets.length}</span>
          </button>

          <p className="nav-heading second-heading">ACCOUNT</p>

          <div className="support-profile-card">
            <div className="dashboard-avatar">{initial}</div>
            <div>
              <strong>{displayName}</strong>
              <span>Support Staff</span>
            </div>
          </div>
        </nav>

        <div className="sidebar-help-card">
          <ShieldCheck size={22} />
          <strong>Support Workspace</strong>
          <p>
            Manage assigned requests and help employees resolve
            technical issues.
          </p>
        </div>

        <button className="sidebar-logout" onClick={logout}>
          <LogOut size={18} />
          Sign Out
        </button>
      </aside>

      {/* Main */}
      <main className="dashboard-main support-dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="dashboard-breadcrumb">
              Support Portal / Dashboard
            </p>

            <h1>Hello, {firstName} 👋</h1>

            <p>
              Manage your assigned tickets and employee support requests.
            </p>
          </div>

          <div className="dashboard-header-actions">
            <button
              className="icon-button"
              title="Refresh tickets"
              onClick={loadTickets}
              disabled={loading}
            >
              <RefreshCw size={19} />
            </button>

            <div className="dashboard-avatar">{initial}</div>
          </div>
        </header>

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
                  <strong>{loading ? "..." : stat.value}</strong>
                </div>
              </motion.div>
            );
          })}
        </section>

        {/* Alerts */}
        {error && (
          <div className="support-alert support-alert-error">
            <AlertCircle size={17} />
            {error}
            <button onClick={() => setError("")}>
              <X size={16} />
            </button>
          </div>
        )}

        {success && (
          <div className="support-alert support-alert-success">
            <CheckCircle2 size={17} />
            {success}
            <button onClick={() => setSuccess("")}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* Ticket workspace */}
        <section className="support-workspace">
          <div className="support-ticket-panel">
            <div className="support-panel-heading">
              <div>
                <h2>Assigned Tickets</h2>
                <p>Requests assigned to your account</p>
              </div>

              <span className="support-ticket-count">
                {tickets.length} total
              </span>
            </div>

            <div className="support-search">
              <Search size={17} />
              <input
                type="text"
                placeholder="Search tickets..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <div className="support-ticket-list">
              {loading ? (
                <div className="support-empty">
                  <RefreshCw size={25} />
                  <p>Loading assigned tickets...</p>
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="support-empty">
                  <ClipboardList size={30} />
                  <strong>No assigned tickets</strong>
                  <p>
                    Tickets assigned to you by the administrator
                    will appear here.
                  </p>
                </div>
              ) : (
                filteredTickets.map((ticket) => (
                  <button
                    className={`support-ticket-item ${
                      selectedTicket?.id === ticket.id ? "selected" : ""
                    }`}
                    key={ticket.id}
                    onClick={() => openTicket(ticket.id)}
                  >
                    <div className="support-ticket-item-top">
                      <span>
                        #HD-{String(ticket.id).padStart(4, "0")}
                      </span>

                      <span
                        className={`support-status status-${(
                          ticket.status || "OPEN"
                        ).toLowerCase()}`}
                      >
                        {statusLabel(ticket.status)}
                      </span>
                    </div>

                    <strong>{ticket.title}</strong>

                    <p>{ticket.description || "No description provided."}</p>

                    <div className="support-ticket-meta">
                      <span>{ticket.category || "General"}</span>
                      <span>
                        {ticket.priority || "MEDIUM"} priority
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Ticket details */}
          <div className="support-details-panel">
            {!selectedTicket ? (
              <div className="support-empty support-detail-empty">
                <MessageCircle size={38} />
                <h2>Select a ticket</h2>
                <p>
                  Choose an assigned ticket to view its details,
                  update its status and communicate with the employee.
                </p>
              </div>
            ) : detailLoading ? (
              <div className="support-empty">
                <RefreshCw size={25} />
                <p>Loading ticket details...</p>
              </div>
            ) : (
              <>
                <div className="support-detail-heading">
                  <div>
                    <span>
                      TICKET #HD-
                      {String(selectedTicket.id).padStart(4, "0")}
                    </span>
                    <h2>{selectedTicket.title}</h2>
                    <p>
                      Created {formatDate(selectedTicket.created_at)}
                    </p>
                  </div>

                  <button
                    className="support-close-detail"
                    onClick={() => setSelectedTicket(null)}
                    title="Close details"
                  >
                    <X size={19} />
                  </button>
                </div>

                <div className="support-employee-info">
                  <div className="support-employee-avatar">
                    <User size={20} />
                  </div>

                  <div>
                    <strong>
                      {selectedTicket.employee?.username || "Employee"}
                    </strong>
                    <span>
                      {selectedTicket.employee?.email || "Employee account"}
                    </span>
                  </div>

                  <UserCheck size={19} />
                </div>

                <div className="support-description">
                  <h3>Issue Description</h3>
                  <p>
                    {selectedTicket.description || "No description provided."}
                  </p>
                </div>

                <div className="support-edit-fields">
                  <label>
                    Ticket Status
                    <select
                      value={selectedTicket.status || "OPEN"}
                      disabled={saving}
                      onChange={(event) =>
                        updateTicket("status", event.target.value)
                      }
                    >
                      <option value="OPEN">Open</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </label>

                  <label>
                    Priority
                    <select
                      value={selectedTicket.priority || "MEDIUM"}
                      disabled={saving}
                      onChange={(event) =>
                        updateTicket("priority", event.target.value)
                      }
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                  </label>
                </div>

                <div className="support-conversation">
                  <div className="support-conversation-heading">
                    <div>
                      <h3>Conversation History</h3>
                      <p>{messages.length} messages</p>
                    </div>

                    <button
                      className="support-refresh-button"
                      onClick={refreshSelectedTicket}
                      title="Refresh conversation"
                    >
                      <RefreshCw size={16} />
                    </button>
                  </div>

                  <div className="support-message-list">
                    {messages.length === 0 ? (
                      <div className="support-no-messages">
                        No messages yet. Start the conversation below.
                      </div>
                    ) : (
                      messages.map((item) => (
                        <div
                          className={`support-message ${
                            item.sender?.id === storedUser.id
                              ? "own-message"
                              : ""
                          } ${
                            item.is_internal ? "internal-message" : ""
                          }`}
                          key={item.id}
                        >
                          <div className="support-message-top">
                            <strong>
                              {item.sender?.username || "User"}
                            </strong>

                            <span>{formatDate(item.created_at)}</span>
                          </div>

                          {item.is_internal && (
                            <span className="internal-label">
                              <ShieldCheck size={12} />
                              Internal note
                            </span>
                          )}

                          <p>{item.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {selectedTicket.status !== "CLOSED" && (
                  <form
                    className="support-reply-form"
                    onSubmit={sendMessage}
                  >
                    <h3>Send a Reply</h3>

                    <textarea
                      rows="3"
                      placeholder="Write your reply or internal note..."
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      required
                    />

                    <div className="support-reply-actions">
                      <label className="internal-checkbox">
                        <input
                          type="checkbox"
                          checked={isInternal}
                          onChange={(event) =>
                            setIsInternal(event.target.checked)
                          }
                        />
                        Private internal note
                      </label>

                      <button
                        type="submit"
                        disabled={sending || !message.trim()}
                      >
                        <Send size={15} />
                        {sending ? "Sending..." : "Send Message"}
                      </button>
                    </div>
                  </form>
                )}

                {selectedTicket.status === "CLOSED" && (
                  <div className="support-closed-notice">
                    This ticket is closed. Replies are disabled.
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        <div className="support-security-notice">
          <ShieldCheck size={19} />
          <span>
            Employee conversations and private internal notes are
            protected by role-based access.
          </span>
        </div>
      </main>
    </div>
  );
}

export default SupportDashboard;
