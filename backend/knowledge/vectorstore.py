import numpy as np
from typing import List, Dict, Optional
import json
import re


class VectorStore:
    """简单向量知识库（基于TF-IDF + 余弦相似度）"""
    
    def __init__(self):
        self.documents: List[str] = []
        self.embeddings: Optional[np.ndarray] = None
        self.metadatas: List[Dict] = []
        self.vocab: List[str] = []
        self.vocab_index: Dict[str, int] = {}
        self.doc_id_counter = 0
    
    def _tokenize(self, text: str) -> List[str]:
        """简单分词"""
        tokens = re.findall(r'[\w]+', text.lower())
        return tokens
    
    def _build_vocab(self, texts: List[str]):
        """构建词汇表"""
        all_tokens = []
        for text in texts:
            all_tokens.extend(self._tokenize(text))
        
        self.vocab = list(set(all_tokens))
        self.vocab_index = {word: i for i, word in enumerate(self.vocab)}
    
    def _compute_tfidf(self, texts: List[str]) -> np.ndarray:
        from collections import Counter
        
        if not texts:
            return np.array([])
        
        if not self.vocab:
            self._build_vocab(texts)
        
        if len(self.vocab) == 0:
            return np.zeros((len(texts), 1))
        
        tfidf_matrix = np.zeros((len(texts), len(self.vocab)))
        
        for i, text in enumerate(texts):
            tokens = self._tokenize(text)
            if not tokens:
                continue
            token_counts = Counter(tokens)
            total_tokens = len(tokens)
            
            for token, count in token_counts.items():
                if token in self.vocab_index:
                    tf = count / total_tokens
                    idf = np.log(len(texts) / (1 + sum(1 for t in texts if token in t)))
                    tfidf_matrix[i, self.vocab_index[token]] = tf * idf
        
        # 归一化
        norms = np.linalg.norm(tfidf_matrix, axis=1, keepdims=True)
        norms[norms == 0] = 1
        tfidf_matrix = tfidf_matrix / norms
        
        return tfidf_matrix
    
    def add_documents(self, texts: List[str], metadatas: Optional[List[Dict]] = None):
        """添加文档到知识库"""
        if metadatas is None:
            metadatas = [{}] * len(texts)
        
        # 添加新文档到列表
        self.documents.extend(texts)
        self.metadatas.extend(metadatas)
        
        # 重建词汇表（包含所有文档）
        self._build_vocab(self.documents)
        
        # 重新计算所有文档的TF-IDF
        self.embeddings = self._compute_tfidf(self.documents)
        
        # 返回添加的文档ID
        start_id = self.doc_id_counter
        self.doc_id_counter += len(texts)
        return list(range(start_id, self.doc_id_counter))
    
    def similarity_search(self, query: str, top_k: int = 5) -> List[Dict]:
        if not self.documents or self.embeddings is None or len(self.embeddings) == 0:
            return []

        if not self.vocab:
            return []
        
        # 计算查询向量（使用全局词汇表）
        from collections import Counter
        query_vector = np.zeros(len(self.vocab))
        
        tokens = self._tokenize(query)
        if tokens:
            token_counts = Counter(tokens)
            total_tokens = len(tokens)
            
            for token, count in token_counts.items():
                if token in self.vocab_index:
                    tf = count / total_tokens
                    idf = np.log(len(self.documents) / (1 + sum(1 for t in self.documents if token in t)))
                    query_vector[self.vocab_index[token]] = tf * idf
        
        # 归一化
        query_norm = np.linalg.norm(query_vector)
        if query_norm > 0:
            query_vector = query_vector / query_norm
        
        # 计算余弦相似度
        similarities = np.dot(self.embeddings, query_vector)
        
        # 获取top_k
        top_indices = np.argsort(similarities)[-top_k:][::-1]
        
        results = []
        for idx in top_indices:
            if similarities[idx] > 0.01:  # 过滤低相似度
                results.append({
                    "index": int(idx),
                    "content": self.documents[idx],
                    "metadata": self.metadatas[idx],
                    "score": float(similarities[idx])
                })
        
        return results
    
    def delete_document(self, doc_index: int):
        """删除文档"""
        if 0 <= doc_index < len(self.documents):
            del self.documents[doc_index]
            del self.metadatas[doc_index]
            
            # 重新计算嵌入
            if self.documents:
                self._build_vocab(self.documents)
                self.embeddings = self._compute_tfidf(self.documents)
            else:
                self.embeddings = None
                self.vocab = []
                self.vocab_index = {}
    
    def get_all_documents(self) -> List[Dict]:
        """获取所有文档"""
        return [
            {"content": doc, "metadata": meta}
            for doc, meta in zip(self.documents, self.metadatas)
        ]
    
    def clear(self):
        """清空知识库"""
        self.documents = []
        self.embeddings = None
        self.metadatas = []
        self.vocab = []
        self.vocab_index = {}


# 全局知识库实例
knowledge_base = VectorStore()
