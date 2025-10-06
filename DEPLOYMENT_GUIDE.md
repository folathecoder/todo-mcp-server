# 🚀 LangGraph Cloud Deployment Guide

Complete step-by-step guide to deploy your Todo MCP Server to LangGraph Cloud.

---

## 📋 Prerequisites

Before you begin, ensure you have:

1. ✅ Node.js 18+ installed
2. ✅ MongoDB Atlas account (or MongoDB instance)
3. ✅ OpenAI API key
4. ✅ LangSmith account (for LangGraph Cloud access)

---

## 🔧 Step 1: Install LangGraph CLI

Install the LangGraph CLI globally:

```bash
npm install -g @langchain/langgraph-cli
```

Verify installation:

```bash
langgraph --version
```

---

## 🔐 Step 2: Login to LangGraph Cloud

```bash
langgraph login
```

This will:
- Open your browser
- Prompt you to authenticate with LangSmith
- Save your credentials locally

---

## 📦 Step 3: Prepare Your Deployment

Navigate to the deployment folder:

```bash
cd langgraph-deployment
```

Install dependencies (if not already done):

```bash
npm install
```

---

## ⚙️ Step 4: Configure Environment Variables

You'll need to set these in LangGraph Cloud dashboard after deployment:

- `MONGODB_URI` - Your MongoDB connection string
- `OPENAI_API_KEY` - Your OpenAI API key

**Don't worry about setting them now** - we'll do this in the dashboard after deployment.

---

## 🚀 Step 5: Deploy to LangGraph Cloud

From the `langgraph-deployment` directory:

```bash
langgraph deploy
```

### What This Command Does:

1. 📦 Bundles your code
2. 🔍 Validates your `langgraph.json` config
3. ☁️ Uploads to LangGraph Cloud
4. 🎯 Creates your deployment
5. 📡 Generates your MCP endpoint URL

### Expected Output:

```
✓ Building graph...
✓ Uploading deployment...
✓ Deployment successful!

Deployment ID: dep_abc123xyz
Graph URL: https://api.langgraph.cloud/api/v1/projects/proj_123/graphs/todo_agent
MCP Endpoint: https://api.langgraph.cloud/api/v1/projects/proj_123/graphs/todo_agent/mcp

View in dashboard: https://smith.langchain.com/deployments/dep_abc123xyz
```

**🎉 Your MCP server is now live!** But we need to configure secrets next.

---

## 🔒 Step 6: Configure Secrets in Dashboard

1. **Open the dashboard URL** from the deployment output
2. Navigate to **Settings → Environment Variables**
3. Add the following secrets:

   | Variable Name | Value |
   |--------------|--------|
   | `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/todo-mcp` |
   | `OPENAI_API_KEY` | `sk-proj-...` |

4. Click **Save** and **Restart Deployment**

---

## 🧪 Step 7: Test Your Deployment

### Option 1: Using MCP Inspector

```bash
npx @modelcontextprotocol/inspector \
  --url https://api.langgraph.cloud/api/v1/projects/proj_123/graphs/todo_agent/mcp \
  --header "Authorization: Bearer YOUR_API_KEY"
```

### Option 2: Using the Example Client

1. Create a `.env` file in the `examples/` directory:

```env
TODO_MCP_ENDPOINT=https://api.langgraph.cloud/api/v1/projects/proj_123/graphs/todo_agent/mcp
LANGGRAPH_API_KEY=your_api_key_here
```

2. Run the example:

```bash
cd examples
npm install
npm run remote-client
```

### Option 3: Using curl

```bash
curl -X POST https://api.langgraph.cloud/api/v1/projects/proj_123/graphs/todo_agent/mcp/tools/list \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

---

## 🔑 Step 8: Get Your API Key

To call your MCP endpoint, you need an API key:

1. Go to **LangSmith Dashboard** → **Settings** → **API Keys**
2. Click **Create API Key**
3. Copy the key (you won't see it again!)
4. Use it in your client applications

---

## 📝 Step 9: Update Your Applications

Now you can call your Todo MCP server from anywhere!

### From Your Quiz App

```typescript
import { MCPClient } from "@langchain/mcp";

const todoServer = new MCPClient({
  url: "https://api.langgraph.cloud/api/v1/projects/proj_123/graphs/todo_agent/mcp",
  headers: {
    "Authorization": "Bearer YOUR_API_KEY"
  }
});

// Create a todo when quiz is scheduled
await todoServer.callTool("create_todo", {
  title: "Complete AI Quiz",
  priority: "high",
  dueDate: "2025-10-15T18:00:00Z"
});
```

### From Python

```python
from langchain_mcp.adapters import MCPClient

client = MCPClient(
    "https://api.langgraph.cloud/.../mcp",
    headers={"Authorization": "Bearer YOUR_API_KEY"}
)

client.call_tool("get_todos", {})
```

---

## 🔄 Step 10: Update Your Deployment

When you make changes to your code:

```bash
cd langgraph-deployment
langgraph deploy
```

LangGraph will:
- Create a new deployment version
- Gradually shift traffic to the new version
- Keep the old version as backup

---

## 📊 Monitoring & Debugging

### View Logs

```bash
langgraph logs --deployment dep_abc123xyz
```

### View in Dashboard

Visit: https://smith.langchain.com/deployments/dep_abc123xyz

You can see:
- 📈 Request metrics
- 🐛 Error logs
- ⏱️ Latency stats
- 🔍 Individual requests

---

## 🎯 Common Issues

### Issue: "Module not found" error

**Solution:** Make sure all imports use `.js` extensions:
```typescript
import todoService from "../../src/services/todoService.js";
```

### Issue: "Cannot connect to MongoDB"

**Solution:**
1. Check your MongoDB URI is correct in environment variables
2. Ensure your MongoDB allows connections from all IPs (0.0.0.0/0)
3. Verify your MongoDB user has read/write permissions

### Issue: "Unauthorized" when calling MCP endpoint

**Solution:**
1. Verify your API key is correct
2. Check the Authorization header format: `Bearer YOUR_KEY`
3. Ensure the API key hasn't expired

### Issue: Build timeout

**Solution:**
- Reduce dependencies if possible
- Check for circular imports
- Ensure TypeScript config is correct

---

## 💰 Pricing

LangGraph Cloud pricing (as of 2025):
- **Free Tier**: 10K requests/month
- **Pro**: $29/month for 100K requests
- **Enterprise**: Custom pricing

Check latest pricing at: https://www.langchain.com/pricing

---

## 🎉 Success Checklist

- [ ] LangGraph CLI installed and logged in
- [ ] Code deployed to LangGraph Cloud
- [ ] Environment variables configured in dashboard
- [ ] Deployment restarted after adding secrets
- [ ] MCP endpoint URL saved
- [ ] API key generated and stored securely
- [ ] Test request succeeds
- [ ] Integration with quiz app working
- [ ] Monitoring dashboard bookmarked

---

## 🆘 Need Help?

- **LangGraph Docs**: https://langchain-ai.github.io/langgraph/cloud/
- **LangSmith Support**: support@langchain.com
- **GitHub Issues**: https://github.com/folathecoder/todo-mcp-server/issues

---

## 🚀 Next Steps

Now that your MCP server is deployed:

1. ✅ Integrate with your quiz app
2. ✅ Add authentication/authorization if needed
3. ✅ Monitor usage and performance
4. ✅ Scale as needed (LangGraph handles this automatically)
5. ✅ Build more agents that use your Todo MCP server!

**You now have a production-grade, cloud-hosted MCP server! 🎉**
