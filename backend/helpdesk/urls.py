
from django.urls import path

from .views import (
    RegisterView,
    LoginView,
    TicketListCreateView,
    TicketDetailView,
    TicketMessageCreateView,
    AdminCreateUserView,
)

from .ai_views import (
    AIChatView,
    EscalateConversationView,
)


urlpatterns = [
    # Authentication
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),

    # Tickets
    path("tickets/", TicketListCreateView.as_view(), name="tickets"),
    path(
        "tickets/<int:pk>/",
        TicketDetailView.as_view(),
        name="ticket-detail"
    ),

    # Ticket replies and internal notes
    path(
        "tickets/<int:pk>/messages/",
        TicketMessageCreateView.as_view(),
        name="ticket-messages"
    ),

    # Admin user management
    path(
        "admin/users/",
        AdminCreateUserView.as_view(),
        name="admin-create-user"
    ),

    # AI Support Chat and Escalation
    path("ai/chat/", AIChatView.as_view(), name="ai-chat"),
    path(
        "ai/escalate/",
        EscalateConversationView.as_view(),
        name="ai-escalate"
    ),
]
