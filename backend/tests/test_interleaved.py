import pytest
import json
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from agent.tools import generate_level_content

def test_interleaved_output_has_required_fields():
    """Output must have narrative, images, svg_animations, quiz."""
    result = generate_level_content(
        level_title="测试",
        level_description="测试内容",
        chapter_title="第一章",
        material="测试材料"
    )
    
    data = json.loads(result)
    
    assert "narrative" in data, "Missing 'narrative' field"
    assert "images" in data, "Missing 'images' field"
    assert "svg_animations" in data, "Missing 'svg_animations' field"
    assert "quiz" in data, "Missing 'quiz' field"
