
from pathlib import Path
import os
from dotenv import load_dotenv
from google import genai

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / "backend" / ".env")

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("API KEY NOT FOUND")
else:
    try:
        client = genai.Client(api_key=api_key)

        print("AVAILABLE GEMINI MODELS:\n")

        for model in client.models.list():
            if "generateContent" in (model.supported_actions or []):
                print(model.name)

    except Exception as error:
        print("ERROR:", error)
