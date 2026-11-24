
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Ticket,
  Clock3,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";

function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingTicketId, setDeletingTicketId] = useState(null);

  const API = "http://127.0.0.1:8000/api";

  const getToken = () => {
    return (
      localStorage.getItem("access_token") ||
      localStorage.getItem("access") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token")
    );
  };

  // Fetch employee tickets
  const fetchTickets = async () => {
    try {
      const token = getToken();

      if (!token) {
        console.error("No access token found.");
        return;
      }

      const response = await axios.get(`${API}/tickets/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Tickets loaded:", response.data);
      setTickets(response.data);
    } catch (error) {
      console.error("Failed to load tickets:", error);

      if (error.response) {
        console.error(
          "Server response:",
          error.response.status,
          error.response.data
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Delete employee ticket
  const handleDeleteTicket = async (ticket) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ticket #HD-${String(
        ticket.id
      ).padStart(4, "0")}?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const token = getToken();

      if (!token) {
        alert("Please log in again.");
        return;
      }

      setDeletingTicketId(ticket.id);

      await axios.delete(`${API}/tickets/${ticket.id}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTickets((previousTickets) =>
        previousTickets.filter((item) => item.id !== ticket.id)
      );

      alert("Ticket deleted successfully!");
    } catch (error) {
      console.error("Failed to delete ticket:", error);

      alert(
        error.response?.data?.error ||
          error.response?.data?.detail ||
          "Unable to delete ticket. Please try again."
      );
    } finally {
      setDeletingTicketId(null);
    }
  };

  const getStatusIcon = (status) => {
    if (status === "RESOLVED" || status === "CLOSED") {
      return <CheckCircle2 size={18} />;
    }

    if (status === "IN_PROGRESS") {
      return <Clock3 size={18} />;
    }

    return <AlertCircle size={18} />;
  };

  const getStatusText = (status) => {
    if (status === "IN_PROGRESS") return "In Progress";
    if (status === "RESOLVED") return "Resolved";
    if (status === "CLOSED") return "Closed";

    return "Open";
  };

  return (
    <div className="dashboard-page">
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="dashboard-breadcrumb">
              Employee Portal / My Tickets
            </p>

            <h1>My Tickets</h1>

            <p>
              Track and manage your support requests.
            </p>
          </div>
        </header>

        <Link
          to="/dashboard"
          className="dashboard-nav-link"
          style={{
            display: "inline-flex",
            width: "fit-content",
            marginBottom: "25px",
          }}
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        <section className="dashboard-panel tickets-panel">
          <div className="panel-header">
            <div>
              <h2>All Support Tickets</h2>

              <p>
                {tickets.length} ticket
                {tickets.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="dashboard-ticket">
              <div className="ticket-info">
                <strong>Loading tickets...</strong>
                <span>Please wait.</span>
              </div>
            </div>
          ) : tickets.length === 0 ? (
            <div className="dashboard-ticket">
              <div className="ticket-icon">
                <Ticket size={19} />
              </div>

              <div className="ticket-info">
                <strong>No tickets yet</strong>

                <span>
                  You have not created any support tickets.
                </span>
              </div>
            </div>
          ) : (
            <div className="ticket-list">
              {tickets.map((ticket) => (
                <div
                  className="dashboard-ticket"
                  key={ticket.id}
                  style={{ gap: "12px" }}
                >
                  <Link
                    to={`/tickets/${ticket.id}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      flex: 1,
                      minWidth: 0,
                      textDecoration: "none",
                      color: "inherit",
                    }}
                  >
                    <div className="ticket-icon">
                      {getStatusIcon(ticket.status)}
                    </div>

                    <div className="ticket-info">
                      <strong>{ticket.title}</strong>

                      <span>
                        #HD-{String(ticket.id).padStart(4, "0")}
                        {" · "}
                        {ticket.category}
                        {" · "}
                        {new Date(
                          ticket.created_at
                        ).toLocaleString()}
                      </span>
                    </div>

                    <span
                      className={`ticket-status ${getStatusText(
                        ticket.status
                      )
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {getStatusText(ticket.status)}
                    </span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleDeleteTicket(ticket)}
                    disabled={deletingTicketId === ticket.id}
                    title="Delete ticket"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      padding: "9px 12px",
                      border: "1px solid rgba(239, 68, 68, 0.35)",
                      borderRadius: "8px",
                      background: "rgba(239, 68, 68, 0.10)",
                      color: "#f87171",
                      cursor:
                        deletingTicketId === ticket.id
                          ? "not-allowed"
                          : "pointer",
                      opacity:
                        deletingTicketId === ticket.id ? 0.6 : 1,
                      flexShrink: 0,
                    }}
                  >
                    <Trash2 size={16} />

                    {deletingTicketId === ticket.id
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default MyTickets;
