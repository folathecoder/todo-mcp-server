#!/usr/bin/env node
import 'dotenv/config';
import { connectDB } from '../../src/config/database.js';
import { agent } from './agent.js';

/**
 * Local test runner for LangGraph Todo Agent
 *
 * This script allows you to test the agent locally before deploying to LangGraph Cloud.
 * It connects to the same MongoDB database as the main application.
 */

async function main() {
  console.log('🚀 Starting LangGraph Todo Agent (Local Test)...\n');

  // Connect to MongoDB
  await connectDB();
  console.log('✅ Connected to MongoDB\n');

  // Test the agent with a sample query
  console.log('🤖 Testing agent with sample query...\n');

  const result = await agent.invoke({
    messages: [
      {
        role: 'user',
        content: 'Get all my todos',
      },
    ],
  });

  console.log('\n📋 Agent Response:');
  console.log(JSON.stringify(result, null, 2));

  console.log('\n✅ Agent test completed successfully!');
  console.log('\n💡 To deploy to LangGraph Cloud, run: langgraph deploy');

  process.exit(0);
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
