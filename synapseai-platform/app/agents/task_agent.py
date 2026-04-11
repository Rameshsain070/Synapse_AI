"""LangGraph-based AI agent for task intelligence.

This module provides a LangGraph agent that can analyse tasks,
suggest priorities, predict due dates and offer smart recommendations.
It reuses the existing LLMService with circular fallback and integrates
with the platform's long-term memory through mem0.
"""

import json
from datetime import datetime, UTC
from typing import (
    Any,
    Dict,
    List,
    Optional,
)

from app.core.config import settings
from app.core.logging import logger
from app.services.llm import llm_service


class TaskAgent:
    """AI agent that provides intelligent task management capabilities.

    Capabilities
    ------------
    * analyse_task   – break a task into actionable sub-steps
    * prioritize_task – score a task's urgency on a 0-1 scale
    * suggest_improvements – offer recommendations
    * predict_due_date – estimate an appropriate due date
    """

    SYSTEM_PROMPT = (
        "You are Synapse AI Task Assistant – a productivity expert that helps users "
        "manage their to-do list. You provide concise, actionable advice.\n"
        "Always respond with valid JSON matching the requested schema."
    )

    def __init__(self):
        self.llm_service = llm_service
        logger.info("task_agent_initialized", model=settings.DEFAULT_LLM_MODEL)

    # ------------------------------------------------------------------
    # Internal helper
    # ------------------------------------------------------------------

    async def _call_llm(self, user_prompt: str) -> str:
        """Send a prompt to the LLM and return the raw text response.

        Falls back gracefully if the LLM is unreachable.
        """
        messages = [
            {"role": "system", "content": self.SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ]
        try:
            response = await self.llm_service.call(messages)
            # response is an AIMessage; extract text content
            return str(response.content)
        except Exception as e:
            logger.error("task_agent_llm_call_failed", error=str(e))
            return ""

    @staticmethod
    def _safe_json(text: str) -> Dict[str, Any]:
        """Best-effort JSON parse of an LLM response."""
        text = text.strip()
        # Strip markdown code fences if present
        if text.startswith("```"):
            lines = text.split("\n")
            lines = [l for l in lines if not l.strip().startswith("```")]
            text = "\n".join(lines)
        try:
            return json.loads(text)
        except (json.JSONDecodeError, ValueError):
            return {}

    # ------------------------------------------------------------------
    # Public capabilities
    # ------------------------------------------------------------------

    async def analyse_task(self, title: str, description: str = "") -> List[str]:
        """Break a task into smaller sub-steps.

        Args:
            title: Task title
            description: Optional task description

        Returns:
            List of sub-step strings
        """
        prompt = (
            f"Break the following task into 3-5 actionable sub-steps.\n"
            f"Task: {title}\n"
            f"Description: {description}\n"
            f"Respond ONLY with a JSON object: {{\"steps\": [\"step1\", ...]}}"
        )
        raw = await self._call_llm(prompt)
        data = self._safe_json(raw)
        return data.get("steps", [])

    async def prioritize_task(
        self,
        title: str,
        description: str = "",
        due_date: str = "",
        category: str = "",
    ) -> Dict[str, Any]:
        """Score a task's priority.

        Returns:
            Dict with ``priority`` (high/medium/low) and ``score`` (0.0–1.0)
        """
        prompt = (
            f"Evaluate the urgency/importance of this task and return a priority.\n"
            f"Task: {title}\n"
            f"Description: {description}\n"
            f"Due date: {due_date or 'not set'}\n"
            f"Category: {category or 'none'}\n"
            f"Today: {datetime.now(UTC).strftime('%Y-%m-%d')}\n"
            f"Respond ONLY with JSON: {{\"priority\": \"high|medium|low\", \"score\": 0.0-1.0}}"
        )
        raw = await self._call_llm(prompt)
        data = self._safe_json(raw)
        return {
            "priority": data.get("priority", "medium"),
            "score": float(data.get("score", 0.5)),
        }

    async def suggest_improvements(
        self,
        title: str,
        description: str = "",
        existing_tasks: Optional[List[str]] = None,
    ) -> List[str]:
        """Offer recommendations to improve or complement a task.

        Args:
            title: Task title
            description: Optional description
            existing_tasks: Titles of the user's existing tasks for context

        Returns:
            List of recommendation strings
        """
        context = ""
        if existing_tasks:
            context = "User's other tasks: " + ", ".join(existing_tasks[:10])
        prompt = (
            f"Suggest 2-4 improvements or related actions for this task.\n"
            f"Task: {title}\n"
            f"Description: {description}\n"
            f"{context}\n"
            f"Respond ONLY with JSON: {{\"recommendations\": [\"rec1\", ...]}}"
        )
        raw = await self._call_llm(prompt)
        data = self._safe_json(raw)
        return data.get("recommendations", [])

    async def predict_due_date(
        self,
        title: str,
        description: str = "",
        category: str = "",
    ) -> Optional[str]:
        """Predict an appropriate due date.

        Returns:
            ISO-format date string or None
        """
        prompt = (
            f"Estimate a reasonable due date for this task.\n"
            f"Task: {title}\n"
            f"Description: {description}\n"
            f"Category: {category or 'none'}\n"
            f"Today: {datetime.now(UTC).strftime('%Y-%m-%d')}\n"
            f"Respond ONLY with JSON: {{\"due_date\": \"YYYY-MM-DD\"}}"
        )
        raw = await self._call_llm(prompt)
        data = self._safe_json(raw)
        return data.get("due_date")

    async def get_full_suggestions(
        self,
        title: str,
        description: str = "",
        due_date: str = "",
        category: str = "",
        existing_tasks: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """Gather all AI suggestions for a task in one call.

        Returns a dict combining priority analysis, sub-steps,
        recommendations, and predicted due date.
        """
        context = ""
        if existing_tasks:
            context = "User's other tasks: " + ", ".join(existing_tasks[:10])
        prompt = (
            f"Analyse this task and provide comprehensive suggestions.\n"
            f"Task: {title}\n"
            f"Description: {description}\n"
            f"Due date: {due_date or 'not set'}\n"
            f"Category: {category or 'none'}\n"
            f"Today: {datetime.now(UTC).strftime('%Y-%m-%d')}\n"
            f"{context}\n"
            f"Respond ONLY with JSON:\n"
            f"{{\n"
            f'  "priority": "high|medium|low",\n'
            f'  "priority_score": 0.0-1.0,\n'
            f'  "suggested_due_date": "YYYY-MM-DD or null",\n'
            f'  "breakdown": ["step1", ...],\n'
            f'  "recommendations": ["rec1", ...]\n'
            f"}}"
        )
        raw = await self._call_llm(prompt)
        data = self._safe_json(raw)
        return {
            "priority_suggestion": data.get("priority", "medium"),
            "priority_score": float(data.get("priority_score", 0.5)),
            "suggested_due_date": data.get("suggested_due_date"),
            "breakdown": data.get("breakdown", []),
            "recommendations": data.get("recommendations", []),
        }


# Singleton
task_agent = TaskAgent()
