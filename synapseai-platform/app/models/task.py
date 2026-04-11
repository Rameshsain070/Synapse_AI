"""Task model for the AI-powered To-Do application."""

from typing import (
    TYPE_CHECKING,
    Optional,
)

from sqlmodel import (
    Field,
    Relationship,
)

from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.user import User


class Task(BaseModel, table=True):
    """Task model for storing to-do items with AI-enriched fields.

    Attributes:
        id: The primary key
        user_id: Foreign key to the task owner
        title: Task title text
        description: Optional detailed description
        completed: Whether the task is done
        priority: Priority level (high, medium, low)
        category: Optional task category
        due_date: Optional due date string (ISO format)
        ai_priority_score: AI-computed priority score (0.0–1.0)
        ai_suggested_due_date: AI-predicted due date
        ai_summary: AI-generated task summary or breakdown
        created_at: Timestamp from BaseModel
        user: Relationship to the task owner
    """

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    title: str = Field(max_length=200)
    description: str = Field(default="")
    completed: bool = Field(default=False)
    priority: str = Field(default="medium")
    category: str = Field(default="")
    due_date: str = Field(default="")
    ai_priority_score: Optional[float] = Field(default=None)
    ai_suggested_due_date: Optional[str] = Field(default=None)
    ai_summary: Optional[str] = Field(default=None)
    user: "User" = Relationship()
