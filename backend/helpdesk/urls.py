
from django.urls import path

from .views import (
    RegisterView,
    LoginView,
    TicketListCreateView,
    TicketDetailView,
)

from .ai_views import (
    AIChatView,
    EscalateConversationView,
)


urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),

    path("tickets/", TicketListCreateView.as_view(), name="tickets"),
    path("tickets/<int:pk>/", TicketDetailView.as_view(), name="ticket-detail"),

    # AI Support Chat and Escalation
    path("ai/chat/", AIChatView.as_view(), name="ai-chat"),
    path("ai/escalate/", EscalateConversationView.as_view(), name="ai-escalate"),
]
