"""Task memory manager for learning user preferences and patterns.

Uses the platform's mem0 long-term memory to store task-completion
patterns, category preferences, and timing habits so that the AI
agent can make increasingly personalised suggestions over time.
"""

from typing import (
    Any,
    Dict,
    List,
    Optional,
)

from app.core.config import settings
from app.core.logging import logger


class TaskMemoryManager:
    """Manages long-term task memory for preference learning.

    Stores user patterns such as:
    * Frequently used categories
    * Average task-completion times
    * Preferred priority distributions
    """

    COLLECTION = "task_user_memory"

    def __init__(self):
        self._memory = None
        logger.info("task_memory_manager_initialized")

    async def _get_memory(self):
        """Lazy-initialise the underlying vector memory."""
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
            logger.info("task_memory_initialized", collection=self.COLLECTION)
        except Exception as e:
            logger.error("task_memory_init_failed", error=str(e))
            self._memory = None
        return self._memory

    async def record_task_event(
        self,
        user_id: int,
        event: str,
        details: str,
    ) -> None:
        """Record a task-related event for preference learning.

        Args:
            user_id: Owner's user ID
            event: Event type, e.g. 'completed', 'created', 'prioritized'
            details: Human-readable summary of the event
        """
        memory = await self._get_memory()
        if memory is None:
            return
        text = f"[{event}] {details}"
        try:
            await memory.add(
                [{"role": "user", "content": text}],
                user_id=str(user_id),
                metadata={"event": event},
            )
            logger.info("task_event_recorded", user_id=user_id, event=event)
        except Exception as e:
            logger.error("task_event_record_failed", error=str(e), user_id=user_id)

    async def get_user_context(self, user_id: int, query: str = "task preferences") -> str:
        """Retrieve contextual information about the user's task habits.

        Args:
            user_id: Owner's user ID
            query: Context query string

        Returns:
            Formatted string of relevant memories
        """
        memory = await self._get_memory()
        if memory is None:
            return ""
        try:
            results = await memory.search(user_id=str(user_id), query=query)
            items = results.get("results", [])
            if not items:
                return ""
            return "\n".join(f"* {item['memory']}" for item in items)
        except Exception as e:
            logger.error("task_memory_search_failed", error=str(e), user_id=user_id)
            return ""


# Singleton
task_memory_manager = TaskMemoryManager()
