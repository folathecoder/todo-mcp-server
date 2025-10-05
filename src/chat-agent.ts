import OpenAI from 'openai';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import * as readline from 'readline';
import { connectDB } from './config/database';
import chalk from 'chalk';
import boxen from 'boxen';
import ora from 'ora';
import gradient from 'gradient-string';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// MCP Client
let mcpClient: Client;
let availableTools: any[] = [];

// Initialize MCP Client
async function initializeMCPClient() {
  console.log(chalk.cyan('🔌 Connecting to Todo MCP Server...'));

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

  console.log(chalk.green('✓ Connected to Todo MCP Server'));
  console.log(chalk.cyan(`📋 Available tools: ${chalk.yellow(availableTools.map((t) => t.name).join(', '))}\n`));
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

// Ask user for confirmation or additional info
async function askUserQuestion(question: string, rl: readline.Interface): Promise<string> {
  return new Promise((resolve) => {
    rl.question(chalk.yellow(`\n❓ ${question}\n${chalk.blue('You: ')}`), (answer) => {
      resolve(answer.trim());
    });
  });
}

// Chat with GPT
async function chat(userMessage: string, rl: readline.Interface) {
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: `You are a helpful todo management assistant. When the user wants to create a todo, you should ask them for details if they haven't provided them:
- Priority level (low, medium, high, urgent)
- Due date (if applicable)
- Assignee (if applicable)

Ask ONE question at a time. Wait for the user's response before proceeding. Be conversational and friendly.
If the user provides all details upfront, proceed directly to create the todo.`
    },
    {
      role: 'user',
      content: userMessage,
    },
  ];

  let continueLoop = true;
  console.log(chalk.magenta('💭 Thinking...\n'));

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
          console.log(chalk.blue(`🔧 Using tool: ${chalk.bold(toolCall.function.name)}`));
          console.log(chalk.gray(`📥 Input: ${toolCall.function.arguments}`));

          const toolInput = JSON.parse(toolCall.function.arguments);

          // Execute the tool via MCP
          console.log(chalk.yellow(`⚡ Executing...`));
          const toolResult = await executeMCPTool(toolCall.function.name, toolInput);
          console.log(chalk.green(`✓ Tool executed successfully`));

          console.log(chalk.gray(`📤 Result: ${toolResult}\n`));

          // Add tool result to messages
          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: toolResult,
          });
        }
      }
      console.log(chalk.magenta('💭 Thinking...\n'));
    } else {
      // Check if GPT is asking a question
      const content = responseMessage.content || '';

      // Simple heuristic: if response ends with '?' it's likely a question
      if (content.includes('?') && !content.toLowerCase().includes('created') && !content.toLowerCase().includes('done')) {
        // GPT is asking a question, show it to user and wait for response
        console.log(boxen(chalk.cyan(`🤖 ${content}`), {
          padding: 1,
          margin: { top: 1, bottom: 1 },
          borderStyle: 'round',
          borderColor: 'cyan',
        }));

        const userAnswer = await askUserQuestion('', rl);

        if (userAnswer.toLowerCase() === 'exit') {
          return 'Cancelled';
        }

        // Add user's answer to messages and continue
        messages.push({
          role: 'user',
          content: userAnswer,
        });

        console.log(chalk.magenta('💭 Thinking...\n'));
      } else {
        // No more questions, return final response
        continueLoop = false;
        return content;
      }
    }
  }
}

// Main chat loop
async function main() {
  console.clear();

  // Banner
  const banner = boxen(gradient.pastel.multiline('TODO CHAT AGENT'), {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'cyan',
  });
  console.log(banner);

  // Connect to MongoDB
  console.log(chalk.cyan('🗄️  Connecting to MongoDB...'));
  await connectDB();
  console.log(chalk.green('✓ MongoDB connected'));

  // Initialize MCP client
  await initializeMCPClient();

  // Instructions box
  const instructions = boxen(
    chalk.cyan('💬 Chat with me! Ask me to manage your todos.\n\n') +
    chalk.yellow('📝 Examples:\n') +
    chalk.white('  • "Create a todo to buy groceries"\n') +
    chalk.white('  • "Show me all my todos"\n') +
    chalk.white('  • "Mark the first todo as completed"\n') +
    chalk.white('  • "Delete all completed todos"\n\n') +
    chalk.gray('Type "exit" to quit.'),
    {
      padding: 1,
      margin: { top: 1, bottom: 1 },
      borderStyle: 'round',
      borderColor: 'green',
    }
  );
  console.log(instructions);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const askQuestion = () => {
    rl.question(chalk.blue('You: '), async (input) => {
      const userInput = input.trim();

      if (userInput.toLowerCase() === 'exit') {
        console.log(boxen(chalk.yellow('👋 Goodbye! Have a productive day!'), {
          padding: 1,
          margin: 1,
          borderStyle: 'round',
          borderColor: 'yellow',
        }));
        rl.close();
        process.exit(0);
      }

      if (!userInput) {
        askQuestion();
        return;
      }

      try {
        const response = await chat(userInput, rl);

        if (response !== 'Cancelled') {
          console.log(boxen(chalk.green(`🤖 ${response}`), {
            padding: 1,
            margin: { top: 1, bottom: 1 },
            borderStyle: 'round',
            borderColor: 'green',
          }));
        }
      } catch (error: any) {
        console.log(boxen(chalk.red(`❌ Error: ${error.message}`), {
          padding: 1,
          margin: 1,
          borderStyle: 'round',
          borderColor: 'red',
        }));
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
