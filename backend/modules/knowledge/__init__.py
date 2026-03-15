from __future__ import annotations

from dataclasses import dataclass
import io
from typing import Any
from urllib.request import urlopen

from docx import Document
from pypdf import PdfReader


class DocumentLoader:
    @staticmethod
    def _decode_bytes(raw: bytes) -> str:
        for encoding in ("utf-8", "utf-8-sig", "utf-16", "utf-16-le", "utf-16-be", "gb18030", "gbk"):
            try:
                return raw.decode(encoding)
            except UnicodeDecodeError:
                continue
        return raw.decode("utf-8", errors="replace")

    @staticmethod
    def _extract_pdf_text(raw: bytes) -> str:
        reader = PdfReader(io.BytesIO(raw))
        chunks: list[str] = []
        for page in reader.pages:
            text = page.extract_text() or ""
            if text.strip():
                chunks.append(text.strip())
        return "\n\n".join(chunks)

    @staticmethod
    def _extract_docx_text(raw: bytes) -> str:
        doc = Document(io.BytesIO(raw))
        paragraphs = [p.text.strip() for p in doc.paragraphs if p.text and p.text.strip()]
        return "\n".join(paragraphs)

    def load(self, source: Any, file_type: str = "text") -> str:
        if isinstance(source, (bytes, bytearray)):
            raw = bytes(source)
            normalized_type = str(file_type or "").lower()
            if normalized_type == "pdf":
                text = self._extract_pdf_text(raw)
                if text.strip():
                    return text
            if normalized_type == "docx":
                text = self._extract_docx_text(raw)
                if text.strip():
                    return text
            return self._decode_bytes(raw)
        if isinstance(source, str) and file_type == "url" and source.startswith(("http://", "https://")):
            with urlopen(source, timeout=10) as resp:
                return self._decode_bytes(resp.read())
        return str(source)


class InMemoryKnowledgeBase:
    def __init__(self):
        self.docs: list[dict[str, Any]] = []

    def add_documents(self, docs: list[str], metadata: list[dict[str, Any]] | None = None) -> list[str]:
        ids: list[str] = []
        metadata = metadata or [{} for _ in docs]
        for idx, doc in enumerate(docs):
            doc_id = f"doc-{len(self.docs) + 1}"
            self.docs.append({"id": doc_id, "content": doc, "metadata": metadata[idx] if idx < len(metadata) else {}})
            ids.append(doc_id)
        return ids

    def similarity_search(self, query: str, top_k: int = 5):
        query_lower = query.lower()
        ranked = sorted(
            self.docs,
            key=lambda d: (query_lower in str(d["content"]).lower(), len(str(d["content"]))),
            reverse=True,
        )
        return ranked[: max(1, top_k)]


@dataclass
class Retriever:
    kb: InMemoryKnowledgeBase

    def retrieve_for_course(self, topic: str, course_title: str = "") -> str:
        return f"Topic: {topic}; Course: {course_title}"

    def retrieve_for_level(self, level_title: str = "", chapter_title: str = "", course_title: str = "") -> str:
        return f"Level: {level_title}; Chapter: {chapter_title}; Course: {course_title}"


knowledge_base = InMemoryKnowledgeBase()
retriever = Retriever(knowledge_base)

