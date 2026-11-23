from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    """
    Stores additional information and role for each system user.
    """

    ROLE_CHOICES = [
        ("EMPLOYEE", "Employee"),
        ("SUPPORT", "Support Staff"),
        ("ADMIN", "Administrator"),
    ]

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile"
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="EMPLOYEE"
    )

    department = models.CharField(
        max_length=100,
        blank=True
    )

    phone = models.CharField(
        max_length=20,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f"{self.user.username} - {self.role}"


class Ticket(models.Model):
    """
    Stores employee IT support tickets.
    """

    STATUS_CHOICES = [
        ("OPEN", "Open"),
        ("IN_PROGRESS", "In Progress"),
        ("RESOLVED", "Resolved"),
        ("CLOSED", "Closed"),
    ]

    PRIORITY_CHOICES = [
        ("LOW", "Low"),
        ("MEDIUM", "Medium"),
        ("HIGH", "High"),
        ("CRITICAL", "Critical"),
    ]

    CATEGORY_CHOICES = [
        ("HARDWARE", "Hardware"),
        ("SOFTWARE", "Software"),
        ("NETWORK", "Network"),
        ("ACCOUNT", "Account"),
        ("EMAIL", "Email"),
        ("SECURITY", "Security"),
        ("OTHER", "Other"),
    ]

    employee = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="submitted_tickets"
    )

    assigned_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_tickets"
    )

    title = models.CharField(
        max_length=200
    )

    description = models.TextField()

    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        default="OTHER"
    )

    priority = models.CharField(
        max_length=20,
        choices=PRIORITY_CHOICES,
        default="MEDIUM"
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="OPEN"
    )

    ai_generated = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    resolved_at = models.DateTimeField(
        null=True,
        blank=True
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"#{self.id} - {self.title}"


class TicketMessage(models.Model):
    """
    Stores messages exchanged inside a support ticket.
    """

    ticket = models.ForeignKey(
        Ticket,
        on_delete=models.CASCADE,
        related_name="messages"
    )

    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="ticket_messages"
    )

    message = models.TextField()

    is_internal = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"Message #{self.id} - Ticket #{self.ticket.id}"


class KnowledgeBase(models.Model):
    """
    Stores organizational IT knowledge used by the RAG system.
    """

    CATEGORY_CHOICES = [
        ("HARDWARE", "Hardware"),
        ("SOFTWARE", "Software"),
        ("NETWORK", "Network"),
        ("ACCOUNT", "Account"),
        ("EMAIL", "Email"),
        ("SECURITY", "Security"),
        ("GENERAL", "General"),
    ]

    title = models.CharField(
        max_length=200
    )

    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        default="GENERAL"
    )

    content = models.TextField()

    source = models.CharField(
        max_length=255,
        blank=True
    )

    is_active = models.BooleanField(
        default=True
    )

    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="knowledge_articles"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return self.title


class AIConversation(models.Model):
    """
    Represents one AI support conversation with an employee.
    """

    employee = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="ai_conversations"
    )

    ticket = models.ForeignKey(
        Ticket,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="ai_conversations"
    )

    title = models.CharField(
        max_length=200,
        blank=True
    )

    is_escalated = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return f"AI Conversation #{self.id}"


class AIMessage(models.Model):
    """
    Stores individual messages exchanged with the AI Support Agent.
    """

    ROLE_CHOICES = [
        ("USER", "User"),
        ("AI", "AI Assistant"),
        ("SYSTEM", "System"),
    ]

    conversation = models.ForeignKey(
        AIConversation,
        on_delete=models.CASCADE,
        related_name="messages"
    )

    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES
    )

    content = models.TextField()

    sources = models.JSONField(
        default=list,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.role} Message #{self.id}"

class KnowledgeEmbedding(models.Model):
    """
    Stores Gemini embeddings for knowledge-base articles.
    """

    knowledge = models.OneToOneField(
        KnowledgeBase,
        on_delete=models.CASCADE,
        related_name="embedding"
    )

    vector = models.JSONField()

    content_hash = models.CharField(
        max_length=64,
        blank=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f"Embedding - {self.knowledge.title}"