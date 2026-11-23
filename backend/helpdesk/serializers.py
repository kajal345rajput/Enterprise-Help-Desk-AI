from django.contrib.auth.models import User
from rest_framework import serializers

from .models import (
    UserProfile,
    Ticket,
    TicketMessage,
    KnowledgeBase,
    AIConversation,
    AIMessage,
)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
        ]


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = [
            "id",
            "user",
            "role",
            "department",
            "phone",
            "created_at",
            "updated_at",
        ]


class TicketMessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)

    class Meta:
        model = TicketMessage
        fields = [
            "id",
            "ticket",
            "sender",
            "message",
            "is_internal",
            "created_at",
        ]
        read_only_fields = [
            "sender",
            "created_at",
        ]


class TicketSerializer(serializers.ModelSerializer):
    employee = UserSerializer(read_only=True)
    assigned_to = UserSerializer(read_only=True)
    messages = TicketMessageSerializer(many=True, read_only=True)

    class Meta:
        model = Ticket
        fields = [
            "id",
            "employee",
            "assigned_to",
            "title",
            "description",
            "category",
            "priority",
            "status",
            "ai_generated",
            "messages",
            "created_at",
            "updated_at",
            "resolved_at",
        ]
        read_only_fields = [
            "employee",
            "assigned_to",
            "ai_generated",
            "messages",
            "created_at",
            "updated_at",
            "resolved_at",
        ]


class KnowledgeBaseSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = KnowledgeBase
        fields = [
            "id",
            "title",
            "category",
            "content",
            "source",
            "is_active",
            "created_by",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "created_by",
            "created_at",
            "updated_at",
        ]


class AIMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIMessage
        fields = [
            "id",
            "conversation",
            "role",
            "content",
            "sources",
            "created_at",
        ]
        read_only_fields = [
            "created_at",
        ]


class AIConversationSerializer(serializers.ModelSerializer):
    employee = UserSerializer(read_only=True)
    messages = AIMessageSerializer(many=True, read_only=True)

    class Meta:
        model = AIConversation
        fields = [
            "id",
            "employee",
            "ticket",
            "title",
            "is_escalated",
            "messages",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "employee",
            "is_escalated",
            "messages",
            "created_at",
            "updated_at",
        ]