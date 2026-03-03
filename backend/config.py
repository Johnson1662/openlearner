import os
from dotenv import load_dotenv

load_dotenv()

# Gemini Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
VERTEX_PROJECT_ID = os.getenv("VERTEX_PROJECT_ID") or os.getenv("GOOGLE_CLOUD_PROJECT", "")
VERTEX_LOCATION = os.getenv("VERTEX_LOCATION") or os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1")
VERTEX_MODEL = os.getenv("VERTEX_MODEL", "gemini-1.5-flash")

SPARK_API_KEY = os.getenv("SPARK_API_KEY", "")
SPARK_BASE_URL = os.getenv("SPARK_BASE_URL", "https://maas-api.cn-huabei-1.xf-yun.com/v2")
SPARK_MODEL = os.getenv("SPARK_MODEL", "xopqwen35397b")

# Database
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./openlearner.db")

# Server
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))
