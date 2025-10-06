import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import {
  createTodoTool,
  getTodosTool,
  getTodoTool,
  updateTodoTool,
  deleteTodoTool,
  getCurrentDateTimeTool,
} from "./tools.js";

/**
 * LangGraph Todo Agent
 *
 * This agent provides AI-powered todo management capabilities
 * through LangGraph Cloud's MCP endpoint.
 *
 * All tools reuse the existing TodoService from the main application,
 * ensuring data consistency across local and remote MCP servers.
 */

// Initialize OpenAI model
const model = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
});

// Create the React agent with all todo tools
export const agent = createReactAgent({
  llm: model,
  tools: [
    createTodoTool,
    getTodosTool,
    getTodoTool,
    updateTodoTool,
    deleteTodoTool,
    getCurrentDateTimeTool,
  ],
});

export default agent;
