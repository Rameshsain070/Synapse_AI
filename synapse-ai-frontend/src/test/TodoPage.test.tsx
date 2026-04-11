import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TodoPage } from "../pages/TodoPage.tsx";
import { ThemeProvider } from "../context/ThemeContext.tsx";
import { MemoryRouter } from "react-router-dom";

function renderTodoPage() {
  return render(
    <MemoryRouter>
      <ThemeProvider>
        <TodoPage />
      </ThemeProvider>
    </MemoryRouter>,
  );
}

describe("TodoPage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the todo page with header", () => {
    renderTodoPage();
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("SynapseAI Tasks");
  });

  it("loads demo tasks on first render", () => {
    renderTodoPage();
    expect(
      screen.getByText(
        "Welcome to Synapse Todo! Click the checkbox to complete this task",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("This is a completed demo task"),
    ).toBeInTheDocument();
  });

  it("adds a new task", () => {
    renderTodoPage();
    const input = screen.getByPlaceholderText("Add a new task...");
    fireEvent.change(input, { target: { value: "My new test task" } });
    fireEvent.click(screen.getByText("Add"));
    expect(screen.getByText("My new test task")).toBeInTheDocument();
  });

  it("toggles task completion", () => {
    renderTodoPage();
    const checkboxes = screen.getAllByRole("button", {
      name: "Mark as complete",
    });
    const initialIncomplete = screen.getAllByRole("button", {
      name: "Mark as incomplete",
    });
    fireEvent.click(checkboxes[0]);
    expect(
      screen.getAllByRole("button", { name: "Mark as incomplete" }),
    ).toHaveLength(initialIncomplete.length + 1);
  });

  it("filters tasks by status", () => {
    renderTodoPage();
    const allTasks = screen.getAllByRole("button", { name: "Delete task" }).length;
    const filterButtons = screen.getAllByRole("button");
    const activeButton = filterButtons.find((btn) => btn.textContent === "Active" && btn.className.includes("rounded-lg"));
    fireEvent.click(activeButton!);
    const activeTasks = screen.getAllByRole("button", { name: "Delete task" }).length;
    expect(activeTasks).toBeLessThan(allTasks);
    const completedButton = filterButtons.find((btn) => btn.textContent === "Completed" && btn.className.includes("rounded-lg"));
    fireEvent.click(completedButton!);
    expect(
      screen.getByText("This is a completed demo task"),
    ).toBeInTheDocument();
  });

  it("searches tasks", () => {
    renderTodoPage();
    const searchInput = screen.getByPlaceholderText("Search tasks...");
    fireEvent.change(searchInput, { target: { value: "pencil" } });
    expect(
      screen.getByText("Try editing this task by clicking the pencil icon"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        "Welcome to Synapse Todo! Click the checkbox to complete this task",
      ),
    ).not.toBeInTheDocument();
  });

  it("deletes a task", () => {
    renderTodoPage();
    const deleteButtons = screen.getAllByRole("button", {
      name: "Delete task",
    });
    const taskCount = deleteButtons.length;
    fireEvent.click(deleteButtons[0]);
    expect(
      screen.getAllByRole("button", { name: "Delete task" }),
    ).toHaveLength(taskCount - 1);
  });

  it("toggles theme", () => {
    renderTodoPage();
    const themeButton = screen.getByRole("button", { name: "Toggle theme" });
    fireEvent.click(themeButton);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    fireEvent.click(themeButton);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
});
