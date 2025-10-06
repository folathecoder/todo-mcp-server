/**
 * Example: Remote MCP Client for Todo Server
 *
 * This example demonstrates how to call the Todo MCP Server
 * deployed on LangGraph Cloud from any Node.js application.
 *
 * Use case: Your quiz app can use this to create study-related todos
 */

import { MCPClient } from "@langchain/mcp";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("🌐 Connecting to Remote Todo MCP Server...\n");

  // Initialize MCP client with your LangGraph Cloud endpoint
  const todoServer = new MCPClient({
    url: process.env.TODO_MCP_ENDPOINT || "https://api.langgraph.cloud/api/v1/projects/<project-id>/graphs/todo_agent/mcp",
    headers: {
      Authorization: `Bearer ${process.env.LANGGRAPH_API_KEY || "your-api-key-here"}`,
    },
  });

  try {
    // 1. List available tools
    console.log("📋 Available Tools:");
    const tools = await todoServer.listTools();
    console.log(tools.map((t: any) => `  - ${t.name}: ${t.description}`).join("\n"));
    console.log();

    // 2. Get current datetime (useful for scheduling)
    console.log("🕐 Getting current datetime...");
    const datetime = await todoServer.callTool("get_current_datetime", {});
    console.log("Current time:", JSON.parse(datetime).datetime);
    console.log();

    // 3. Create a new todo
    console.log("✅ Creating a new todo...");
    const newTodo = await todoServer.callTool("create_todo", {
      title: "Study for upcoming quiz",
      priority: "high",
      dueDate: "2025-10-15T18:00:00Z",
      assignee: "Student",
    });
    console.log("Todo created:", JSON.parse(newTodo).title);
    console.log();

    // 4. Get all todos
    console.log("📚 Fetching all todos...");
    const allTodos = await todoServer.callTool("get_todos", {});
    const todos = JSON.parse(allTodos);
    console.log(`Found ${todos.length} todos:`);
    todos.slice(0, 3).forEach((todo: any) => {
      console.log(`  - [${todo.priority}] ${todo.title} ${todo.completed ? "✅" : "⏳"}`);
    });
    console.log();

    // 5. Update a todo (mark as completed)
    if (todos.length > 0) {
      const firstTodoId = todos[0]._id;
      console.log("🔄 Marking first todo as completed...");
      await todoServer.callTool("update_todo", {
        id: firstTodoId,
        completed: true,
      });
      console.log("Todo updated successfully!");
      console.log();
    }

    console.log("✅ All operations completed successfully!");
    console.log("\n💡 Integration Ideas:");
    console.log("   - Create todos when quiz is scheduled");
    console.log("   - Mark todos complete when quiz is finished");
    console.log("   - Assign study tasks to students");
    console.log("   - Track deadlines with due dates");

  } catch (error) {
    console.error("❌ Error:", error);
  }
}

main();
