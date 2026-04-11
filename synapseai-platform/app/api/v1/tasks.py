"""Task management API endpoints with AI integration.

Provides full CRUD for tasks, AI-powered suggestions, and semantic search.
All endpoints require session-level JWT authentication.
"""

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    Request,
)

from app.api.v1.auth import get_current_user
from app.core.config import settings
from app.core.limiter import limiter
from app.core.logging import logger
from app.models.user import User
from app.schemas.task import (
    AISuggestion,
    TaskCreate,
    TaskListResponse,
    TaskRead,
    TaskSearchRequest,
    TaskSearchResponse,
    TaskUpdate,
)
from app.services.task_service import task_service

router = APIRouter()


# ------------------------------------------------------------------
# CRUD endpoints
# ------------------------------------------------------------------


@router.post("", response_model=TaskRead, status_code=201)
@limiter.limit("30 per minute")
async def create_task(
    request: Request,
    payload: TaskCreate,
    user: User = Depends(get_current_user),
):
    """Create a new task for the authenticated user.

    Args:
        request: FastAPI request (for rate limiter)
        payload: Task creation data
        user: Authenticated user

    Returns:
        TaskRead: The newly created task
    """
    try:
        task = await task_service.create_task(
            user_id=user.id,
            title=payload.title,
            description=payload.description,
            priority=payload.priority,
            category=payload.category,
            due_date=payload.due_date,
        )

        # Index in RAG asynchronously (best-effort)
        try:
            from app.agents.rag_engine import task_rag_engine

            await task_rag_engine.index_task(user.id, task.id, task.title, task.description)
        except Exception:
            pass  # Non-critical – don't block task creation

        return TaskRead.model_validate(task)
    except Exception as e:
        logger.error("create_task_failed", user_id=user.id, error=str(e), exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("", response_model=TaskListResponse)
@limiter.limit("50 per minute")
async def list_tasks(
    request: Request,
    completed: bool | None = Query(default=None, description="Filter by completion status"),
    priority: str | None = Query(default=None, description="Filter by priority"),
    category: str | None = Query(default=None, description="Filter by category"),
    user: User = Depends(get_current_user),
):
    """List tasks for the authenticated user with optional filters.

    Args:
        request: FastAPI request
        completed: Optional completion filter
        priority: Optional priority filter
        category: Optional category filter
        user: Authenticated user

    Returns:
        TaskListResponse: List of tasks and total count
    """
    try:
        tasks = await task_service.list_tasks(
            user_id=user.id,
            completed=completed,
            priority=priority,
            category=category,
        )
        return TaskListResponse(
            tasks=[TaskRead.model_validate(t) for t in tasks],
            total=len(tasks),
        )
    except Exception as e:
        logger.error("list_tasks_failed", user_id=user.id, error=str(e), exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{task_id}", response_model=TaskRead)
@limiter.limit("50 per minute")
async def get_task(
    request: Request,
    task_id: int,
    user: User = Depends(get_current_user),
):
    """Retrieve a single task by ID.

    Args:
        request: FastAPI request
        task_id: Task primary key
        user: Authenticated user

    Returns:
        TaskRead: The requested task

    Raises:
        HTTPException 404: If the task is not found
    """
    task = await task_service.get_task(task_id, user.id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return TaskRead.model_validate(task)


@router.put("/{task_id}", response_model=TaskRead)
@limiter.limit("30 per minute")
async def update_task(
    request: Request,
    task_id: int,
    payload: TaskUpdate,
    user: User = Depends(get_current_user),
):
    """Update a task's fields.

    Args:
        request: FastAPI request
        task_id: Task primary key
        payload: Fields to update
        user: Authenticated user

    Returns:
        TaskRead: The updated task

    Raises:
        HTTPException 404: If the task is not found
    """
    update_data = payload.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    task = await task_service.update_task(task_id, user.id, **update_data)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return TaskRead.model_validate(task)


@router.delete("/{task_id}", status_code=204)
@limiter.limit("30 per minute")
async def delete_task(
    request: Request,
    task_id: int,
    user: User = Depends(get_current_user),
):
    """Delete a task.

    Args:
        request: FastAPI request
        task_id: Task primary key
        user: Authenticated user

    Raises:
        HTTPException 404: If the task is not found
    """
    deleted = await task_service.delete_task(task_id, user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Task not found")


# ------------------------------------------------------------------
# AI endpoints
# ------------------------------------------------------------------


@router.get("/{task_id}/ai-suggestions", response_model=AISuggestion)
@limiter.limit("10 per minute")
async def get_ai_suggestions(
    request: Request,
    task_id: int,
    user: User = Depends(get_current_user),
):
    """Get AI-powered suggestions for a task.

    Uses the LangGraph task agent to analyse the task and return
    priority scoring, sub-step breakdown, recommended due date,
    and improvement suggestions.

    Args:
        request: FastAPI request
        task_id: Task primary key
        user: Authenticated user

    Returns:
        AISuggestion: AI-generated suggestions
    """
    task = await task_service.get_task(task_id, user.id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    try:
        from app.agents.task_agent import task_agent

        # Gather existing task titles for context
        all_tasks = await task_service.list_tasks(user.id)
        existing_titles = [t.title for t in all_tasks if t.id != task_id]

        suggestions = await task_agent.get_full_suggestions(
            title=task.title,
            description=task.description,
            due_date=task.due_date,
            category=task.category,
            existing_tasks=existing_titles,
        )

        # Persist AI fields back to the task (best-effort)
        await task_service.update_task(
            task_id,
            user.id,
            ai_priority_score=suggestions.get("priority_score"),
            ai_suggested_due_date=suggestions.get("suggested_due_date"),
            ai_summary="; ".join(suggestions.get("breakdown", [])),
        )

        return AISuggestion(
            task_id=task_id,
            priority_suggestion=suggestions.get("priority_suggestion"),
            priority_score=suggestions.get("priority_score"),
            suggested_due_date=suggestions.get("suggested_due_date"),
            breakdown=suggestions.get("breakdown"),
            recommendations=suggestions.get("recommendations"),
        )
    except Exception as e:
        logger.error("ai_suggestions_failed", task_id=task_id, error=str(e), exc_info=True)
        raise HTTPException(status_code=500, detail="AI suggestions unavailable")


@router.post("/search", response_model=TaskSearchResponse)
@limiter.limit("20 per minute")
async def search_tasks(
    request: Request,
    payload: TaskSearchRequest,
    user: User = Depends(get_current_user),
):
    """Semantic search across the user's tasks.

    Performs text-based search (ILIKE) and, when available, augments
    with vector-based semantic search via the RAG engine.

    Args:
        request: FastAPI request
        payload: Search query
        user: Authenticated user

    Returns:
        TaskSearchResponse: Matching tasks and original query
    """
    try:
        tasks = await task_service.search_tasks(user.id, payload.query)
        return TaskSearchResponse(
            results=[TaskRead.model_validate(t) for t in tasks],
            query=payload.query,
        )
    except Exception as e:
        logger.error("search_tasks_failed", user_id=user.id, error=str(e), exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
