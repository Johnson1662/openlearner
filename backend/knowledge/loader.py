from typing import Union
import requests
from bs4 import BeautifulSoup


class DocumentLoader:
    """统一文档加载器"""
    
    def load(self, source: Union[str, bytes], file_type: str = "text") -> str:
        """
        加载文档内容
        """
        if file_type == "pdf":
            return self._load_pdf(source)
        elif file_type == "md" or file_type == "markdown":
            return self._load_markdown(source)
        elif file_type == "docx":
            return self._load_docx(source)
        elif file_type == "url":
            return self._load_url(source)
        else:
            return self._load_text(source)
    
    def _load_pdf(self, source: Union[str, bytes]) -> str:
        """使用 pypdf 解析 PDF"""
        try:
            from pypdf import PdfReader
            from io import BytesIO
            
            if isinstance(source, bytes):
                source = BytesIO(source)
            
            reader = PdfReader(source)
            text_parts = []
            for page in reader.pages:
                text_parts.append(page.extract_text())
            return "\n\n".join(text_parts)
        except Exception as e:
            return f"[PDF解析失败: {str(e)}]"
    
    def _load_docx(self, source: Union[str, bytes]) -> str:
        """使用 python-docx 解析 Word 文档"""
        try:
            from docx import Document
            from io import BytesIO
            
            if isinstance(source, bytes):
                source = BytesIO(source)
            
            doc = Document(source)
            text_parts = []
            for para in doc.paragraphs:
                if para.text.strip():
                    text_parts.append(para.text)
            return "\n\n".join(text_parts)
        except Exception as e:
            return f"[DOCX解析失败: {str(e)}]"
    
    def _load_markdown(self, source: Union[str, bytes]) -> str:
        """直接读取 Markdown 文件"""
        try:
            import markdown
            if isinstance(source, bytes):
                source = source.decode('utf-8')
            return source
        except Exception as e:
            return f"[Markdown解析失败: {str(e)}]"
    
    def _load_url(self, url: str) -> str:
        """使用 requests + BeautifulSoup 抓取网页内容"""
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'lxml')
            
            # 移除脚本和样式
            for tag in soup(['script', 'style', 'nav', 'footer', 'header']):
                tag.decompose()
            
            # 获取主要内容
            main_content = soup.find('main') or soup.find('article') or soup.find('body')
            
            if main_content:
                # 提取文本，保留段落结构
                texts = []
                for p in main_content.find_all(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li']):
                    text = p.get_text(strip=True)
                    if text and len(text) > 10:
                        texts.append(text)
                return "\n\n".join(texts)
            
            return soup.get_text(strip=True)
        except Exception as e:
            return f"[URL抓取失败: {str(e)}]"
    
    def _load_text(self, source: Union[str, bytes]) -> str:
        """直接读取文本"""
        if isinstance(source, bytes):
            return source.decode('utf-8')
        return source
