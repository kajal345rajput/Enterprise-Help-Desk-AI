
from pathlib import Path
import os
from dotenv import load_dotenv
from google import genai

# Load key from backend/.env
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / "backend" / ".env")

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("ERROR: API key not found in backend/.env")
else:
    try:
        client = genai.Client(api_key=api_key)

        response = client.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents="Reply with exactly: Gemini connection successful."
        )

        print("SUCCESS!")
        print(response.text)

    except Exception as error:
        print("GEMINI ERROR:", error)
