import pytest
import json
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from modules.agent.tools import retrieve_knowledge, generate_level_content


def test_retrieve_knowledge_returns_json():
    """retrieve_knowledge should return JSON string."""
    result = retrieve_knowledge(query="Python variables", top_k=2)
    data = json.loads(result)
    assert "results" in data or "content" in data


def test_generate_level_content_returns_json():
    """generate_level_content should return valid JSON with required fields."""
    result = generate_level_content(
        level_title="变量基础",
        level_description="学习变量定义",
        chapter_title="第一章",
        material="Python变量：x = 10",
    )
    data = json.loads(result)
    assert "narrative" in data
    assert "quiz" in data
