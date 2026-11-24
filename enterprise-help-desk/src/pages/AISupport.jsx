
import "../AISupport.css";
import { motion } from "framer-motion";
import {
  Bot,
  ArrowLeft,
  Send,
  Sparkles,
  Wifi,
  LockKeyhole,
  Mail,
  Printer,
  User,
  Paperclip,
  CheckCheck,
  ShieldCheck,
  Headphones,
  BookOpen,
  RotateCcw,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const API_BASE_URL = "http://127.0.0.1:8000";

// Automatically refresh an expired access token and retry the request.
async function authenticatedFetch(url, options = {}) {
  let accessToken = localStorage.getItem("access_token");

  if (!accessToken) {
    throw new Error("Your session has expired. Please log in again.");
  }

  const sendRequest = (token) =>
    fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });

  // First request using the current access token.
  let response = await sendRequest(accessToken);

  // If unauthorized, try refreshing the access token.
  if (response.status === 401) {
    const refreshToken = localStorage.getItem("refresh_token");

    if (!refreshToken) {
      throw new Error("Your session has expired. Please log in again.");
    }

    const refreshResponse = await fetch(
      `${API_BASE_URL}/api/token/refresh/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refresh: refreshToken,
        }),
      }
    );

    if (!refreshResponse.ok) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      throw new Error("Your session has expired. Please log in again.");
    }

    const refreshData = await refreshResponse.json();

    if (!refreshData.access) {
      throw new Error("Unable to refresh your session. Please log in again.");
    }

    // Save the new access token.
    accessToken = refreshData.access;
    localStorage.setItem("access_token", accessToken);

    // Save a new refresh token if rotation is enabled.
    if (refreshData.refresh) {
      localStorage.setItem("refresh_token", refreshData.refresh);
    }

    // Retry the original request with the new token.
    response = await sendRequest(accessToken);
  }

  return response;
}

function AISupport() {
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const displayName = storedUser.username || "Employee";
  const firstName = displayName.trim().split(/\s+/)[0];

  const [message, setMessage] = useState("");
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);

  // Escalation states
  const [showEscalationConfirm, setShowEscalationConfirm] = useState(false);
  const [escalating, setEscalating] = useState(false);
  const [ticketCreated, setTicketCreated] = useState(null);
  const [escalationError, setEscalationError] = useState("");

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, ticketCreated, showEscalationConfirm]);

  const suggestions = [
    { icon: LockKeyhole, text: "How do I reset my password?" },
    { icon: Wifi, text: "My office Wi-Fi is not working" },
    { icon: Mail, text: "I can't access my email" },
    { icon: Printer, text: "My printer is not responding" },
  ];

  const handleSuggestion = (text) => {
    setMessage(text);
  };

  // Send a message to the AI Support Agent.
  const handleSend = async () => {
    const userMessage = message.trim();

    if (!userMessage || loading || escalating || ticketCreated) return;

    if (!localStorage.getItem("access_token")) {
      alert("Your session has expired. Please log in again.");
      return;
    }

    setMessages((previous) => [
      ...previous,
      { role: "USER", content: userMessage },
    ]);

    setMessage("");
    setLoading(true);
    setShowEscalationConfirm(false);
    setEscalationError("");

    try {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/api/ai/chat/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: userMessage,
            ...(conversationId && {
              conversation_id: conversationId,
            }),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to get an AI response."
        );
      }

      setConversationId(data.conversation_id);

      setMessages((previous) => [
        ...previous,
        {
          role: "AI",
          content: data.reply,
          sources: data.sources || [],
        },
      ]);
    } catch (error) {
      setMessages((previous) => [
        ...previous,
        {
          role: "ERROR",
          content:
            error.message || "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Create a support ticket from the conversation.
  const handleEscalate = async () => {
    if (!conversationId || escalating || ticketCreated) return;

    if (!localStorage.getItem("access_token")) {
      setEscalationError("Your session has expired. Please log in again.");
      return;
    }

    setEscalating(true);
    setEscalationError("");

    try {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/api/ai/escalate/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            conversation_id: conversationId,
            confirmed: true,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to create the support ticket."
        );
      }

      setTicketCreated(data.ticket);
      setShowEscalationConfirm(false);
    } catch (error) {
      setEscalationError(
        error.message || "Something went wrong. Please try again."
      );
    } finally {
      setEscalating(false);
    }
  };

  // Start a fresh conversation.
  const handleNewConversation = () => {
    setMessages([]);
    setConversationId(null);
    setMessage("");
    setShowEscalationConfirm(false);
    setEscalating(false);
    setTicketCreated(null);
    setEscalationError("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="ai-support-page">

      {/* Top navigation */}
      <header className="ai-support-header">
        <div className="ai-support-header-left">
          <Link
            to="/dashboard"
            className="back-dashboard"
            title="Back to dashboard"
          >
            <ArrowLeft size={19} />
          </Link>

          <div className="ai-header-brand">
            <div className="ai-header-icon">
              <Bot size={23} />
            </div>

            <div>
              <strong>AI Support Agent</strong>
              <span>Enterprise Help Desk</span>
            </div>
          </div>
        </div>

        <div className="ai-header-status">
          <span />
          AI Assistant Online
        </div>
      </header>

      {/* Main content */}
      <main className="ai-support-main">

        {/* Chat panel */}
        <section className="ai-chat-container">

          <div className="ai-chat-header">
            <div className="ai-agent-profile">
              <div className="ai-agent-avatar">
                <Bot size={25} />
                <span />
              </div>

              <div>
                <strong>HelpDesk AI</strong>
                <p>
                  <span className="agent-live-dot" />
                  Intelligent technical assistance
                </p>
              </div>
            </div>

            <div className="ai-chat-header-actions">
              <span className="ai-secure-label">
                <ShieldCheck size={14} />
                Secure session
              </span>

              <button
                className="chat-menu-button"
                type="button"
                title="New conversation"
                onClick={handleNewConversation}
              >
                <RotateCcw size={17} />
              </button>
            </div>
          </div>

          {/* Message area */}
          <div className="ai-messages">

            {/* Welcome message */}
            <motion.div
              className="ai-message-row ai-message-row-agent"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="message-avatar">
                <Bot size={18} />
              </div>

              <div className="ai-message-content">
                <div className="message-sender">HelpDesk AI</div>

                <div className="ai-message-bubble ai-bot-bubble">
                  <p className="welcome-title">
                    Hello {firstName}! <span>👋</span>
                  </p>

                  <p>
                    Welcome to your intelligent IT support assistant.
                    I'm here to help you solve technical issues quickly.
                  </p>

                  <p>
                    Ask me about passwords, network connectivity,
                    email, devices, or any workplace IT problem.
                    I can also help you find answers from your
                    organization's knowledge base.
                  </p>

                  <div className="welcome-highlight">
                    <Sparkles size={16} />
                    How can I make your work easier today?
                  </div>
                </div>

                <span className="message-time">Just now</span>
              </div>
            </motion.div>

            {/* Suggested questions */}
            {messages.length === 0 && (
              <motion.div
                className="ai-suggestions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="suggestion-heading">
                  <Sparkles size={15} />
                  <span>Quick suggestions</span>
                </div>

                <div className="suggestion-grid">
                  {suggestions.map((item) => {
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.text}
                        className="suggestion-card"
                        type="button"
                        onClick={() => handleSuggestion(item.text)}
                      >
                        <div className="suggestion-icon">
                          <Icon size={18} />
                        </div>

                        <span>{item.text}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Conversation messages */}
            {messages.map((item, index) => {
              const isUser = item.role === "USER";
              const isError = item.role === "ERROR";

              return (
                <motion.div
                  key={index}
                  className={`ai-message-row ${
                    isUser
                      ? "ai-message-row-user"
                      : "ai-message-row-agent"
                  } ${isError ? "ai-message-row-error" : ""}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="message-avatar">
                    {isUser ? (
                      <User size={18} />
                    ) : (
                      <Bot size={18} />
                    )}
                  </div>

                  <div className="ai-message-content">
                    <div className="message-sender">
                      {isUser
                        ? firstName
                        : isError
                          ? "Something went wrong"
                          : "HelpDesk AI"}
                    </div>

                    <div
                      className={`ai-message-bubble ${
                        isUser
                          ? "ai-user-bubble"
                          : isError
                            ? "ai-error-bubble"
                            : "ai-bot-bubble"
                      }`}
                    >
                      {isUser ? (
                        <p>{item.content}</p>
                      ) : (
                        <div className="ai-markdown-content">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {item.content}
                          </ReactMarkdown>
                        </div>
                      )}

                      {item.sources?.length > 0 && (
                        <div className="ai-sources">
                          <div className="ai-sources-heading">
                            <BookOpen size={15} />
                            Knowledge base sources
                          </div>

                          <ul>
                            {item.sources.map((source) => (
                              <li key={source.id}>
                                {source.title}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <span className="message-time">
                      {isUser ? "You" : isError ? "Error" : "AI Support"}
                    </span>
                  </div>
                </motion.div>
              );
            })}

            {/* Escalation confirmation */}
            {conversationId &&
              messages.some((item) => item.role === "AI") &&
              !ticketCreated && (
                <motion.div
                  className="ai-message-row ai-message-row-agent"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="message-avatar">
                    <Headphones size={18} />
                  </div>

                  <div className="ai-message-content">
                    <div className="message-sender">
                      Support assistance
                    </div>

                    <div
                      className="ai-message-bubble ai-bot-bubble"
                      style={{ maxWidth: "100%" }}
                    >
                      {!showEscalationConfirm ? (
                        <>
                          <p>
                            <strong>Still need help?</strong>
                          </p>

                          <p>
                            If the AI suggestions did not resolve your
                            issue, you can send this conversation to
                            our support team.
                          </p>

                          <button
                            type="button"
                            onClick={() =>
                              setShowEscalationConfirm(true)
                            }
                            style={{
                              marginTop: "10px",
                              padding: "10px 16px",
                              border: "none",
                              borderRadius: "9px",
                              background:
                                "linear-gradient(135deg, #2563eb, #7c3aed)",
                              color: "#ffffff",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            Escalate to Support Team
                          </button>
                        </>
                      ) : (
                        <>
                          <p>
                            <strong>Confirm ticket creation</strong>
                          </p>

                          <p>
                            Your conversation history will be shared
                            with the support team so they can investigate
                            your issue. Do you want to continue?
                          </p>

                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "10px",
                              marginTop: "12px",
                            }}
                          >
                            <button
                              type="button"
                              onClick={handleEscalate}
                              disabled={escalating}
                              style={{
                                padding: "10px 16px",
                                border: "none",
                                borderRadius: "9px",
                                background:
                                  "linear-gradient(135deg, #2563eb, #7c3aed)",
                                color: "#ffffff",
                                fontWeight: 600,
                                cursor: escalating ? "wait" : "pointer",
                                opacity: escalating ? 0.7 : 1,
                              }}
                            >
                              {escalating
                                ? "Creating ticket..."
                                : "Confirm"}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setShowEscalationConfirm(false)
                              }
                              disabled={escalating}
                              style={{
                                padding: "10px 16px",
                                border:
                                  "1px solid rgba(148,163,184,0.35)",
                                borderRadius: "9px",
                                background: "transparent",
                                color: "inherit",
                                cursor: "pointer",
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </>
                      )}

                      {escalationError && (
                        <p
                          style={{
                            color: "#f87171",
                            marginTop: "10px",
                          }}
                        >
                          {escalationError}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

            {/* Ticket creation success */}
            {ticketCreated && (
              <motion.div
                className="ai-message-row ai-message-row-agent"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="message-avatar">
                  <CheckCheck size={18} />
                </div>

                <div className="ai-message-content">
                  <div className="message-sender">
                    Support ticket created
                  </div>

                  <div className="ai-message-bubble ai-bot-bubble">
                    <p>
                      Your issue has been successfully sent to
                      the support team.
                    </p>

                    <p style={{ marginTop: "8px" }}>
                      <strong>Ticket ID: #{ticketCreated.id}</strong>
                    </p>

                    <p>
                      Status: {ticketCreated.status || "OPEN"}
                    </p>

                    <Link
                      to="/tickets"
                      style={{
                        display: "inline-block",
                        marginTop: "10px",
                        color: "#60a5fa",
                        fontWeight: 600,
                      }}
                    >
                      View My Tickets
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}

            {/* AI loading */}
            {loading && (
              <motion.div
                className="ai-message-row ai-message-row-agent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="message-avatar">
                  <Bot size={18} />
                </div>

                <div className="ai-message-content">
                  <div className="message-sender">HelpDesk AI</div>

                  <div className="ai-message-bubble ai-bot-bubble ai-loading-bubble">
                    <div className="typing-indicator">
                      <span />
                      <span />
                      <span />
                    </div>
                    <span>Analyzing your request...</span>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Message composer */}
          <div className="ai-input-area">
            <div className="ai-input-box">
              <button
                className="attachment-button"
                type="button"
                disabled
                title="Attachments are not available yet"
              >
                <Paperclip size={19} />
              </button>

              <input
                type="text"
                placeholder="Describe your technical issue..."
                value={message}
                disabled={loading || Boolean(ticketCreated)}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={handleKeyDown}
              />

              <button
                className="send-message-button"
                type="button"
                onClick={handleSend}
                disabled={
                  loading || !message.trim() || Boolean(ticketCreated)
                }
                title="Send message"
              >
                <Send size={18} />
              </button>
            </div>

            <p className="ai-input-note">
              <Sparkles size={13} />
              AI-generated responses may occasionally be inaccurate.
              Verify important information with your support team.
            </p>
          </div>
        </section>

        {/* Right information panel */}
        <aside className="ai-support-sidebar">

          <div className="ai-info-card">
            <div className="ai-info-card-glow" />

            <div className="info-card-icon">
              <Sparkles size={23} />
            </div>

            <span className="ai-card-eyebrow">
              SMART IT ASSISTANCE
            </span>
            <h3>Support, powered by AI.</h3>

            <p>
              Get intelligent answers and troubleshooting guidance
              using your organization's knowledge base.
            </p>

            <div className="ai-info-card-footer">
              <span className="ai-card-status-dot" />
              Available to assist you
            </div>
          </div>

          <div className="ai-info-section">
            <div className="ai-sidebar-heading">
              <div>
                <span>EXPLORE</span>
                <h3>What I can help with</h3>
              </div>
              <Headphones size={20} />
            </div>

            <div className="help-topic">
              <div className="help-topic-icon topic-blue">
                <Wifi size={17} />
              </div>
              <span>Network & Wi-Fi</span>
            </div>

            <div className="help-topic">
              <div className="help-topic-icon topic-purple">
                <LockKeyhole size={17} />
              </div>
              <span>Password & Accounts</span>
            </div>

            <div className="help-topic">
              <div className="help-topic-icon topic-cyan">
                <Mail size={17} />
              </div>
              <span>Email & Communication</span>
            </div>

            <div className="help-topic">
              <div className="help-topic-icon topic-pink">
                <Printer size={17} />
              </div>
              <span>Printers & Devices</span>
            </div>
          </div>

          <div className="ai-escalation-card">
            <div className="escalation-icon">
              <User size={20} />
            </div>

            <div>
              <strong>Need human support?</strong>

              <p>
                Can't find the solution? Raise a ticket
                and let our support team help you.
              </p>

              <Link to="/tickets/new">
                Create Support Ticket
                <ArrowLeft
                  size={14}
                  className="ticket-link-arrow"
                />
              </Link>
            </div>
          </div>

          <div className="ai-security-note">
            <CheckCheck size={17} />
            <span>
              Your conversations are handled securely
              within the enterprise support system.
            </span>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default AISupport;