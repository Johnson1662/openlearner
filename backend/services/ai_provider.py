import json
from typing import Optional, List, Dict, Any
from config import SPARK_API_KEY, SPARK_BASE_URL, SPARK_MODEL, GEMINI_API_KEY


class AIProvider:
    """AI Provider 接口"""
    
    def generate_completion(self, messages: List[Dict], options: Dict = None) -> Dict:
        raise NotImplementedError
    
    def is_available(self) -> bool:
        raise NotImplementedError


class SparkProvider(AIProvider):
    """讯飞星火 AI Provider"""
    
    def __init__(self):
        self.api_key = SPARK_API_KEY
        self.base_url = SPARK_BASE_URL
        self.model = SPARK_MODEL
    
    def is_available(self) -> bool:
        return bool(self.api_key)
    
    def generate_completion(self, messages: List[Dict], options: Dict = None) -> Dict:
        """生成回复"""
        if not self.is_available():
            raise Exception("讯飞星火 API key 未配置")
        
        options = options or {}
        
        url = f"{self.base_url}/chat/completions"
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.api_key}',
        }
        
        body = {
            "model": options.get('model', self.model),
            "messages": messages,
            "temperature": options.get('temperature', 0.7),
            "max_tokens": options.get('max_tokens', 4096),
        }
        
        if options.get('response_format') == 'json':
            body["response_format"] = {"type": "json_object"}
        
        response = fetch(url, method='POST', headers=headers, body=json.dumps(body))
        
        if not response.ok:
            raise Exception(f"讯飞星火 API 错误: {response.text}")
        
        data = response.json()
        content = data.get('choices', [{}])[0].get('message', {}).get('content', '')
        
        return {"content": content}


class GeminiProvider(AIProvider):
    """Google Gemini AI Provider"""
    
    def __init__(self):
        self.api_key = GEMINI_API_KEY
    
    def is_available(self) -> bool:
        return bool(self.api_key)
    
    def generate_completion(self, messages: List[Dict], options: Dict = None) -> Dict:
        """生成回复"""
        if not self.is_available():
            raise Exception("Gemini API key 未配置")
        
        from google import genai
        client = genai.Client(api_key=self.api_key)
        
        options = options or {}
        
        contents = []
        for msg in messages:
            if msg['role'] == 'system':
                continue
            contents.append({
                'role': msg['role'],
                'parts': [{'text': msg['content']}]
            })
        
        config = {
            'temperature': options.get('temperature', 0.7),
            'max_output_tokens': options.get('max_tokens', 4096),
        }
        
        if options.get('response_format') == 'json':
            config['response_mime_type'] = 'application/json'
        
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=contents,
            config=config
        )
        
        return {"content": response.text}


def fetch(url: str, method: str = 'GET', headers: Dict = None, body: str = None):
    """简单的 fetch 封装"""
    import urllib.request
    import urllib.error
    
    req = urllib.request.Request(url, method=method)
    if headers:
        for k, v in headers.items():
            req.add_header(k, v)
    if body:
        req.add_header('Content-Length', str(len(body)))
        req.data = body.encode('utf-8')
    
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            class Response:
                def __init__(self, resp):
                    self.status = resp.status
                    self.text = resp.read().decode('utf-8')
                    self.ok = 200 <= resp.status < 300
                def json(self):
                    return json.loads(self.text)
            return Response(resp)
    except urllib.error.HTTPError as e:
        class ErrorResponse:
            def __init__(self, e):
                self.status = e.code
                self.text = e.read().decode('utf-8')
                self.ok = False
            def json(self):
                return json.loads(self.text)
        return ErrorResponse(e)


def get_provider() -> AIProvider:
    """获取可用的 AI Provider"""
    # 优先使用讯飞星火
    spark = SparkProvider()
    if spark.is_available():
        return spark
    
    # 其次使用 Gemini
    gemini = GeminiProvider()
    if gemini.is_available():
        return gemini
    
    raise Exception("没有可用的 AI Provider")
