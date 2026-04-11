"""Pydantic schemas for the Task API."""

import re
from datetime import datetime
from typing import (
    List,
    Optional,
)

from pydantic import (
    BaseModel,
    Field,
    field_validator,
)

# Characters that are not allowed in user-supplied text fields
_DISALLOWED_PATTERN = re.compile(r"[<>{}()\[\]\\]")


def _sanitize_text(v: str) -> str:
    """Sanitise a text field by stripping dangerous characters."""
    v = v.strip()
    if "\0" in v:
        raise ValueError("Text contains null bytes")
    # Remove any characters commonly used in HTML/script injection
    v = _DISALLOWED_PATTERN.sub("", v)
    return v


class TaskCreate(BaseModel):
    """Request model for creating a new task.

    Attributes:
        title: Task title (1–200 characters)
        description: Optional extended description
        priority: Priority level (high, medium, low)
        category: Optional category label
        due_date: Optional ISO-format date string
    """

    title: str = Field(..., description="Task title", min_length=1, max_length=200)
    description: str = Field(default="", description="Task description", max_length=2000)
    priority: str = Field(default="medium", description="Priority: high, medium, or low")
    category: str = Field(default="", description="Task category", max_length=30)
    due_date: str = Field(default="", description="Due date in ISO format")

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        """Strip and validate the title."""
        v = _sanitize_text(v)
        if not v:
            raise ValueError("Title must not be empty")
        return v

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v: str) -> str:
        """Ensure priority is one of the allowed values."""
        allowed = {"high", "medium", "low"}
        if v.lower() not in allowed:
            raise ValueError(f"Priority must be one of: {', '.join(allowed)}")
        return v.lower()


class TaskUpdate(BaseModel):
    """Request model for updating a task.

    All fields are optional – only supplied fields are updated.
    """

    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)
    completed: Optional[bool] = None
    priority: Optional[str] = None
    category: Optional[str] = Field(default=None, max_length=30)
    due_date: Optional[str] = None

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: Optional[str]) -> Optional[str]:
        """Validate and sanitise the title when provided."""
        if v is not None:
            v = _sanitize_text(v)
            if not v:
                raise ValueError("Title must not be empty")
        return v

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v: Optional[str]) -> Optional[str]:
        """Ensure priority is one of the allowed values when provided."""
        if v is not None:
            allowed = {"high", "medium", "low"}
            if v.lower() not in allowed:
                raise ValueError(f"Priority must be one of: {', '.join(allowed)}")
            return v.lower()
        return v


class TaskRead(BaseModel):
    """Response model for a single task."""

    id: int
    user_id: int
    title: str
    description: str
    completed: bool
    priority: str
    category: str
    due_date: str
    ai_priority_score: Optional[float] = None
    ai_suggested_due_date: Optional[str] = None
    ai_summary: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class TaskListResponse(BaseModel):
    """Response model for listing tasks."""

    tasks: List[TaskRead]
    total: int


class AISuggestion(BaseModel):
    """Response model for AI suggestions on a task."""

    task_id: int
    priority_suggestion: Optional[str] = None
    priority_score: Optional[float] = None
    suggested_due_date: Optional[str] = None
    breakdown: Optional[List[str]] = None
    recommendations: Optional[List[str]] = None


class TaskSearchRequest(BaseModel):
    """Request model for semantic task search."""

    query: str = Field(..., description="Natural-language search query", min_length=1, max_length=500)

    @field_validator("query")
    @classmethod
    def validate_query(cls, v: str) -> str:
        """Strip and validate the search query."""
        v = v.strip()
        if not v:
            raise ValueError("Search query must not be empty")
        if "\0" in v:
            raise ValueError("Query contains null bytes")
        return v


class TaskSearchResponse(BaseModel):
    """Response model for semantic task search."""

    results: List[TaskRead]
    query: str
