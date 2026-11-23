
import math

from django.db import transaction

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import (
    AIConversation,
    AIMessage,
    KnowledgeEmbedding,
    Ticket,
)

from .serializers import TicketSerializer
from .ai_service import generate_ai_response
from .embedding_service import get_query_embedding


def cosine_similarity(vector_a, vector_b):
    """Calculate cosine similarity between two vectors."""

    if len(vector_a) != len(vector_b):
        return 0.0

    dot_product = sum(
        a * b for a, b in zip(vector_a, vector_b)
    )

    magnitude_a = math.sqrt(sum(a * a for a in vector_a))
    magnitude_b = math.sqrt(sum(b * b for b in vector_b))

    if magnitude_a == 0 or magnitude_b == 0:
        return 0.0

    return dot_product / (magnitude_a * magnitude_b)


class AIChatView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        message = request.data.get("message", "")

        # Validate the employee's message.
        if not isinstance(message, str):
            return Response(
                {"error": "Message must be text."},
                status=status.HTTP_400_BAD_REQUEST
            )

        message = message.strip()
        conversation_id = request.data.get("conversation_id")

        if not message:
            return Response(
                {"error": "Please enter a message."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(message) > 2000:
            return Response(
                {"error": "Message is too long."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Find an existing conversation or create a new one.
        conversation = None

        if conversation_id:
            try:
                conversation_id = int(conversation_id)
            except (ValueError, TypeError):
                return Response(
                    {"error": "Invalid conversation ID."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            conversation = AIConversation.objects.filter(
                id=conversation_id,
                employee=request.user
            ).first()

            if not conversation:
                return Response(
                    {"error": "Conversation not found."},
                    status=status.HTTP_404_NOT_FOUND
                )

        if not conversation:
            conversation = AIConversation.objects.create(
                employee=request.user,
                title=message[:100]
            )

        # Save the employee's message.
        AIMessage.objects.create(
            conversation=conversation,
            role="USER",
            content=message
        )

        try:
            # Generate an embedding for the employee's question.
            query_vector = get_query_embedding(message)

            # Retrieve embeddings of active knowledge-base articles.
            stored_embeddings = KnowledgeEmbedding.objects.filter(
                knowledge__is_active=True
            ).select_related("knowledge")

            scored_articles = []

            # Calculate similarity for every stored article.
            for item in stored_embeddings:
                similarity = cosine_similarity(
                    query_vector,
                    item.vector
                )

                scored_articles.append(
                    (similarity, item.knowledge)
                )

            # Sort articles from highest to lowest similarity.
            scored_articles.sort(
                key=lambda item: item[0],
                reverse=True
            )

            # Keep only articles with similarity >= 0.705.
            articles = [
                article
                for similarity, article in scored_articles
                if similarity >= 0.705
            ]

            # Retain the best match if no article meets the threshold.
            if not articles and scored_articles:
                articles = [scored_articles[0][1]]

            # Use a maximum of three relevant articles.
            articles = articles[:3]

            # Prepare knowledge context for Gemini.
            knowledge_context = "\n\n".join(
                f"Title: {article.title}\n"
                f"Category: {article.category}\n"
                f"Content: {article.content}"
                for article in articles
            )

            # Prepare source information for the frontend.
            sources = [
                {
                    "id": article.id,
                    "title": article.title
                }
                for article in articles
            ]

            # Generate an AI answer using retrieved knowledge.
            reply = generate_ai_response(
                message,
                knowledge_context
            )

            # Save the AI response.
            AIMessage.objects.create(
                conversation=conversation,
                role="AI",
                content=reply,
                sources=sources
            )

            return Response({
                "conversation_id": conversation.id,
                "reply": reply,
                "sources": sources,
                "needs_escalation": False
            })

        except Exception as error:
            print("AI Chat Error:", error)

            return Response(
                {
                    "error": (
                        "AI support is temporarily unavailable. "
                        "Please try again."
                    )
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )


class EscalateConversationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        # Only employees can escalate their AI conversations.
        if not hasattr(request.user, "profile"):
            return Response(
                {"error": "User profile not found."},
                status=status.HTTP_403_FORBIDDEN
            )

        if request.user.profile.role != "EMPLOYEE":
            return Response(
                {"error": "Only employees can escalate conversations."},
                status=status.HTTP_403_FORBIDDEN
            )

        conversation_id = request.data.get("conversation_id")
        confirmed = request.data.get("confirmed")

        # Require explicit employee confirmation.
        if confirmed is not True:
            return Response(
                {"error": "Please confirm ticket creation."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            conversation_id = int(conversation_id)
        except (ValueError, TypeError):
            return Response(
                {"error": "Invalid conversation ID."},
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():

            # Verify ownership and prevent duplicate tickets.
            conversation = AIConversation.objects.select_for_update().filter(
                id=conversation_id,
                employee=request.user
            ).first()

            if not conversation:
                return Response(
                    {"error": "Conversation not found."},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Return the existing ticket if already escalated.
            if conversation.ticket_id:
                return Response(
                    {
                        "message": "This conversation already has a support ticket.",
                        "ticket": TicketSerializer(
                            conversation.ticket
                        ).data
                    },
                    status=status.HTTP_200_OK
                )

            # Collect the conversation history.
            chat_messages = conversation.messages.order_by(
                "created_at"
            )

            if not chat_messages.filter(role="USER").exists():
                return Response(
                    {"error": "No employee messages found in this conversation."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            transcript = []

            for item in chat_messages:
                speaker = (
                    "Employee"
                    if item.role == "USER"
                    else "AI Assistant"
                    if item.role == "AI"
                    else "System"
                )

                transcript.append(
                    f"{speaker}:\n{item.content}"
                )

            description = (
                "This support ticket was created from an AI Support conversation.\n\n"
                + "\n\n".join(transcript)
            )

            # Create the support ticket.
            ticket = Ticket.objects.create(
                employee=request.user,
                title=conversation.title[:200] or "AI Support Escalation",
                description=description,
                category="OTHER",
                priority="MEDIUM",
                status="OPEN",
                ai_generated=True
            )

            # Link the ticket to its AI conversation.
            conversation.ticket = ticket
            conversation.is_escalated = True
            conversation.save(
                update_fields=[
                    "ticket",
                    "is_escalated",
                    "updated_at"
                ]
            )

        return Response(
            {
                "message": "Your issue has been successfully escalated to the support team.",
                "ticket": TicketSerializer(ticket).data
            },
            status=status.HTTP_201_CREATED
        )
