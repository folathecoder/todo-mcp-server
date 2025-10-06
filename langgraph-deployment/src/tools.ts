import { tool } from "@langchain/core/tools";
import { z } from "zod";
import todoService from "../../src/services/todoService.js";

/**
 * Tool: Create a new todo item
 */
export const createTodoTool = tool(
  async ({ title, priority, dueDate, assignee }) => {
    const todo = await todoService.createTodo({
      title,
      priority,
      dueDate,
      assignee,
    });
    return JSON.stringify(todo, null, 2);
  },
  {
    name: "create_todo",
    description:
      "Create a new todo item with optional priority (low, medium, high, urgent), due date (ISO 8601 format), and assignee",
    schema: z.object({
      title: z.string().describe("The title of the todo item"),
      priority: z
        .enum(["low", "medium", "high", "urgent"])
        .optional()
        .describe("Priority level of the todo (default: medium)"),
      dueDate: z
        .string()
        .optional()
        .describe("Due date in ISO 8601 format (e.g., 2025-10-15T10:00:00Z)"),
      assignee: z.string().optional().describe("Person assigned to this todo"),
    }),
  }
);

/**
 * Tool: Get all todos
 */
export const getTodosTool = tool(
  async () => {
    const todos = await todoService.getAllTodos();
    return JSON.stringify(todos, null, 2);
  },
  {
    name: "get_todos",
    description: "Get all todo items from the database",
    schema: z.object({}),
  }
);

/**
 * Tool: Get a single todo by ID
 */
export const getTodoTool = tool(
  async ({ id }) => {
    const todo = await todoService.getTodoById(id);
    if (!todo) {
      return JSON.stringify({ error: "Todo not found" });
    }
    return JSON.stringify(todo, null, 2);
  },
  {
    name: "get_todo",
    description: "Get a single todo item by its ID",
    schema: z.object({
      id: z.string().describe("The ID of the todo item"),
    }),
  }
);

/**
 * Tool: Update a todo
 */
export const updateTodoTool = tool(
  async ({ id, title, completed, priority, dueDate, assignee }) => {
    const todo = await todoService.updateTodo(id, {
      title,
      completed,
      priority,
      dueDate,
      assignee,
    });
    if (!todo) {
      return JSON.stringify({ error: "Todo not found" });
    }
    return JSON.stringify(todo, null, 2);
  },
  {
    name: "update_todo",
    description: "Update a todo item with any combination of fields",
    schema: z.object({
      id: z.string().describe("The ID of the todo item"),
      title: z.string().optional().describe("The new title of the todo item"),
      completed: z
        .boolean()
        .optional()
        .describe("The completion status of the todo item"),
      priority: z
        .enum(["low", "medium", "high", "urgent"])
        .optional()
        .describe("Priority level of the todo"),
      dueDate: z
        .string()
        .optional()
        .describe("Due date in ISO 8601 format"),
      assignee: z
        .string()
        .optional()
        .describe("Person assigned to this todo"),
    }),
  }
);

/**
 * Tool: Delete a todo
 */
export const deleteTodoTool = tool(
  async ({ id }) => {
    const todo = await todoService.deleteTodo(id);
    if (!todo) {
      return JSON.stringify({ error: "Todo not found" });
    }
    return JSON.stringify(
      { message: "Todo deleted successfully", todo },
      null,
      2
    );
  },
  {
    name: "delete_todo",
    description: "Delete a todo item by its ID",
    schema: z.object({
      id: z.string().describe("The ID of the todo item"),
    }),
  }
);

/**
 * Tool: Get current date and time
 */
export const getCurrentDateTimeTool = tool(
  async () => {
    const datetimeInfo = todoService.getCurrentDateTime();
    return JSON.stringify(datetimeInfo, null, 2);
  },
  {
    name: "get_current_datetime",
    description:
      "Get the current date and time in ISO 8601 format, timestamp, timezone, and formatted string",
    schema: z.object({}),
  }
);
