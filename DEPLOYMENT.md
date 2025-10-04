# Deployment Guide

## Production Deployment

### Prerequisites
- Node.js 18+ installed
- MongoDB database (local or MongoDB Atlas)
- Server with SSH access

### Step 1: Prepare the Server

```bash
# SSH into your server
ssh user@your-server.com

# Install Node.js (if not installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2
```

### Step 2: Deploy Application

```bash
# Clone or upload your code to the server
cd /var/www
git clone your-repo-url mcp-practice
cd mcp-practice

# Install dependencies
npm install

# Build the application
npm run build

# Create production .env file
nano .env
```

Add your production environment variables:
```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/todo-mcp
PORT=3000
OPENAI_API_KEY=your_openai_key
```

### Step 3: Start with PM2

```bash
# Start the HTTP API server
pm2 start dist/index.js --name todo-api

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system reboot
pm2 startup
```

### Step 4: Setup Nginx Reverse Proxy (Optional but Recommended)

```bash
# Install Nginx
sudo apt-get install nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/todo-api
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/todo-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 5: Setup SSL with Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

## Accessing Your API

Your API will be available at:
- `http://your-domain.com/api/todos` (without SSL)
- `https://your-domain.com/api/todos` (with SSL)
- `http://your-domain.com/api-docs` (Swagger documentation)

## Using the API from Other Apps

### From Your Chat App

```typescript
// Instead of MCP connection, use HTTP requests
const response = await fetch('https://your-domain.com/api/todos', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: 'New todo' })
});
const todo = await response.json();
```

### API Endpoints

- `POST /api/todos` - Create todo
- `GET /api/todos` - Get all todos
- `GET /api/todos/:id` - Get single todo
- `PUT /api/todos/:id` - Update todo
- `DELETE /api/todos/:id` - Delete todo

## Monitoring

```bash
# View logs
pm2 logs todo-api

# Monitor processes
pm2 monit

# Check status
pm2 status
```

## Updating the Application

```bash
cd /var/www/mcp-practice
git pull
npm install
npm run build
pm2 restart todo-api
```

## Alternative: Deploy to Cloud Platforms

### Heroku
```bash
heroku create your-app-name
git push heroku main
heroku config:set MONGODB_URI=your_uri
```

### Railway
1. Connect your GitHub repo
2. Add environment variables
3. Railway auto-deploys

### DigitalOcean App Platform
1. Connect repo
2. Set environment variables
3. Auto-deploys on push

### AWS EC2
- Follow "Step 1-4" above on your EC2 instance
- Configure security groups to allow HTTP/HTTPS

## Environment Variables for Production

```env
MONGODB_URI=mongodb+srv://...
PORT=3000
NODE_ENV=production
```

## Security Best Practices

1. Use environment variables for secrets
2. Enable HTTPS with SSL certificates
3. Use MongoDB authentication
4. Set up firewall rules
5. Keep dependencies updated
6. Use PM2 or similar for auto-restart
7. Monitor logs regularly
