"""Database service for Task CRUD operations."""

from typing import (
    List,
    Optional,
)

from sqlmodel import (
    Session,
    select,
)

from app.core.logging import logger
from app.models.task import Task
from app.services.database import database_service


class TaskService:
    """Service class for task-related database operations.

    Uses the shared database engine from DatabaseService.
    """

    def __init__(self):
        """Initialize TaskService with the shared database engine."""
        self.engine = database_service.engine

    async def create_task(
        self,
        user_id: int,
        title: str,
        description: str = "",
        priority: str = "medium",
        category: str = "",
        due_date: str = "",
    ) -> Task:
        """Create a new task for a user.

        Args:
            user_id: Owner's user ID
            title: Task title
            description: Optional description
            priority: Priority level
            category: Optional category
            due_date: Optional due date

        Returns:
            Task: The created task
        """
        with Session(self.engine) as session:
            task = Task(
                user_id=user_id,
                title=title,
                description=description,
                priority=priority,
                category=category,
                due_date=due_date,
            )
            session.add(task)
            session.commit()
            session.refresh(task)
            logger.info("task_created", task_id=task.id, user_id=user_id)
            return task

    async def get_task(self, task_id: int, user_id: int) -> Optional[Task]:
        """Get a single task by ID scoped to user.

        Args:
            task_id: The task ID
            user_id: The owner's user ID

        Returns:
            Optional[Task]: The task if found, None otherwise
        """
        with Session(self.engine) as session:
            statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
            return session.exec(statement).first()

    async def list_tasks(
        self,
        user_id: int,
        completed: Optional[bool] = None,
        priority: Optional[str] = None,
        category: Optional[str] = None,
    ) -> List[Task]:
        """List tasks for a user with optional filters.

        Args:
            user_id: The owner's user ID
            completed: Optional filter by completion status
            priority: Optional filter by priority
            category: Optional filter by category

        Returns:
            List[Task]: Matching tasks
        """
        with Session(self.engine) as session:
            statement = select(Task).where(Task.user_id == user_id)
            if completed is not None:
                statement = statement.where(Task.completed == completed)
            if priority is not None:
                statement = statement.where(Task.priority == priority)
            if category is not None:
                statement = statement.where(Task.category == category)
            statement = statement.order_by(Task.created_at.desc())
            return list(session.exec(statement).all())

    async def update_task(self, task_id: int, user_id: int, **kwargs) -> Optional[Task]:
        """Update a task's fields.

        Args:
            task_id: The task ID
            user_id: The owner's user ID
            **kwargs: Fields to update

        Returns:
            Optional[Task]: The updated task, or None if not found
        """
        with Session(self.engine) as session:
            statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
            task = session.exec(statement).first()
            if not task:
                return None
            for key, value in kwargs.items():
                if value is not None and hasattr(task, key):
                    setattr(task, key, value)
            session.add(task)
            session.commit()
            session.refresh(task)
            logger.info("task_updated", task_id=task_id, user_id=user_id, fields=list(kwargs.keys()))
            return task

    async def delete_task(self, task_id: int, user_id: int) -> bool:
        """Delete a task.

        Args:
            task_id: The task ID
            user_id: The owner's user ID

        Returns:
            bool: True if deleted, False if not found
        """
        with Session(self.engine) as session:
            statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
            task = session.exec(statement).first()
            if not task:
                return False
            session.delete(task)
            session.commit()
            logger.info("task_deleted", task_id=task_id, user_id=user_id)
            return True

    async def search_tasks(self, user_id: int, query: str) -> List[Task]:
        """Text search across task titles and descriptions.

        This performs a basic ILIKE search. When the RAG engine is
        available it will be augmented with semantic vector search.

        Args:
            user_id: The owner's user ID
            query: Search text

        Returns:
            List[Task]: Matching tasks
        """
        with Session(self.engine) as session:
            pattern = f"%{query}%"
            statement = (
                select(Task)
                .where(
                    Task.user_id == user_id,
                    (Task.title.ilike(pattern)) | (Task.description.ilike(pattern)),
                )
                .order_by(Task.created_at.desc())
            )
            return list(session.exec(statement).all())


# Singleton
task_service = TaskService()
