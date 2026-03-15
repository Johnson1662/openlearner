import json
import os
import sys
from dataclasses import dataclass
from typing import Any, Iterable

BACKEND_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if BACKEND_ROOT not in sys.path:
    sys.path.insert(0, BACKEND_ROOT)

from config import GEMINI_API_KEY, GEMINI_MODEL

from logging_config import logger


@dataclass
class _Part:
    text: str = ""
    thought: str = ""
    call: Any = None


@dataclass
class _Content:
    parts: list[_Part]


@dataclass
class _Candidate:
    content: _Content


@dataclass
class _Chunk:
    candidates: list[_Candidate]


class GeminiProvider:
    """AI provider that calls the Gemini API via google-genai SDK."""

    def __init__(self, api_key: str = "", model: str = ""):
        self.api_key = api_key or GEMINI_API_KEY
        self.model = model or GEMINI_MODEL or "gemini-2.0-flash"
        self._client = None

    def _get_client(self):
        if self._client is None:
            from google import genai
            self._client = genai.Client(api_key=self.api_key)
        return self._client

    def generate_text(self, prompt: str, system_instruction: str = "") -> str:
        """Generate text using Gemini API (non-streaming)."""
        from google.genai import types

        client = self._get_client()
        config = types.GenerateContentConfig(
            system_instruction=system_instruction or None,
        )
        response = client.models.generate_content(
            model=self.model,
            contents=prompt,
            config=config,
        )
        return response.text or ""

    def generate_json(self, prompt: str, system_instruction: str = "", json_schema: dict | None = None) -> dict:
        """Generate structured JSON using Gemini API."""
        from google.genai import types

        client = self._get_client()
        config = types.GenerateContentConfig(
            response_mime_type="application/json",
            system_instruction=system_instruction or None,
        )
        if json_schema:
            config.response_json_schema = json_schema  # type: ignore[assignment]

        response = client.models.generate_content(
            model=self.model,
            contents=prompt,
            config=config,
        )
        text = response.text or "{}"
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            logger.error(f"Failed to parse AI JSON response: {text[:500]}")
            return {}

    def generate_stream(self, messages: list[dict[str, str]], options: dict[str, Any] | None = None) -> Iterable[_Chunk]:
        """Stream generation (kept for backward compatibility with agent)."""
        from google.genai import types

        client = self._get_client()

        # Build contents from messages
        contents = []
        system_instruction = ""
        for msg in messages:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            if role == "system":
                system_instruction = content
            else:
                contents.append(content)

        prompt = "\n\n".join(contents) if contents else ""
        config = types.GenerateContentConfig(
            system_instruction=system_instruction or None,
        )

        try:
            response = client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=config,
            )
            text = response.text or ""
            yield _Chunk(candidates=[_Candidate(content=_Content(parts=[_Part(text=text)]))])
        except Exception as e:
            logger.error(f"AI stream generation failed: {e}")
            yield _Chunk(candidates=[_Candidate(content=_Content(parts=[_Part(text=f"AI 调用失败: {str(e)}")]))])


class SimpleProvider:
    """Fallback provider when no API key is configured."""

    def generate_text(self, prompt: str, system_instruction: str = "") -> str:
        return f"(无 AI 可用) 收到提示: {prompt[:200]}"

    def generate_json(self, prompt: str, system_instruction: str = "", json_schema: dict | None = None) -> dict:
        return {}

    def generate_stream(self, messages: list[dict[str, str]], options: dict[str, Any] | None = None) -> Iterable[_Chunk]:
        user_message = ""
        if messages:
            user_message = messages[-1].get("content", "")
        text = f"我已收到你的问题：{user_message[:200]}"
        yield _Chunk(candidates=[_Candidate(content=_Content(parts=[_Part(text=text)]))])


def get_provider() -> GeminiProvider | SimpleProvider:
    if GEMINI_API_KEY:
        return GeminiProvider()
    return SimpleProvider()
