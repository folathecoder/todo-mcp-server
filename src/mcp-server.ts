#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { connectDB } from './config/database';
import todoService from './services/todoService';

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
        description: 'Create a new todo item with optional priority, due date, and assignee',
        inputSchema: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'The title of the todo item',
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'urgent'],
              description: 'Priority level of the todo (default: medium)',
            },
            dueDate: {
              type: 'string',
              description: 'Due date in ISO 8601 format (e.g., 2025-10-15T10:00:00Z)',
            },
            assignee: {
              type: 'string',
              description: 'Person assigned to this todo',
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
        description: 'Update a todo item with any combination of fields',
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
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'urgent'],
              description: 'Priority level of the todo',
            },
            dueDate: {
              type: 'string',
              description: 'Due date in ISO 8601 format',
            },
            assignee: {
              type: 'string',
              description: 'Person assigned to this todo',
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
      {
        name: 'get_current_datetime',
        description: 'Get the current date and time in ISO 8601 format',
        inputSchema: {
          type: 'object',
          properties: {},
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
        const { title, priority, dueDate, assignee } = args as {
          title: string;
          priority?: string;
          dueDate?: string;
          assignee?: string;
        };
        const todo = await todoService.createTodo({ title, priority, dueDate, assignee });
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
        const todos = await todoService.getAllTodos();
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
        const todo = await todoService.getTodoById(id);
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
        const { id, title, completed, priority, dueDate, assignee } = args as {
          id: string;
          title?: string;
          completed?: boolean;
          priority?: string;
          dueDate?: string;
          assignee?: string;
        };

        const todo = await todoService.updateTodo(id, {
          title,
          completed,
          priority,
          dueDate,
          assignee,
        });

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
        const todo = await todoService.deleteTodo(id);
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

      case 'get_current_datetime': {
        const datetimeInfo = todoService.getCurrentDateTime();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(datetimeInfo, null, 2),
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
