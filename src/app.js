import express, { urlencoded } from 'express';
import routes from './routes/index.js';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { fileURLToPath } from 'url';
import path from 'path';

const app = express();

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(urlencoded({ extended: true }));

// Debug middleware to log all requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, req.body);
    next();
  });

// Routes
app.use('/api', routes);

// Test route to verify server is working
app.get('/health', (req, res) => {
    res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
  });
  
  // 404 handler for unmatched routes
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      message: `Route ${req.method} ${req.originalUrl} not found`
    });
  });
  
  // Error handling middleware
  app.use((error, req, res, next) => {
    console.error('Server Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  });

// Set up the Swagger UI route
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default app;