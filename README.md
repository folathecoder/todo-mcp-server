# Todo MCP Server with AI Chat Agent

A Node.js + TypeScript application that provides a **Todo management system** with both REST API and **Model Context Protocol (MCP)** server, plus an intelligent AI chat agent powered by OpenAI.

## 🌟 Features

- ✅ **REST API** - Full CRUD operations for todos
- 🤖 **MCP Server** - AI agents can interact with todos via MCP protocol
- 💬 **AI Chat Agent** - Conversational interface to manage todos
- 🎨 **Beautiful CLI** - Colorful, interactive console interface
- 🤝 **Human-in-the-Loop** - Agent asks clarifying questions when creating todos
- 📊 **Priority Management** - Low, medium, high, urgent priorities
- 📅 **Due Dates** - Set and track deadlines
- 👥 **Assignee Support** - Assign todos to team members
- 📖 **OpenAPI/Swagger** - Auto-generated API documentation
- 🗄️ **MongoDB** - Persistent data storage

## 📁 Project Structure

```
mcp-practice/
├── src/
│   ├── config/
│   │   └── database.ts          # MongoDB connection
│   ├── models/
│   │   └── Todo.ts              # Todo schema & model
│   ├── services/
│   │   └── todoService.ts       # Shared business logic
│   ├── routes/
│   │   └── todoRoutes.ts        # Express CRUD routes
│   ├── app.ts                   # Express app setup
│   ├── index.ts                 # HTTP server entry point
│   ├── mcp-server.ts            # MCP server entry point
│   └── chat-agent.ts            # AI chat agent
├── openapi.yaml                 # API documentation
├── package.json
└── tsconfig.json
```

## 🚀 Installation

### Prerequisites

- Node.js 18+ installed
- MongoDB database (local or MongoDB Atlas)
- OpenAI API key

### Step 1: Clone & Install

```bash
cd mcp-practice
npm install
```

### Step 2: Configure Environment

Create a `.env` file in the root directory:

```env
MONGODB_URI=mongodb://localhost:27017/todo-mcp
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/todo-mcp

PORT=3000
OPENAI_API_KEY=your_openai_api_key_here
```

### Step 3: Build

```bash
npm run build
```

## 💬 Chat with the AI Agent

The easiest way to interact with your todos is through the AI chat agent:

```bash
npm run chat
```

### Example Conversation

```
You: Create a todo

🤖 Sure! What would you like to add to your todo list?
You: Review the PR

🤖 What priority should this have? (low, medium, high, urgent)
You: high

🤖 When is this due?
You: tomorrow at 5pm

🤖 Should this be assigned to anyone?
You: John

✓ Todo created successfully!
```

### Quick Create (All at Once)

```
You: Create a high priority todo to "Deploy to production" due next Monday assigned to DevOps team
```

### Other Commands

```
You: Show all my todos
You: Mark the first todo as completed
You: Delete completed todos
You: What time is it?
```

Type `exit` to quit the chat.

## 🌐 Using the REST API

### Start the HTTP Server

```bash
npm run dev
```

The API will be available at `http://localhost:3000`

### API Documentation

Open your browser: **http://localhost:3000/api-docs**

Interactive Swagger UI with all endpoints and examples.

### API Endpoints

```bash
# Create a todo
POST http://localhost:3000/api/todos
Content-Type: application/json

{
  "title": "Review code",
  "priority": "high",
  "dueDate": "2025-10-15T17:00:00Z",
  "assignee": "John Doe"
}

# Get all todos
GET http://localhost:3000/api/todos

# Get a single todo
GET http://localhost:3000/api/todos/:id

# Update a todo
PUT http://localhost:3000/api/todos/:id
Content-Type: application/json

{
  "completed": true,
  "priority": "urgent"
}

# Delete a todo
DELETE http://localhost:3000/api/todos/:id
```

## 🔌 Using the MCP Server

The MCP server allows AI agents to interact with your todos.

### Start the MCP Server

```bash
npm run mcp
```

### Available MCP Tools

1. **create_todo** - Create a new todo with title, priority, due date, assignee
2. **get_todos** - Get all todos
3. **get_todo** - Get a specific todo by ID
4. **update_todo** - Update todo fields
5. **delete_todo** - Delete a todo
6. **get_current_datetime** - Get current date/time (helps with due dates)

### Test with MCP Inspector

```bash
npx @modelcontextprotocol/inspector npm run mcp
```

Open the URL shown in your browser to test MCP tools interactively.

## 🛠️ Available Scripts

```bash
npm run dev        # Start HTTP server with hot reload
npm run chat       # Start AI chat agent
npm run mcp        # Start MCP server
npm run build      # Build TypeScript to JavaScript
npm start          # Run compiled JavaScript
```

## 📊 Todo Schema

```typescript
{
  title: string;           // Required
  completed: boolean;      // Default: false
  priority: string;        // low | medium | high | urgent (default: medium)
  dueDate?: Date;          // Optional
  assignee?: string;       // Optional
  createdAt: Date;         // Auto-generated
  updatedAt: Date;         // Auto-generated
}
```

## 🎨 AI Chat Agent Features

- **Smart Questioning** - Asks for missing details one at a time
- **Natural Language** - Understands conversational commands
- **Colorful Interface** - Beautiful console UI with colors and boxes
- **Tool Execution** - Shows what tools it's using behind the scenes
- **Error Handling** - Graceful error messages

## 🏗️ Architecture

### Service Layer Pattern

The codebase follows a clean architecture with a shared service layer:

- **TodoService** - Contains all business logic
- **Routes** - Handle HTTP requests, delegate to service
- **MCP Server** - Handle MCP tool calls, delegate to service
- **No Code Duplication** - Single source of truth

### Benefits

✅ DRY (Don't Repeat Yourself)
✅ Easy to test
✅ Easy to maintain
✅ Consistent behavior across HTTP and MCP

## 🔒 Security Notes

- Never commit `.env` file to version control
- Use environment variables for secrets
- MongoDB connection strings should be secure
- OpenAI API keys should be kept private

## 🤝 Contributing

This is a learning project demonstrating MCP server implementation with AI agents.

## 📝 License

ISC

---

**Made with ❤️ using:**
- Node.js + TypeScript
- Express.js
- MongoDB + Mongoose
- OpenAI GPT-4
- Model Context Protocol (MCP)
- Chalk, Boxen, Gradient-String (for beautiful CLI)
