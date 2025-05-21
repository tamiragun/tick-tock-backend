import { setupDb } from "../data/db.js";
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { fileURLToPath } from 'url';
import path from 'path';
import knex from 'knex';
import bcrypt from 'bcrypt';

const app = express();
const port = 3000;

// Set up the database, connection, tables, and seed data
let connection;
const config = {
  client: 'sqlite3',
  connection: {
      filename: './data/ticktock.sqlite',
  },
  useNullAsDefault: true,
}
connection = knex(config);

await setupDb(connection);

// Body parsing middleware
app.use(express.json());

app.get('/clients', async (req, res) => {
  try {
    const object = {
      name: "Tamira"
    }
    res.send(JSON.stringify(object));
  } catch (error) {
    console.log(error);
    res.status(500).send();
  } 
});

app.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const errors = [];

    // Validation
    if (!firstName || firstName.trim() === '') {
      errors.push({ field: 'firstName', message: 'First name is required' });
    }
    
    if (!lastName || lastName.trim() === '') {
      errors.push({ field: 'lastName', message: 'Last name is required' });
    }
    
    if (!email || email.trim() === '') {
      errors.push({ field: 'email', message: 'Email is required' });
    } else {
      // Basic email validation using regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push({ field: 'email', message: 'Please provide a valid email' });
      } else {
        // Check if email already exists
        const existingUser = await connection('users').where({ email: email.toLowerCase().trim() }).first();
        if (existingUser) {
          errors.push({ field: 'email', message: 'Email already in use' });
        }
      }
    }
    
    if (!password) {
      errors.push({ field: 'password', message: 'Password is required' });
    } else if (password.length < 8) {
      errors.push({ field: 'password', message: 'Password must be at least 8 characters long' });
    } else {
      // Check password complexity
      const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/;
      if (!passwordRegex.test(password)) {
        errors.push({ 
          field: 'password', 
          message: 'Password must include one uppercase letter, one lowercase letter, one number, and one special character' 
        });
      }
    }

    // Return validation errors if any
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user into database using Knex
    const [result] = await connection('users').insert({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      user_role: "user",
      created_at: new Date()
    }).returning('user_id');

    // Return success response
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        userId: result.user_id,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim()
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  } 
});

// Set up the Swagger UI route
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Graceful shutdown handling
const shutdown = () => {
  console.log('Received kill signal, shutting down gracefully');
  
  // No need to explicitly close SQLite connections
  // but we should still destroy the knex instance for clean shutdown
  connection.destroy().then(() => {
    console.log('Database connections closed');
    process.exit(0);
  }).catch((err) => {
    console.error('Error closing database connections:', err);
    process.exit(1);
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  console.log(`Swagger UI available at http://localhost:${port}/api-docs`);
});