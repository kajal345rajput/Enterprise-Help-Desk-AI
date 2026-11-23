import { useEffect, useState } from "react";
import axios from "axios";
import {
  Ticket,
  Clock3,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";

function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

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
          setLoading(false);
          return;
        }

        const response = await axios.get(
          "http://127.0.0.1:8000/api/tickets/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

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

    fetchTickets();
  }, []);

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
    if (status === "IN_PROGRESS") {
      return "In Progress";
    }

    if (status === "RESOLVED") {
      return "Resolved";
    }

    if (status === "CLOSED") {
      return "Closed";
    }

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
                <Link
                  to={`/tickets/${ticket.id}`}
                  className="dashboard-ticket"
                  key={ticket.id}
                  style={{ textDecoration: "none", color: "inherit" }}
                >

                  <div className="ticket-icon">
                    {getStatusIcon(ticket.status)}
                  </div>

                  <div className="ticket-info">

                    <strong>
                      {ticket.title}
                    </strong>

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

              ))}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default MyTickets;