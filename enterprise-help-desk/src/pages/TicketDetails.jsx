import { useEffect, useState } from "react";
import axios from "axios";
import {
  Ticket,
  ArrowLeft,
  Clock3,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

function TicketDetails() {
  const { id } = useParams();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const token =
          localStorage.getItem("access_token") ||
          localStorage.getItem("access") ||
          localStorage.getItem("accessToken") ||
          localStorage.getItem("token");

        if (!token) {
          setError("Please login again.");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `http://127.0.0.1:8000/api/tickets/${id}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        setTicket(response.data);
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

    fetchTicket();
  }, [id]);

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

  if (loading) {
    return (
      <div className="dashboard-page">
        <main className="dashboard-main">
          <section className="dashboard-panel">
            <div className="dashboard-ticket">
              <div className="ticket-info">
                <strong>Loading ticket...</strong>
                <span>Please wait.</span>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (error) {
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

        </section>
      </main>
    </div>
  );
}

export default TicketDetails;