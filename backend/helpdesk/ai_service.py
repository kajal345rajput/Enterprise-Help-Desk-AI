
import os
from pathlib import Path

from dotenv import load_dotenv
from google import genai

# Load API key from backend/.env
BASE_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BASE_DIR / ".env")

API_KEY = os.getenv("GEMINI_API_KEY")

MODEL_NAME = "gemini-3.5-flash-lite"


def generate_ai_response(message, knowledge_context=""):
    if not API_KEY:
        raise ValueError("Gemini API key is missing.")

    client = genai.Client(api_key=API_KEY)

    prompt = f"""
You are an AI IT Support Assistant for an enterprise help desk.

Help employees solve IT problems in simple, clear steps.

Use the following knowledge base information when relevant:
{knowledge_context}

Employee question:
{message}

Instructions:
1. Give accurate and practical troubleshooting steps.
2. Keep answers easy to understand.
3. Never invent company policies.
4. If the knowledge base does not contain the answer,
   clearly mention that further support may be required.
5. Never ask for passwords or confidential credentials.
"""

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt
    )

    return response.text or "I couldn't generate a response. Please try again."
