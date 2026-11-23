
import os
from pathlib import Path

from dotenv import load_dotenv
from google import genai


# Load API key from backend/.env
BASE_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BASE_DIR / ".env")

API_KEY = os.getenv("GEMINI_API_KEY")

# Gemini embedding model
EMBEDDING_MODEL = "gemini-embedding-001"


def get_embedding(text, task_type):
    """
    Convert text into a numerical embedding vector.
    """

    if not API_KEY:
        raise ValueError("Gemini API key is missing.")

    if not text or not text.strip():
        raise ValueError("Text cannot be empty.")

    client = genai.Client(api_key=API_KEY)

    response = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=text,
        config={
            "task_type": task_type
        }
    )

    return response.embeddings[0].values


def get_document_embedding(text):
    """Generate an embedding for a knowledge-base article."""

    return get_embedding(
        text,
        "RETRIEVAL_DOCUMENT"
    )


def get_query_embedding(text):
    """Generate an embedding for an employee question."""

    return get_embedding(
        text,
        "RETRIEVAL_QUERY"
    )
