#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { connectDB } from './config/database';
import { Todo } from './models/Todo';

// Initialize MCP Server
const server = new Server(
  {
    name: 'todo-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'create_todo',
        description: 'Create a new todo item',
        inputSchema: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'The title of the todo item',
            },
          },
          required: ['title'],
        },
      },
      {
        name: 'get_todos',
        description: 'Get all todo items',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_todo',
        description: 'Get a single todo item by ID',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The ID of the todo item',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'update_todo',
        description: 'Update a todo item',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The ID of the todo item',
            },
            title: {
              type: 'string',
              description: 'The new title of the todo item',
            },
            completed: {
              type: 'boolean',
              description: 'The completion status of the todo item',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'delete_todo',
        description: 'Delete a todo item',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The ID of the todo item',
            },
          },
          required: ['id'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'create_todo': {
        const { title } = args as { title: string };
        const todo = new Todo({ title });
        await todo.save();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(todo, null, 2),
            },
          ],
        };
      }

      case 'get_todos': {
        const todos = await Todo.find().sort({ createdAt: -1 });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(todos, null, 2),
            },
          ],
        };
      }

      case 'get_todo': {
        const { id } = args as { id: string };
        const todo = await Todo.findById(id);
        if (!todo) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({ error: 'Todo not found' }),
              },
            ],
            isError: true,
          };
        }
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(todo, null, 2),
            },
          ],
        };
      }

      case 'update_todo': {
        const { id, title, completed } = args as {
          id: string;
          title?: string;
          completed?: boolean;
        };
        const todo = await Todo.findByIdAndUpdate(
          id,
          { title, completed },
          { new: true, runValidators: true }
        );
        if (!todo) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({ error: 'Todo not found' }),
              },
            ],
            isError: true,
          };
        }
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(todo, null, 2),
            },
          ],
        };
      }

      case 'delete_todo': {
        const { id } = args as { id: string };
        const todo = await Todo.findByIdAndDelete(id);
        if (!todo) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({ error: 'Todo not found' }),
              },
            ],
            isError: true,
          };
        }
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ message: 'Todo deleted successfully', todo }, null, 2),
            },
          ],
        };
      }

      default:
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: `Unknown tool: ${name}` }),
            },
          ],
          isError: true,
        };
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ error: String(error) }),
        },
      ],
      isError: true,
    };
  }
});

// Start the MCP server
async function main() {
  // Connect to MongoDB
  await connectDB();

  // Start the MCP server with stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('MCP Todo Server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
