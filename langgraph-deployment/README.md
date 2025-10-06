# Todo MCP Server - LangGraph Cloud Deployment

This directory contains the LangGraph.js deployment of the Todo MCP Server for remote, cloud-based access.

## 🏗️ Architecture

This deployment **reuses all existing code** from the main application:
- **TodoService** - Same business logic
- **MongoDB connection** - Same database
- **Todo models** - Same schema

The only new code is the LangChain tool wrappers that expose TodoService methods as LangGraph tools.

## 📦 What's Inside

```
langgraph-deployment/
├── src/
│   ├── tools.ts    # LangChain tool wrappers for TodoService
│   ├── agent.ts    # LangGraph React agent configuration
│   └── index.ts    # Local test entry point
├── langgraph.json  # LangGraph Cloud deployment config
├── package.json    # Dependencies
└── .env.langgraph  # Environment variables
```

## 🚀 Local Testing

```bash
# Install dependencies
npm install

# Test locally (connects to MongoDB)
npm run dev
```

## ☁️ Deploy to LangGraph Cloud

### Prerequisites

1. Install LangGraph CLI:
```bash
npm install -g @langchain/langgraph-cli
```

2. Login to LangGraph:
```bash
langgraph login
```

### Deploy

```bash
langgraph deploy
```

This will:
- Build your agent
- Upload to LangGraph Cloud
- Provide you with an MCP endpoint URL

### Deployment Output

After deployment, you'll receive:
```
✅ Deployment successful!
MCP Endpoint: https://api.langgraph.cloud/api/v1/projects/<project-id>/graphs/todo_agent/mcp
```

## 🔐 Configure Secrets

Set environment variables in LangGraph Cloud dashboard:
- `MONGODB_URI` - Your MongoDB connection string
- `OPENAI_API_KEY` - Your OpenAI API key

## 📡 Using the Remote MCP Server

### From Node.js/TypeScript

```typescript
import { MCPClient } from "@langchain/mcp";

const todoServer = new MCPClient({
  url: "https://api.langgraph.cloud/.../mcp",
  headers: {
    "Authorization": "Bearer YOUR_LANGGRAPH_API_KEY"
  }
});

// List available tools
const tools = await todoServer.listTools();
console.log(tools);

// Create a todo
const result = await todoServer.callTool("create_todo", {
  title: "Deploy to production",
  priority: "urgent",
  dueDate: "2025-10-10T17:00:00Z",
  assignee: "DevOps Team"
});
```

### From Python

```python
from langchain_mcp.adapters import MCPClient

client = MCPClient(
    "https://api.langgraph.cloud/.../mcp",
    headers={"Authorization": "Bearer YOUR_API_KEY"}
)

# Create a todo
response = client.call_tool("create_todo", {
    "title": "Review code",
    "priority": "high"
})
```

## 🛠️ Available MCP Tools

All 6 tools from the original MCP server:

1. `create_todo` - Create a new todo
2. `get_todos` - Get all todos
3. `get_todo` - Get specific todo by ID
4. `update_todo` - Update todo fields
5. `delete_todo` - Delete a todo
6. `get_current_datetime` - Get current date/time

## 🔄 Data Sync

Both the local MCP server (`npm run mcp`) and this remote LangGraph deployment connect to the **same MongoDB database**.

Any todo created via one endpoint is immediately visible to the other.

```
┌─────────────────────────────────┐
│      MongoDB Atlas              │
│  (Single Source of Truth)       │
└────────┬─────────────┬──────────┘
         │             │
┌────────▼─────┐  ┌────▼──────────┐
│ Local MCP    │  │ LangGraph MCP │
│ (stdio)      │  │ (HTTPS)       │
└──────────────┘  └───────────────┘
```

## 🎯 Use Cases

**Local MCP Server:**
- Claude Desktop integration
- Local development
- Terminal chat agent

**Remote LangGraph MCP:**
- Quiz app calling todo service
- Team collaboration apps
- Multi-agent systems
- Production deployments

## 📚 Next Steps

1. Deploy to LangGraph Cloud
2. Get your MCP endpoint URL
3. Generate an API key for authentication
4. Use the endpoint from your quiz app or other agents
5. Build amazing multi-agent applications! 🚀
