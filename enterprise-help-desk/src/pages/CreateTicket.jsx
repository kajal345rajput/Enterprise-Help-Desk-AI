import { useState } from "react";
import axios from "axios";
import {
  Ticket,
  ArrowLeft,
  Send,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

function CreateTicket() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "OTHER",
    priority: "MEDIUM",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("You are not logged in. Please login again.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/tickets/",
        form,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Ticket created:", response.data);

      navigate("/tickets");
    } catch (err) {
      console.error("Ticket creation error:", err);

      if (err.response?.status === 401) {
        setError("Your login session has expired. Please login again.");
      } else if (err.response?.status === 403) {
        setError(
          "Access denied. Please logout and login again."
        );
      } else {
        setError(
          err.response?.data
            ? JSON.stringify(err.response.data)
            : "Failed to create ticket."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page">
      <main className="dashboard-main">

        <header className="dashboard-header">
          <div>
            <p className="dashboard-breadcrumb">
              Employee Portal / Create Ticket
            </p>

            <h1>Create Support Ticket</h1>

            <p>
              Tell our support team what you need help with.
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

        <section className="dashboard-panel">

          <div className="panel-header">
            <div>
              <h2>
                <Ticket size={20} />
                Ticket Details
              </h2>

              <p>
                Provide enough information so our support staff
                can help you quickly.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              marginTop: "25px",
            }}
          >

            <div>
              <label>Issue Title</label>

              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Example: Unable to connect to office Wi-Fi"
                required
                style={{
                  width: "100%",
                  marginTop: "8px",
                  padding: "13px",
                  borderRadius: "10px",
                }}
              />
            </div>

            <div>
              <label>Describe the Issue</label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe your technical problem..."
                rows="6"
                required
                style={{
                  width: "100%",
                  marginTop: "8px",
                  padding: "13px",
                  borderRadius: "10px",
                  resize: "vertical",
                }}
              />
            </div>

            <div>
              <label>Category</label>

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                style={{
                  width: "100%",
                  marginTop: "8px",
                  padding: "13px",
                  borderRadius: "10px",
                }}
              >
                <option value="HARDWARE">Hardware</option>
                <option value="SOFTWARE">Software</option>
                <option value="NETWORK">Network</option>
                <option value="ACCOUNT">Account</option>
                <option value="EMAIL">Email</option>
                <option value="SECURITY">Security</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label>Priority</label>

              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                style={{
                  width: "100%",
                  marginTop: "8px",
                  padding: "13px",
                  borderRadius: "10px",
                }}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            {error && (
              <div
                style={{
                  padding: "12px",
                  borderRadius: "10px",
                  color: "#ff6b6b",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="ai-chat-button"
              style={{
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                width: "fit-content",
              }}
            >
              <Send size={18} />

              {loading
                ? "Creating Ticket..."
                : "Submit Ticket"}
            </button>

          </form>

        </section>
      </main>
    </div>
  );
}

export default CreateTicket;