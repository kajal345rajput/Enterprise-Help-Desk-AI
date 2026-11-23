
import hashlib

from django.core.management.base import BaseCommand

from helpdesk.models import KnowledgeBase, KnowledgeEmbedding
from helpdesk.embedding_service import get_document_embedding


class Command(BaseCommand):
    help = "Generate and store Gemini embeddings for knowledge articles."

    def handle(self, *args, **options):

        articles = KnowledgeBase.objects.filter(is_active=True)

        if not articles.exists():
            self.stdout.write(
                self.style.WARNING("No active knowledge articles found.")
            )
            return

        success_count = 0

        for article in articles:
            text = (
                f"Title: {article.title}\n"
                f"Category: {article.category}\n"
                f"Content: {article.content}"
            )

            content_hash = hashlib.sha256(
                text.encode("utf-8")
            ).hexdigest()

            existing = KnowledgeEmbedding.objects.filter(
                knowledge=article
            ).first()

            # Skip articles that have not changed.
            if existing and existing.content_hash == content_hash:
                self.stdout.write(
                    f"Skipped: {article.title}"
                )
                continue

            try:
                self.stdout.write(
                    f"Generating embedding: {article.title}"
                )

                vector = get_document_embedding(text)

                KnowledgeEmbedding.objects.update_or_create(
                    knowledge=article,
                    defaults={
                        "vector": list(vector),
                        "content_hash": content_hash
                    }
                )

                success_count += 1

                self.stdout.write(
                    self.style.SUCCESS(
                        f"Successfully indexed: {article.title}"
                    )
                )

            except Exception as error:
                self.stdout.write(
                    self.style.ERROR(
                        f"Failed: {article.title} - {error}"
                    )
                )

        self.stdout.write(
            self.style.SUCCESS(
                f"Indexing completed. Newly indexed: {success_count}"
            )
        )
