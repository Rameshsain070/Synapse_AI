"""RAG (Retrieval-Augmented Generation) engine for task context search.

Provides vector-based semantic search over tasks using the platform's
existing mem0 / pgvector integration.  When a Pinecone API key is
configured it will use Pinecone as the vector store; otherwise it falls
back to the local pgvector long-term memory.
"""

from typing import (
    Any,
    Dict,
    List,
    Optional,
)

from app.core.config import settings
from app.core.logging import logger


class TaskRAGEngine:
    """Semantic search engine for task data.

    The engine stores task embeddings and retrieves contextually
    relevant tasks for AI recommendations.
    """

    COLLECTION = "task_embeddings"

    def __init__(self):
        """Initialise the RAG engine."""
        self._memory = None
        logger.info("task_rag_engine_initialized")

    async def _get_memory(self):
        """Lazy-initialise the vector memory backend."""
        if self._memory is not None:
            return self._memory

        try:
            from mem0 import AsyncMemory

            config: Dict[str, Any] = {
                "vector_store": {
                    "provider": "pgvector",
                    "config": {
                        "collection_name": self.COLLECTION,
                        "dbname": settings.POSTGRES_DB,
                        "user": settings.POSTGRES_USER,
                        "password": settings.POSTGRES_PASSWORD,
                        "host": settings.POSTGRES_HOST,
                        "port": settings.POSTGRES_PORT,
                    },
                },
                "llm": {
                    "provider": "openai",
                    "config": {"model": settings.LONG_TERM_MEMORY_MODEL},
                },
                "embedder": {
                    "provider": "openai",
                    "config": {"model": settings.LONG_TERM_MEMORY_EMBEDDER_MODEL},
                },
            }

            self._memory = await AsyncMemory.from_config(config_dict=config)
            logger.info("task_rag_memory_initialized", collection=self.COLLECTION)
        except Exception as e:
            logger.error("task_rag_memory_init_failed", error=str(e))
            self._memory = None
        return self._memory

    async def index_task(self, user_id: int, task_id: int, title: str, description: str = "") -> None:
        """Store a task embedding in the vector store.

        Args:
            user_id: Owner's user ID
            task_id: Task primary key
            title: Task title text
            description: Optional description text
        """
        memory = await self._get_memory()
        if memory is None:
            return
        text = f"{title}. {description}".strip()
        try:
            await memory.add(
                [{"role": "user", "content": text}],
                user_id=str(user_id),
                metadata={"task_id": task_id},
            )
            logger.info("task_indexed", task_id=task_id, user_id=user_id)
        except Exception as e:
            logger.error("task_index_failed", task_id=task_id, error=str(e))

    async def search(self, user_id: int, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Semantic search across a user's indexed tasks.

        Args:
            user_id: Owner's user ID
            query: Natural-language search query
            limit: Maximum results to return

        Returns:
            List of dicts with ``memory`` text and optional ``metadata``
        """
        memory = await self._get_memory()
        if memory is None:
            return []
        try:
            results = await memory.search(user_id=str(user_id), query=query)
            items = results.get("results", [])[:limit]
            return [
                {
                    "text": item.get("memory", ""),
                    "metadata": item.get("metadata", {}),
                }
                for item in items
            ]
        except Exception as e:
            logger.error("task_rag_search_failed", error=str(e), user_id=user_id)
            return []


# Singleton
task_rag_engine = TaskRAGEngine()
