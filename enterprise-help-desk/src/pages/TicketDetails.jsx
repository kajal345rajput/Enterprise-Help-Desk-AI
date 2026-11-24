
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Ticket,
  ArrowLeft,
  Clock3,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  UserRound,
  Send,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

function TicketDetails() {
  const { id } = useParams();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState("");

  const getToken = () =>
    localStorage.getItem("access_token") ||
    localStorage.getItem("access") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token");

  // Fetch ticket details and conversation.
  const fetchTicket = async () => {
    try {
      const token = getToken();

      if (!token) {
        setError("Please login again.");
        return;
      }

      const response = await axios.get(
        `http://127.0.0.1:8000/api/tickets/${id}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTicket(response.data);
      setError("");
    } catch (err) {
      console.error("Failed to load ticket:", err);
      setError(
        err.response?.data?.error ||
          "Unable to load ticket details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  // Send employee's public reply.
  const handleReply = async (e) => {
    e.preventDefault();

    if (!reply.trim() || sending) return;

    const token = getToken();

    if (!token) {
      setError("Please login again.");
      return;
    }

    try {
      setSending(true);
      setError("");
      setSuccess("");

      await axios.post(
        `http://127.0.0.1:8000/api/tickets/${id}/messages/`,
        {
          message: reply.trim(),
          is_internal: false,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setReply("");
      setSuccess("Your reply was sent successfully.");

      await fetchTicket();
    } catch (err) {
      console.error("Reply failed:", err);

      setError(
        err.response?.data?.error ||
          "Unable to send reply. Please try again."
      );
    } finally {
      setSending(false);
    }
  };

  const getStatusIcon = (status) => {
    if (status === "RESOLVED" || status === "CLOSED") {
      return <CheckCircle2 size={20} />;
    }

    if (status === "IN_PROGRESS") {
      return <Clock3 size={20} />;
    }

    return <AlertCircle size={20} />;
  };

  const getStatusText = (status) => {
    if (status === "IN_PROGRESS") return "In Progress";
    if (status === "RESOLVED") return "Resolved";
    if (status === "CLOSED") return "Closed";
    return "Open";
  };

  // Never display internal notes to employees.
  const publicMessages = Array.isArray(ticket?.messages)
    ? ticket.messages.filter(
        (message) => message.is_internal !== true
      )
    : [];

  if (loading) {
    return (
      <div className="dashboard-page">
        <main className="dashboard-main">
          <section className="dashboard-panel">
            <div className="ticket-info">
              <strong>Loading ticket...</strong>
              <span>Please wait.</span>
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (error && !ticket) {
    return (
      <div className="dashboard-page">
        <main className="dashboard-main">
          <section className="dashboard-panel">
            <div className="ticket-info">
              <strong>Unable to load ticket</strong>
              <span>{error}</span>
            </div>

            <Link
              to="/tickets"
              className="dashboard-nav-link"
              style={{
                display: "inline-flex",
                marginTop: "20px",
              }}
            >
              <ArrowLeft size={18} />
              Back to My Tickets
            </Link>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <main className="dashboard-main">

        {/* Page Header */}
        <header className="dashboard-header">
          <div>
            <p className="dashboard-breadcrumb">
              Employee Portal / Ticket Details
            </p>

            <h1>Ticket Details</h1>

            <p>
              View information about your support request.
            </p>
          </div>
        </header>

        <Link
          to="/tickets"
          className="dashboard-nav-link"
          style={{
            display: "inline-flex",
            width: "fit-content",
            marginBottom: "25px",
          }}
        >
          <ArrowLeft size={18} />
          Back to My Tickets
        </Link>

        <section className="dashboard-panel">

          {/* Ticket Header */}
          <div className="panel-header">
            <div>
              <h2>
                <Ticket size={20} />
                #{String(ticket.id).padStart(4, "0")} —{" "}
                {ticket.title}
              </h2>

              <p>
                Created on{" "}
                {new Date(ticket.created_at).toLocaleString()}
              </p>
            </div>

            <span
              className={`ticket-status ${getStatusText(
                ticket.status
              )
                .toLowerCase()
                .replace(" ", "-")}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {getStatusIcon(ticket.status)}
              {getStatusText(ticket.status)}
            </span>
          </div>

          {/* Ticket Information */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "15px",
              marginTop: "25px",
            }}
          >
            <div className="dashboard-stat-card">
              <div>
                <span>Category</span>
                <strong>{ticket.category}</strong>
              </div>
            </div>

            <div className="dashboard-stat-card">
              <div>
                <span>Priority</span>
                <strong>{ticket.priority}</strong>
              </div>
            </div>

            <div className="dashboard-stat-card">
              <div>
                <span>Status</span>
                <strong>{getStatusText(ticket.status)}</strong>
              </div>
            </div>
          </div>

          {/* Issue Description */}
          <div style={{ marginTop: "30px" }}>
            <h3>Issue Description</h3>

            <div
              style={{
                marginTop: "12px",
                padding: "18px",
                borderRadius: "12px",
              }}
            >
              {ticket.description}
            </div>
          </div>

          {/* Support Information */}
          <div style={{ marginTop: "30px" }}>
            <h3>Support Information</h3>

            <div
              style={{
                marginTop: "12px",
                padding: "18px",
                borderRadius: "12px",
              }}
            >
              {ticket.assigned_to ? (
                <p>
                  Assigned to:{" "}
                  <strong>
                    {ticket.assigned_to.username}
                  </strong>
                </p>
              ) : (
                <p>
                  This ticket has not been assigned to a support
                  staff member yet.
                </p>
              )}
            </div>
          </div>

          {/* Conversation History */}
          <div style={{ marginTop: "35px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <h3
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <MessageCircle size={21} />
                Conversation History
              </h3>

              <span
                style={{
                  color: "#94a3b8",
                  fontSize: "13px",
                }}
              >
                {publicMessages.length} messages
              </span>
            </div>

            {publicMessages.length === 0 ? (
              <div
                style={{
                  marginTop: "15px",
                  padding: "22px",
                  borderRadius: "12px",
                  background: "rgba(148, 163, 184, 0.06)",
                  color: "#94a3b8",
                  textAlign: "center",
                }}
              >
                No messages yet. Your support conversation
                will appear here.
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "15px",
                  marginTop: "18px",
                }}
              >
                {publicMessages.map((message) => (
                  <div
                    key={message.id}
                    style={{
                      padding: "18px",
                      borderRadius: "12px",
                      background: "rgba(99, 102, 241, 0.07)",
                      border: "1px solid rgba(129, 140, 248, 0.15)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "12px",
                        flexWrap: "wrap",
                      }}
                    >
                      <UserRound
                        size={17}
                        color="#818cf8"
                      />

                      <strong>
                        {message.sender?.first_name ||
                          message.sender?.username ||
                          "User"}
                      </strong>

                      <span
                        style={{
                          color: "#94a3b8",
                          fontSize: "12px",
                          marginLeft: "auto",
                        }}
                      >
                        {message.created_at
                          ? new Date(
                              message.created_at
                            ).toLocaleString()
                          : ""}
                      </span>
                    </div>

                    <p
                      style={{
                        color: "#e2e8f0",
                        lineHeight: "1.7",
                        whiteSpace: "pre-wrap",
                        overflowWrap: "anywhere",
                        margin: 0,
                      }}
                    >
                      {message.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Employee Reply */}
          <div style={{ marginTop: "35px" }}>
            <h3
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <Send size={19} />
              Send a Reply
            </h3>

            {error && (
              <p
                style={{
                  color: "#f87171",
                  marginTop: "12px",
                }}
              >
                {error}
              </p>
            )}

            {success && (
              <p
                style={{
                  color: "#4ade80",
                  marginTop: "12px",
                }}
              >
                {success}
              </p>
            )}

            <form onSubmit={handleReply}>
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Write your message to the support team..."
                rows={4}
                required
                maxLength={2000}
                style={{
                  width: "100%",
                  marginTop: "15px",
                  padding: "15px",
                  borderRadius: "12px",
                  background: "rgba(15, 23, 42, 0.7)",
                  border: "1px solid rgba(129, 140, 248, 0.3)",
                  color: "#ffffff",
                  resize: "vertical",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
              />

              <button
                type="submit"
                disabled={sending || !reply.trim()}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "9px",
                  marginTop: "12px",
                  padding: "12px 22px",
                  border: "none",
                  borderRadius: "10px",
                  background: "#6366f1",
                  color: "#ffffff",
                  cursor: sending ? "not-allowed" : "pointer",
                  opacity:
                    sending || !reply.trim() ? 0.6 : 1,
                }}
              >
                <Send size={16} />
                {sending ? "Sending..." : "Send Reply"}
              </button>
            </form>
          </div>

        </section>
      </main>
    </div>
  );
}

export default TicketDetails;
