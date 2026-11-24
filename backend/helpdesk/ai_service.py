
import os
import time
from pathlib import Path

from dotenv import load_dotenv
from google import genai

# Load API key from backend/.env
BASE_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BASE_DIR / ".env")

API_KEY = os.getenv("GEMINI_API_KEY")

MODEL_NAME = "gemini-3.5-flash-lite"

# Temporary errors that may resolve after waiting
RETRYABLE_ERRORS = (
    "503",
    "UNAVAILABLE",
    "429",
    "RESOURCE_EXHAUSTED",
    "500",
    "INTERNAL",
    "502",
    "504",
)


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

    # Retry temporary Gemini service errors up to 3 times
    for attempt in range(3):
        try:
            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=prompt
            )

            return response.text or (
                "I couldn't generate a response. Please try again."
            )

        except Exception as error:
            error_message = str(error).upper()

            is_retryable = any(
                code in error_message
                for code in RETRYABLE_ERRORS
            )

            # Do not retry permanent errors
            if not is_retryable or attempt == 2:
                raise

            wait_time = 2 ** (attempt + 1)

            print(
                f"Gemini temporary error. "
                f"Retrying in {wait_time} seconds... "
                f"(Attempt {attempt + 1}/3)"
            )

            time.sleep(wait_time)

    raise RuntimeError("Gemini could not generate a response.")