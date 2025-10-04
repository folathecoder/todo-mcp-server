import express, { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import * as yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';
import todoRoutes from './routes/todoRoutes';

export const createApp = (): Express => {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Load OpenAPI spec
  // When running from dist/, go up one level; when running from src/, stay in current structure
  const openApiPath = path.join(process.cwd(), 'openapi.yaml');
  const openApiDocument = yaml.load(fs.readFileSync(openApiPath, 'utf8')) as Record<string, any>;

  // Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

  // Routes
  app.use('/api', todoRoutes);

  // Health check
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  return app;
};
