import OpenAI from 'openai';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import * as readline from 'readline';
import { connectDB } from './config/database';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// MCP Client
let mcpClient: Client;
let availableTools: any[] = [];

// Initialize MCP Client
async function initializeMCPClient() {
  mcpClient = new Client(
    {
      name: 'todo-chat-agent',
      version: '1.0.0',
    },
    {
      capabilities: {},
    }
  );

  // Connect to MCP server via stdio
  const transport = new StdioClientTransport({
    command: 'npm',
    args: ['run', 'mcp'],
  });

  await mcpClient.connect(transport);

  // Get available tools
  const toolsResponse = await mcpClient.listTools();
  availableTools = toolsResponse.tools;

  console.log('✅ Connected to Todo MCP Server');
  console.log(`📋 Available tools: ${availableTools.map((t) => t.name).join(', ')}\n`);
}

// Convert MCP tools to OpenAI tool format
function convertMCPToolsToOpenAIFormat() {
  return availableTools.map((tool) => ({
    type: 'function' as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema,
    },
  }));
}

// Execute MCP tool
async function executeMCPTool(toolName: string, toolInput: any) {
  const result = await mcpClient.callTool({
    name: toolName,
    arguments: toolInput,
  });

  // Extract text content from MCP response
  if (result.content && Array.isArray(result.content)) {
    return result.content
      .filter((item) => item.type === 'text')
      .map((item) => item.text)
      .join('\n');
  }

  return JSON.stringify(result);
}

// Chat with GPT
async function chat(userMessage: string) {
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: 'user',
      content: userMessage,
    },
  ];

  let continueLoop = true;

  while (continueLoop) {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      tools: convertMCPToolsToOpenAIFormat(),
    });

    const responseMessage = response.choices[0].message;

    // Add assistant response to messages
    messages.push(responseMessage);

    // Check if GPT wants to use tools
    if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
      // Process all tool calls
      for (const toolCall of responseMessage.tool_calls) {
        if (toolCall.type === 'function') {
          console.log(`\n🔧 Using tool: ${toolCall.function.name}`);
          console.log(`📥 Input: ${toolCall.function.arguments}`);

          const toolInput = JSON.parse(toolCall.function.arguments);

          // Execute the tool via MCP
          const toolResult = await executeMCPTool(toolCall.function.name, toolInput);

          console.log(`📤 Result: ${toolResult}\n`);

          // Add tool result to messages
          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: toolResult,
          });
        }
      }
    } else {
      // No more tools to use, return final response
      continueLoop = false;
      return responseMessage.content || 'No response';
    }
  }
}

// Main chat loop
async function main() {
  console.log('🤖 Todo Chat Agent Starting...\n');

  // Connect to MongoDB
  await connectDB();

  // Initialize MCP client
  await initializeMCPClient();

  console.log('💬 Chat with me! Ask me to manage your todos.');
  console.log('📝 Examples:');
  console.log('   - "Create a todo to buy groceries"');
  console.log('   - "Show me all my todos"');
  console.log('   - "Mark the first todo as completed"');
  console.log('   - "Delete all completed todos"\n');
  console.log('Type "exit" to quit.\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const askQuestion = () => {
    rl.question('You: ', async (input) => {
      const userInput = input.trim();

      if (userInput.toLowerCase() === 'exit') {
        console.log('\n👋 Goodbye!');
        rl.close();
        process.exit(0);
      }

      if (!userInput) {
        askQuestion();
        return;
      }

      try {
        const response = await chat(userInput);
        console.log(`\n🤖 Agent: ${response}\n`);
      } catch (error) {
        console.error('❌ Error:', error);
      }

      askQuestion();
    });
  };

  askQuestion();
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
