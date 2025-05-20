import { setupDb } from "../data/db.js";
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { fileURLToPath } from 'url';
import path from 'path';
import knex from 'knex'

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
setupDb(connection);


app.get('/clients', async (req, res) => {
  try {
    res.send("clients");
  } catch (error) {
    console.log(error);
    res.status(500).send();
  } finally {
    await connection.destroy();
  }
});

// Set up the Swagger UI route
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  console.log(`Swagger UI available at http://localhost:${port}/api-docs`);
});