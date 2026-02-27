from .vectorstore import knowledge_base, VectorStore


class KnowledgeRetriever:
    def __init__(self, vectorstore: VectorStore = None):
        self.vectorstore = vectorstore or knowledge_base
    
    def retrieve_for_course(self, topic: str, course_title: str = "") -> str:
        if not self.vectorstore.documents or len(self.vectorstore.documents) == 0:
            return ""
        
        query = f"{course_title} {topic}" if course_title else topic
        
        try:
            results = self.vectorstore.similarity_search(query, top_k=3)
            if not results:
                return ""
            return "\n\n".join([r["content"] for r in results])
        except Exception:
            return ""
    
    def retrieve_for_level(self, level_title: str, chapter_title: str = "", course_title: str = "") -> str:
        if not self.vectorstore.documents or len(self.vectorstore.documents) == 0:
            return ""
        
        query = f"{course_title} {chapter_title} {level_title}"
        
        try:
            results = self.vectorstore.similarity_search(query, top_k=3)
            if not results:
                return ""
            return "\n\n".join([r["content"] for r in results])
        except Exception:
            return ""


retriever = KnowledgeRetriever()
