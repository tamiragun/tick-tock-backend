import knex from 'knex';
import { convertKeysToSnakeCase, convertKeysToCamelCase } from '../utils/case-converter.js';

let connection;
const config = {
  client: 'sqlite3',
  connection: {
      filename: './data/ticktock.sqlite',
  },
  useNullAsDefault: true,
}
connection = knex(config);

// Schema validation helper
const validateUpdateData = (data) => {
  const allowedFields = ['companyName'];
  const errors = [];

  // Check for invalid fields
  Object.keys(data).forEach(field => {
    if (!allowedFields.includes(field)) {
      errors.push(`Invalid field: ${field}. Only ${allowedFields.join(', ')} can be updated.`);
    }
  });

  // Validate companyName if provided
  if (data.companyName !== undefined) {
    if (typeof data.companyName !== 'string') {
      errors.push('companyName must be a string');
    } else if (data.companyName.trim() === '') {
      errors.push('companyName cannot be empty');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validation for client creation
const validateCreateData = (data) => {
  const errors = [];

  // Validate userId
  if (!data.userId) {
    errors.push('userId is required');
  } else if (!Number.isInteger(data.userId)) {
    errors.push('userId must be an integer');
  }

  // Validate companyName
  if (!data.companyName) {
    errors.push('companyName is required');
  } else if (typeof data.companyName !== 'string') {
    errors.push('companyName must be a string');
  } else if (data.companyName.trim() === '') {
    errors.push('companyName cannot be empty');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const createClient = async (userData) => {
  try {
    // Validate input data
    const validation = validateCreateData(userData);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    const dataToInsert = convertKeysToSnakeCase({
      userId: userData.userId,
      companyName: userData.companyName.trim(),
      createdAt: new Date()
    });

    const [result] = await connection('clients').insert(dataToInsert).returning('client_id');

    return { success: true, clientId: result.client_id };
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

export const getAllClients = async () => {
  try {
    const clients = await connection('clients').select('*');
    return convertKeysToCamelCase(clients);
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

export const getClientById = async (clientId) => {
  try {
    const client = await connection('clients')
      .where('client_id', clientId)
      .first();
    return client ? convertKeysToCamelCase(client) : null;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

export const updateClient = async (clientId, updateData) => {
  try {
    // Remove system-managed fields if they exist
    const { userId, clientId: id, createdAt, ...allowedUpdates } = updateData;

    // Validate the update data
    const validation = validateUpdateData(allowedUpdates);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
    
    const snakeCaseUpdates = convertKeysToSnakeCase(allowedUpdates);
    const updated = await connection('clients')
      .where('client_id', clientId)
      .update(snakeCaseUpdates);
    return updated > 0;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

export const deleteClient = async (clientId) => {
  try {
    const deleted = await connection('clients')
      .where('client_id', clientId)
      .del();
    return deleted > 0;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
}; 