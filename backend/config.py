import os
from dotenv import load_dotenv

load_dotenv()

# Gemini Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
SPARK_API_KEY = os.getenv("SPARK_API_KEY", "")
SPARK_BASE_URL = os.getenv("SPARK_BASE_URL", "https://maas-api.cn-huabei-1.xf-yun.com/v2")
SPARK_MODEL = os.getenv("SPARK_MODEL", "xopqwen35397b")

# Database
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./openlearner.db")

# Server
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))
