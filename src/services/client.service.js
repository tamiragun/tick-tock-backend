import knex from 'knex';

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
  const allowedFields = ['company_name'];
  const errors = [];

  // Check for invalid fields
  Object.keys(data).forEach(field => {
    if (!allowedFields.includes(field)) {
      errors.push(`Invalid field: ${field}. Only ${allowedFields.join(', ')} can be updated.`);
    }
  });

  // Validate company_name if provided
  if (data.company_name !== undefined) {
    if (typeof data.company_name !== 'string') {
      errors.push('company_name must be a string');
    } else if (data.company_name.trim() === '') {
      errors.push('company_name cannot be empty');
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

  // Validate user_id
  if (!data.user_id) {
    errors.push('user_id is required');
  } else if (!Number.isInteger(data.user_id)) {
    errors.push('user_id must be an integer');
  }

  // Validate company_name
  if (!data.company_name) {
    errors.push('company_name is required');
  } else if (typeof data.company_name !== 'string') {
    errors.push('company_name must be a string');
  } else if (data.company_name.trim() === '') {
    errors.push('company_name cannot be empty');
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

    const [result] = await connection('clients').insert({
      user_id: userData.user_id,
      company_name: userData.company_name.trim(),
      created_at: new Date()
    }).returning('client_id');

    return { success: true, clientId: result.client_id };
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

export const getAllClients = async () => {
  try {
    const clients = await connection('clients').select('*');
    return clients;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

export const getClientById = async (clientId) => {
  try {
    const client = await connection('clients')
      .where('client_id', clientId)
      .first();
    return client;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

export const updateClient = async (clientId, updateData) => {
  try {
    // Remove system-managed fields if they exist
    const { user_id, client_id, created_at, ...allowedUpdates } = updateData;

    // Validate the update data
    const validation = validateUpdateData(allowedUpdates);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
    
    const updated = await connection('clients')
      .where('client_id', clientId)
      .update(allowedUpdates);
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