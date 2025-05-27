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

// Validation rules that can be reused
const validationRules = {
  started_at: {
    required: true,
    validate: (value) => {
      if (!(value instanceof Date) && !isValidISOString(value)) {
        return 'started_at must be a valid date';
      }
      
      const startDate = new Date(value);
      const now = new Date();
      
      if (startDate > now) {
        return 'started_at cannot be in the future';
      }
      
      return null;
    }
  },
  ended_at: {
    required: false,
    validate: (value, data) => {
      if (value && !(value instanceof Date) && !isValidISOString(value)) {
        return 'ended_at must be a valid date';
      }

      if (value) {
        const endDate = new Date(value);
        const now = new Date();
        
        if (endDate > now) {
          return 'ended_at cannot be in the future';
        }

        if (data.started_at) {
          const startDate = new Date(data.started_at);
          if (endDate < startDate) {
            return 'ended_at must be after started_at';
          }
        }
      }
      
      return null;
    }
  },
  duration: {
    required: false,
    validate: (value) => {
      if (value !== undefined && (!Number.isInteger(value) || value < 0)) {
        return 'duration must be a non-negative integer';
      }
      return null;
    }
  },
  project_id: {
    required: true,
    validate: (value) => {
      if (!Number.isInteger(value)) return 'project_id must be an integer';
      return null;
    }
  }
};

// Helper function to validate ISO date strings
function isValidISOString(str) {
  if (typeof str !== 'string') return false;
  const date = new Date(str);
  return date instanceof Date && !isNaN(date) && date.toISOString().includes('T');
}

// Generic validation function
const validateData = (data, operation = 'update') => {
  if (!['create', 'update'].includes(operation)) {
    throw new Error('Invalid operation type. Must be either "create" or "update"');
  }

  const errors = [];
  const allowedFields = Object.keys(validationRules);

  // Check for invalid fields
  Object.keys(data).forEach(field => {
    if (!allowedFields.includes(field)) {
      errors.push(`Invalid field: ${field}. Only ${allowedFields.join(', ')} can be updated.`);
    }
  });

  // Validate each field
  Object.entries(validationRules).forEach(([field, rules]) => {
    const value = data[field];

    // Check required fields only during creation
    if (operation === 'create' && rules.required && value === undefined) {
      errors.push(`${field} is required`);
      return;
    }

    // Skip validation if field is not provided (for updates)
    if (value === undefined) return;

    // Validate value if provided
    const error = rules.validate(value, data);
    if (error) errors.push(error);
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Use generic validation for updates
const validateUpdateData = (data) => validateData(data, 'update');

// Use generic validation for creation
const validateCreateData = (data) => validateData(data, 'create');

export const createSession = async (sessionData) => {
  try {
    // Validate input data
    const validation = validateCreateData(sessionData);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    const dataToInsert = {
      ...sessionData,
      created_at: new Date()
    };

    // Calculate duration if ended_at is provided
    if (dataToInsert.ended_at) {
      const startDate = new Date(dataToInsert.started_at);
      const endDate = new Date(dataToInsert.ended_at);
      dataToInsert.duration = Math.floor((endDate - startDate) / 1000); // Duration in seconds
    }

    const [result] = await connection('sessions').insert(dataToInsert).returning('session_id');

    return { success: true, sessionId: result.session_id };
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

export const getAllSessions = async () => {
  try {
    const sessions = await connection('sessions')
      .select(
        'sessions.*',
        'projects.project_name',
        'clients.company_name as client_name'
      )
      .leftJoin('projects', 'sessions.project_id', 'projects.project_id')
      .leftJoin('clients', 'projects.client_id', 'clients.client_id')
      .orderBy('sessions.started_at', 'desc');
    return sessions;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

export const getSessionById = async (sessionId) => {
  try {
    const session = await connection('sessions')
      .select(
        'sessions.*',
        'projects.project_name',
        'clients.company_name as client_name'
      )
      .leftJoin('projects', 'sessions.project_id', 'projects.project_id')
      .leftJoin('clients', 'projects.client_id', 'clients.client_id')
      .where('sessions.session_id', sessionId)
      .first();
    return session;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

export const updateSession = async (sessionId, updateData) => {
  try {
    // Remove system-managed fields if they exist
    const { session_id, created_at, ...allowedUpdates } = updateData;

    // Validate the update data
    const validation = validateUpdateData(allowedUpdates);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    // If ended_at is being updated, recalculate duration
    if (allowedUpdates.ended_at) {
      const session = await getSessionById(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      const startDate = new Date(session.started_at);
      const endDate = new Date(allowedUpdates.ended_at);
      allowedUpdates.duration = Math.floor((endDate - startDate) / 1000); // Duration in seconds
    }
    
    const updated = await connection('sessions')
      .where('session_id', sessionId)
      .update(allowedUpdates);
    return updated > 0;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

export const deleteSession = async (sessionId) => {
  try {
    const deleted = await connection('sessions')
      .where('session_id', sessionId)
      .del();
    return deleted > 0;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
}; 