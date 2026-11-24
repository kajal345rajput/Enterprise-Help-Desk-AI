
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Users,
  UserPlus,
  Headset,
  LogOut,
  User,
  LayoutDashboard,
  Search,
  RefreshCw,
  Mail,
  Building2,
  Phone,
  CheckCircle,
  XCircle,
  Power,
  ClipboardList,
  Eye,
  X,
  Clock,
  AlertCircle,
  Save,
  Ticket,
  Trash2,
} from "lucide-react";
import axios from "axios";
import "./AdminDashboard.css";

const API = "http://127.0.0.1:8000/api";

const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleString();
};

const displayLabel = (value) => {
  if (!value) return "—";

  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

function AdminDashboard() {
  const navigate = useNavigate();

  const [admin, setAdmin] = useState({});
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [accountMessage, setAccountMessage] = useState("");
  const [accountMessageType, setAccountMessageType] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [deletingUserId, setDeletingUserId] = useState(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [users, setUsers] = useState([]);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "EMPLOYEE",
    department: "",
    phone: "",
  });

  const [stats, setStats] = useState({
    total_users: 0,
    employees: 0,
    support_staff: 0,
  });

  // Ticket management state
  const [tickets, setTickets] = useState([]);
  const [ticketLoading, setTicketLoading] = useState(true);
  const [ticketError, setTicketError] = useState("");

  const [ticketSearch, setTicketSearch] = useState("");
  const [ticketStatusFilter, setTicketStatusFilter] = useState("ALL");
  const [ticketPriorityFilter, setTicketPriorityFilter] = useState("ALL");
  const [ticketCategoryFilter, setTicketCategoryFilter] = useState("ALL");

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [updatingTicket, setUpdatingTicket] = useState(false);

  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketMessageType, setTicketMessageType] = useState("");

  const [ticketEdit, setTicketEdit] = useState({
    status: "OPEN",
    priority: "MEDIUM",
  });

  // Selected Support Staff ID
  const [assignedStaffId, setAssignedStaffId] = useState("");

  // Verify admin login
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("access_token");

    if (!savedUser || !token) {
      navigate("/login");
      return;
    }

    try {
      const user = JSON.parse(savedUser);

      if (user.role !== "ADMIN") {
        navigate("/login");
        return;
      }

      setAdmin(user);
    } catch {
      navigate("/login");
    }
  }, [navigate]);

  // Fetch statistics and all users
  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem("access_token");

      const response = await axios.get(`${API}/admin/users/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setStats({
        total_users: response.data.total_users ?? 0,
        employees: response.data.employees ?? 0,
        support_staff: response.data.support_staff ?? 0,
      });

      setUsers(response.data.users ?? []);

    } catch (error) {
      console.error(
        "Unable to load admin data:",
        error.response?.data || error.message
      );
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Fetch all tickets
  const fetchTickets = useCallback(async () => {
    setTicketLoading(true);
    setTicketError("");

    try {
      const token = localStorage.getItem("access_token");

      const response = await axios.get(`${API}/tickets/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTickets(
        Array.isArray(response.data) ? response.data : []
      );

    } catch (error) {
      console.error(
        "Unable to load tickets:",
        error.response?.data || error.message
      );

      setTicketError(
        error.response?.data?.detail ||
        error.response?.data?.error ||
        "Unable to load tickets. Please refresh."
      );

    } finally {
      setTicketLoading(false);
    }
  }, []);

  useEffect(() => {
    if (admin.role === "ADMIN") {
      fetchStats();
      fetchTickets();
    }
  }, [admin, fetchStats, fetchTickets]);

  // Handle form input
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Create user
  const handleCreateUser = async (e) => {
    e.preventDefault();

    setMessage("");
    setMessageType("");

    if (
      !form.username.trim() ||
      !form.email.trim() ||
      !form.password ||
      !form.department.trim()
    ) {
      setMessage("Please fill in all required fields.");
      setMessageType("error");
      return;
    }

    if (form.password.length < 8) {
      setMessage("Password must contain at least 8 characters.");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("access_token");

      const response = await axios.post(
        `${API}/admin/users/`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(
        response.data.message || "User created successfully!"
      );

      setMessageType("success");

      setForm({
        username: "",
        email: "",
        password: "",
        role: "EMPLOYEE",
        department: "",
        phone: "",
      });

      await fetchStats();

    } catch (error) {
      const data = error.response?.data;

      const errorMessage =
        typeof data?.error === "string"
          ? data.error
          : Array.isArray(data?.error)
            ? data.error.join(" ")
            : data?.detail ||
              data?.username?.[0] ||
              data?.email?.[0] ||
              "Unable to create user. Please try again.";

      setMessage(errorMessage);
      setMessageType("error");

    } finally {
      setLoading(false);
    }
  };

  // Activate or deactivate an account
  const handleAccountStatus = async (user) => {
    if (user.role === "ADMIN") return;

    const newStatus = !user.is_active;
    const action = newStatus ? "activate" : "deactivate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} the account "${user.username}"?`
    );

    if (!confirmed) return;

    try {
      setUpdatingUserId(user.id);
      setAccountMessage("");
      setAccountMessageType("");

      const token = localStorage.getItem("access_token");

      const response = await axios.patch(
        `${API}/admin/users/`,
        {
          user_id: user.id,
          is_active: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAccountMessage(
        response.data.message ||
        "Account status updated successfully."
      );

      setAccountMessageType("success");

      await fetchStats();

    } catch (error) {
      const errorData = error.response?.data;

      setAccountMessage(
        errorData?.error ||
        errorData?.detail ||
        "Unable to update account status. Please try again."
      );

      setAccountMessageType("error");

    } finally {
      setUpdatingUserId(null);
    }
  };

  // Delete employee or support staff account
  const handleDeleteUser = async (user) => {
    if (user.role === "ADMIN") return;

    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${user.username}"?\n\n` +
      "This will also delete their tickets and conversation history. This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      setDeletingUserId(user.id);
      setAccountMessage("");
      setAccountMessageType("");

      const token = localStorage.getItem("access_token");

      const response = await axios.delete(`${API}/admin/users/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          user_id: user.id,
        },
      });

      // Close ticket details if the deleted employee owned that ticket
      if (
        selectedTicket &&
        selectedTicket.employee?.id === user.id
      ) {
        setSelectedTicket(null);
      }

      setAccountMessage(
        response.data.message || "User deleted successfully."
      );

      setAccountMessageType("success");

      // Refresh users, statistics and tickets
      await Promise.all([
        fetchStats(),
        fetchTickets(),
      ]);

    } catch (error) {
      const errorData = error.response?.data;

      setAccountMessage(
        errorData?.error ||
        errorData?.detail ||
        "Unable to delete user. Please try again."
      );

      setAccountMessageType("error");

    } finally {
      setDeletingUserId(null);
    }
  };

  // Search and filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase());

    const matchesRole =
      roleFilter === "ALL" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Open ticket details
  const openTicketDetails = async (ticketId) => {
    setSelectedTicket(null);
    setDetailsLoading(true);
    setTicketMessage("");
    setTicketMessageType("");
    setAssignedStaffId("");

    try {
      const token = localStorage.getItem("access_token");

      const response = await axios.get(
        `${API}/tickets/${ticketId}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSelectedTicket(response.data);

      setTicketEdit({
        status: response.data.status || "OPEN",
        priority: response.data.priority || "MEDIUM",
      });

      setAssignedStaffId(
        response.data.assigned_to?.id
          ? String(response.data.assigned_to.id)
          : ""
      );

    } catch (error) {
      setTicketMessage(
        error.response?.data?.error ||
        error.response?.data?.detail ||
        "Unable to load ticket details."
      );

      setTicketMessageType("error");

    } finally {
      setDetailsLoading(false);
    }
  };

  // Update status, priority and support staff assignment
  const handleTicketUpdate = async (e) => {
    e.preventDefault();

    if (!selectedTicket) return;

    try {
      setUpdatingTicket(true);
      setTicketMessage("");
      setTicketMessageType("");

      const token = localStorage.getItem("access_token");

      const updateData = {
        ...ticketEdit,
        assigned_to_id: assignedStaffId || null,
      };

      const response = await axios.patch(
        `${API}/tickets/${selectedTicket.id}/`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSelectedTicket((previous) => ({
        ...previous,
        ...response.data,
      }));

      setAssignedStaffId(
        response.data.assigned_to?.id
          ? String(response.data.assigned_to.id)
          : ""
      );

      setTicketMessage("Ticket updated successfully!");
      setTicketMessageType("success");

      await fetchTickets();

    } catch (error) {
      const data = error.response?.data;

      setTicketMessage(
        data?.error ||
        data?.detail ||
        data?.status?.[0] ||
        data?.priority?.[0] ||
        "Unable to update ticket."
      );

      setTicketMessageType("error");

    } finally {
      setUpdatingTicket(false);
    }
  };

  // Filter tickets
  const filteredTickets = tickets.filter((ticket) => {
    const employeeName = ticket.employee?.username || "";

    const matchesSearch =
      String(ticket.id).includes(ticketSearch.trim()) ||
      ticket.title?.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      employeeName.toLowerCase().includes(ticketSearch.toLowerCase());

    const matchesStatus =
      ticketStatusFilter === "ALL" ||
      ticket.status === ticketStatusFilter;

    const matchesPriority =
      ticketPriorityFilter === "ALL" ||
      ticket.priority === ticketPriorityFilter;

    const matchesCategory =
      ticketCategoryFilter === "ALL" ||
      ticket.category === ticketCategoryFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPriority &&
      matchesCategory
    );
  });

  // Ticket statistics
  const ticketCounts = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "OPEN").length,
    progress: tickets.filter((t) => t.status === "IN_PROGRESS").length,
    resolved: tickets.filter((t) => t.status === "RESOLVED").length,
    critical: tickets.filter((t) => t.priority === "CRITICAL").length,
  };

  // Active support staff for assignment
  const activeSupportStaff = users.filter(
    (user) => user.role === "SUPPORT" && user.is_active
  );

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <div className="admin-page">

      {/* NAVBAR */}
      <nav className="admin-navbar">
        <div className="admin-brand">
          <div className="admin-brand-icon">
            <ShieldCheck size={22} />
          </div>
          <div>Enterprise Help Desk</div>
        </div>

        <button
          className="admin-logout"
          onClick={handleLogout}
        >
          <LogOut size={14} /> Logout
        </button>
      </nav>

      <main className="admin-container">

        {/* HEADING */}
        <section className="admin-heading">
          <h1>
            Admin <span>Dashboard</span>
          </h1>

          <p>
            Welcome back, {admin.username || "Administrator"}.
            Manage your enterprise help desk from one place.
          </p>
        </section>

        {/* USER STATISTICS */}
        <section className="admin-stats">

          <div className="admin-stat-card">
            <div className="admin-stat-top">
              Total Users
              <div className="admin-stat-icon">
                <Users size={19} />
              </div>
            </div>
            <h2>{statsLoading ? "..." : stats.total_users}</h2>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-top">
              Employees
              <div className="admin-stat-icon">
                <User size={19} />
              </div>
            </div>
            <h2>{statsLoading ? "..." : stats.employees}</h2>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-top">
              Support Staff
              <div className="admin-stat-icon">
                <Headset size={19} />
              </div>
            </div>
            <h2>{statsLoading ? "..." : stats.support_staff}</h2>
          </div>

        </section>

        {/* CREATE USER AND SYSTEM OVERVIEW */}
        <section className="admin-content-grid">

          {/* CREATE USER */}
          <div className="admin-panel">

            <div className="admin-panel-header">
              <h2>
                <UserPlus size={18} /> Create New User
              </h2>
              <p>Create Employee or Support Staff accounts.</p>
            </div>

            <form
              className="admin-form"
              onSubmit={handleCreateUser}
            >

              <div className="admin-form-group">
                <label>Username *</label>
                <input
                  type="text"
                  name="username"
                  placeholder="Enter username"
                  value={form.username}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter email address"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>Password *</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Create password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>User Role *</label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                >
                  <option value="EMPLOYEE">Employee</option>
                  <option value="SUPPORT">Support Staff</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label>Department *</label>
                <input
                  type="text"
                  name="department"
                  placeholder="e.g. IT, HR, Finance"
                  value={form.department}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter phone number"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>

              {message && (
                <div className={`admin-message ${messageType}`}>
                  {message}
                </div>
              )}

              <button
                type="submit"
                className="admin-create-btn"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create User"}
              </button>

            </form>
          </div>

          {/* SYSTEM OVERVIEW */}
          <div className="admin-panel">

            <div className="admin-panel-header">
              <h2>
                <LayoutDashboard size={18} /> System Overview
              </h2>
              <p>Manage your help desk user roles.</p>
            </div>

            <div className="admin-role-list">

              <div className="admin-role-item">
                <div className="admin-role-icon">
                  <User size={19} />
                </div>
                <div>
                  <strong>Employee</strong>
                  <span>Submit tickets and get AI assistance.</span>
                </div>
              </div>

              <div className="admin-role-item">
                <div className="admin-role-icon">
                  <Headset size={19} />
                </div>
                <div>
                  <strong>Support Staff</strong>
                  <span>Manage tickets and resolve employee issues.</span>
                </div>
              </div>

              <div className="admin-role-item">
                <div className="admin-role-icon">
                  <ShieldCheck size={19} />
                </div>
                <div>
                  <strong>Administrator</strong>
                  <span>Manage users and oversee the system.</span>
                </div>
              </div>

            </div>
          </div>

        </section>

        {/* MANAGE USERS */}
        <section className="admin-panel admin-users-panel">

          <div className="admin-panel-header">
            <div className="admin-users-heading">

              <div>
                <h2>
                  <Users size={19} /> Manage Users
                </h2>
                <p>Search, filter and manage registered accounts.</p>
              </div>

              <button
                type="button"
                className="admin-refresh-btn"
                onClick={fetchStats}
                title="Refresh users"
              >
                <RefreshCw size={16} /> Refresh
              </button>

            </div>
          </div>

          <div className="admin-user-controls">

            <div className="admin-search">
              <Search size={17} />
              <input
                type="text"
                placeholder="Search username or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className="admin-role-filter"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="ALL">All Roles</option>
              <option value="EMPLOYEE">Employees</option>
              <option value="SUPPORT">Support Staff</option>
              <option value="ADMIN">Administrators</option>
            </select>

          </div>

          {accountMessage && (
            <div className={`admin-message ${accountMessageType}`}>
              {accountMessage}
            </div>
          )}

          <div className="admin-users-table-wrap">

            <table className="admin-users-table">

              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {statsLoading ? (
                  <tr>
                    <td colSpan="7">Loading users...</td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7">No users found.</td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id}>

                      <td>
                        <div className="admin-table-user">
                          <div className="admin-table-avatar">
                            <User size={16} />
                          </div>
                          <strong>{user.username}</strong>
                        </div>
                      </td>

                      <td>
                        <Mail size={14} /> {user.email || "—"}
                      </td>

                      <td>
                        <span className={`admin-user-role ${user.role?.toLowerCase()}`}>
                          {user.role}
                        </span>
                      </td>

                      <td>
                        <Building2 size={14} /> {user.department || "—"}
                      </td>

                      <td>
                        <Phone size={14} /> {user.phone || "—"}
                      </td>

                      <td>
                        <span className={`admin-account-status ${user.is_active ? "active" : "inactive"}`}>
                          {user.is_active
                            ? <CheckCircle size={14} />
                            : <XCircle size={14} />}
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td>
                        {user.role === "ADMIN" ? (
                          <span className="admin-protected-label">
                            <ShieldCheck size={14} /> Protected
                          </span>
                        ) : (
                          <div className="admin-user-actions">

                            <button
                              type="button"
                              className={`admin-account-btn ${user.is_active ? "deactivate" : "activate"}`}
                              onClick={() => handleAccountStatus(user)}
                              disabled={
                                updatingUserId === user.id ||
                                deletingUserId === user.id
                              }
                            >
                              <Power size={14} />
                              {updatingUserId === user.id
                                ? "Updating..."
                                : user.is_active
                                  ? "Deactivate"
                                  : "Activate"}
                            </button>

                            <button
                              type="button"
                              className="admin-delete-user-btn"
                              onClick={() => handleDeleteUser(user)}
                              disabled={
                                deletingUserId === user.id ||
                                updatingUserId === user.id
                              }
                            >
                              <Trash2 size={14} />
                              {deletingUserId === user.id
                                ? "Deleting..."
                                : "Delete"}
                            </button>

                          </div>
                        )}
                      </td>

                    </tr>
                  ))
                )}

              </tbody>
            </table>

          </div>

          <p className="admin-users-count">
            Showing {filteredUsers.length} of {users.length} users
          </p>

        </section>

        {/* ADMIN TICKET MANAGEMENT */}
        <section className="admin-panel admin-tickets-panel">

          <div className="admin-panel-header">

            <div className="admin-users-heading">

              <div>
                <h2>
                  <ClipboardList size={19} /> Ticket Management
                </h2>
                <p>Monitor employee issues and manage ticket progress.</p>
              </div>

              <button
                type="button"
                className="admin-refresh-btn"
                onClick={fetchTickets}
                disabled={ticketLoading}
              >
                <RefreshCw size={16} />
                {ticketLoading ? "Loading..." : "Refresh"}
              </button>

            </div>
          </div>

          {/* TICKET STATISTICS */}
          <div className="admin-ticket-stats">
            <div>
              <span>Total Tickets</span>
              <strong>{ticketCounts.total}</strong>
            </div>

            <div>
              <span>Open</span>
              <strong>{ticketCounts.open}</strong>
            </div>

            <div>
              <span>In Progress</span>
              <strong>{ticketCounts.progress}</strong>
            </div>

            <div>
              <span>Resolved</span>
              <strong>{ticketCounts.resolved}</strong>
            </div>

            <div>
              <span>Critical</span>
              <strong>{ticketCounts.critical}</strong>
            </div>
          </div>

          {/* TICKET FILTERS */}
          <div className="admin-ticket-controls">

            <div className="admin-search">
              <Search size={17} />
              <input
                type="text"
                placeholder="Search ticket ID, title or employee..."
                value={ticketSearch}
                onChange={(e) => setTicketSearch(e.target.value)}
              />
            </div>

            <select
              value={ticketStatusFilter}
              onChange={(e) => setTicketStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>

            <select
              value={ticketPriorityFilter}
              onChange={(e) => setTicketPriorityFilter(e.target.value)}
            >
              <option value="ALL">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>

            <select
              value={ticketCategoryFilter}
              onChange={(e) => setTicketCategoryFilter(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              <option value="HARDWARE">Hardware</option>
              <option value="SOFTWARE">Software</option>
              <option value="NETWORK">Network</option>
              <option value="ACCOUNT">Account</option>
              <option value="EMAIL">Email</option>
              <option value="SECURITY">Security</option>
              <option value="OTHER">Other</option>
            </select>

          </div>

          {ticketError && (
            <div className="admin-message error">
              {ticketError}
            </div>
          )}

          {/* TICKET TABLE */}
          <div className="admin-users-table-wrap">

            <table className="admin-users-table admin-tickets-table">

              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Employee</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th>Created</th>
                  <th>Details</th>
                </tr>
              </thead>

              <tbody>

                {ticketLoading ? (
                  <tr>
                    <td colSpan="8">Loading tickets...</td>
                  </tr>
                ) : filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan="8">No tickets found.</td>
                  </tr>
                ) : (
                  filteredTickets.map((ticket) => (
                    <tr key={ticket.id}>

                      <td>
                        <strong>#{ticket.id}</strong>
                        <div className="admin-ticket-title">
                          {ticket.title}
                        </div>
                      </td>

                      <td>
                        {ticket.employee?.username || "—"}
                      </td>

                      <td>
                        {displayLabel(ticket.category)}
                      </td>

                      <td>
                        <span className={`admin-ticket-badge priority-${ticket.priority?.toLowerCase()}`}>
                          {displayLabel(ticket.priority)}
                        </span>
                      </td>

                      <td>
                        <span className={`admin-ticket-badge status-${ticket.status?.toLowerCase()}`}>
                          {displayLabel(ticket.status)}
                        </span>
                      </td>

                      <td>
                        {ticket.assigned_to?.username || "Unassigned"}
                      </td>

                      <td>
                        {formatDate(ticket.created_at)}
                      </td>

                      <td>
                        <button
                          type="button"
                          className="admin-ticket-view-btn"
                          onClick={() => openTicketDetails(ticket.id)}
                        >
                          <Eye size={14} /> View
                        </button>
                      </td>

                    </tr>
                  ))
                )}

              </tbody>
            </table>

          </div>

          <p className="admin-users-count">
            Showing {filteredTickets.length} of {tickets.length} tickets
          </p>

        </section>

      </main>

      {/* TICKET DETAILS MODAL */}
      {(detailsLoading || selectedTicket) && (

        <div
          className="admin-modal-overlay"
          onClick={() => {
            if (!updatingTicket) {
              setSelectedTicket(null);
              setDetailsLoading(false);
            }
          }}
        >

          <div
            className="admin-ticket-modal"
            onClick={(e) => e.stopPropagation()}
          >

            {/* MODAL HEADER */}
            <div className="admin-ticket-modal-header">

              <div>
                <h2>
                  <Ticket size={20} /> Ticket Details
                </h2>

                {selectedTicket && (
                  <p>Ticket #{selectedTicket.id}</p>
                )}
              </div>

              <button
                type="button"
                className="admin-modal-close"
                onClick={() => {
                  setSelectedTicket(null);
                  setDetailsLoading(false);
                }}
                disabled={updatingTicket}
              >
                <X size={20} />
              </button>

            </div>

            {detailsLoading ? (
              <div className="admin-ticket-loading">
                Loading ticket details...
              </div>
            ) : selectedTicket && (

              <div className="admin-ticket-modal-body">

                {/* TICKET INFORMATION */}
                <div className="admin-ticket-detail-heading">
                  <h3>{selectedTicket.title}</h3>
                  <p>{selectedTicket.description}</p>
                </div>

                <div className="admin-ticket-detail-grid">

                  <div>
                    <span>Employee</span>
                    <strong>
                      {selectedTicket.employee?.username || "—"}
                    </strong>
                  </div>

                  <div>
                    <span>Email</span>
                    <strong>
                      {selectedTicket.employee?.email || "—"}
                    </strong>
                  </div>

                  <div>
                    <span>Category</span>
                    <strong>
                      {displayLabel(selectedTicket.category)}
                    </strong>
                  </div>

                  <div>
                    <span>Assigned Support</span>
                    <strong>
                      {selectedTicket.assigned_to?.username || "Unassigned"}
                    </strong>
                  </div>

                  <div>
                    <span>AI Generated</span>
                    <strong>
                      {selectedTicket.ai_generated ? "Yes" : "No"}
                    </strong>
                  </div>

                  <div>
                    <span>Created</span>
                    <strong>
                      {formatDate(selectedTicket.created_at)}
                    </strong>
                  </div>

                  <div>
                    <span>Last Updated</span>
                    <strong>
                      {formatDate(selectedTicket.updated_at)}
                    </strong>
                  </div>

                  <div>
                    <span>Resolved</span>
                    <strong>
                      {formatDate(selectedTicket.resolved_at)}
                    </strong>
                  </div>

                </div>

                {/* EDIT TICKET AND ASSIGN SUPPORT */}
                <form
                  className="admin-ticket-edit-form"
                  onSubmit={handleTicketUpdate}
                >

                  {/* SUPPORT STAFF ASSIGNMENT */}
                  <div className="admin-form-group">
                    <label>
                      <Headset size={15} /> Assign Support Staff
                    </label>

                    <select
                      value={assignedStaffId}
                      onChange={(e) => setAssignedStaffId(e.target.value)}
                      disabled={updatingTicket}
                    >

                      <option value="">
                        Unassigned
                      </option>

                      {activeSupportStaff.map((staff) => (
                        <option
                          key={staff.id}
                          value={String(staff.id)}
                        >
                          {staff.username} ({staff.department || "Support"})
                        </option>
                      ))}

                    </select>
                  </div>

                  {/* TICKET STATUS */}
                  <div className="admin-form-group">
                    <label>Ticket Status</label>

                    <select
                      value={ticketEdit.status}
                      onChange={(e) =>
                        setTicketEdit({
                          ...ticketEdit,
                          status: e.target.value,
                        })
                      }
                      disabled={updatingTicket}
                    >
                      <option value="OPEN">Open</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </div>

                  {/* TICKET PRIORITY */}
                  <div className="admin-form-group">
                    <label>Priority</label>

                    <select
                      value={ticketEdit.priority}
                      onChange={(e) =>
                        setTicketEdit({
                          ...ticketEdit,
                          priority: e.target.value,
                        })
                      }
                      disabled={updatingTicket}
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="admin-ticket-save-btn"
                    disabled={updatingTicket}
                  >
                    <Save size={15} />
                    {updatingTicket ? "Saving..." : "Save Changes"}
                  </button>

                </form>

                {/* UPDATE MESSAGE */}
                {ticketMessage && (
                  <div className={`admin-message ${ticketMessageType}`}>
                    {ticketMessage}
                  </div>
                )}

                {/* CONVERSATION HISTORY */}
                <div className="admin-ticket-conversation">

                  <h3>
                    <Clock size={17} /> Conversation History
                  </h3>

                  {!selectedTicket.messages?.length ? (
                    <p className="admin-no-messages">
                      No messages in this ticket yet.
                    </p>
                  ) : (
                    selectedTicket.messages.map((item) => (

                      <div
                        className="admin-ticket-message"
                        key={item.id}
                      >

                        <div className="admin-ticket-message-top">
                          <strong>
                            {item.sender?.username || "User"}
                          </strong>

                          <span>
                            {formatDate(item.created_at)}
                          </span>
                        </div>

                        {item.is_internal && (
                          <span className="admin-internal-label">
                            <AlertCircle size={12} /> Internal Note
                          </span>
                        )}

                        <p>{item.message}</p>

                      </div>

                    ))
                  )}

                </div>

              </div>
            )}

          </div>

        </div>

      )}

    </div>
  );
}

export default AdminDashboard;
