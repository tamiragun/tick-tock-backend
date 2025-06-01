import 'dotenv/config';
import { setupDb } from "../data/db.js";
import knex from 'knex';
import app from './app.js';
const PORT = process.env.PORT || 3000;

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

// Graceful shutdown handling
const shutdown = async () => {
  console.log('Received kill signal, shutting down gracefully');
  
  // No need to explicitly close SQLite connections
  // but we should still destroy the knex instance for clean shutdown
  connection.destroy()
  .then(() => {
    console.log('Database connections closed');
    app.close(() => {
      console.log("HTTP server closed");
      process.exit(0);
    })
  }).catch((err) => {
    console.error('Error closing database connections:', err);
    process.exit(1);
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
});