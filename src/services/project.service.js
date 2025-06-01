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

// Validation rules that can be reused
const validationRules = {
  projectName: {
    required: true,
    validate: (value) => {
      if (typeof value !== 'string') return 'projectName must be a string';
      if (value.trim() === '') return 'projectName cannot be empty';
      return null;
    }
  },
  rate: {
    required: true,
    validate: (value) => {
      if (typeof value !== 'number' || value <= 0) return 'rate must be a positive number';
      return null;
    }
  },
  rateType: {
    required: true,
    validate: (value) => {
      const validRateTypes = ['hourly', 'fixed'];
      if (!validRateTypes.includes(value)) return `rateType must be one of: ${validRateTypes.join(', ')}`;
      return null;
    }
  },
  clientId: {
    required: true,
    validate: (value) => {
      if (!Number.isInteger(value)) return 'clientId must be an integer';
      return null;
    }
  },
  status: {
    required: false,
    validate: (value) => {
      const validStatuses = ['active', 'inactive'];
      if (!validStatuses.includes(value)) return `status must be one of: ${validStatuses.join(', ')}`;
      return null;
    }
  }
};

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
    const error = rules.validate(value);
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

export const createProject = async (projectData) => {
  try {
    // Validate input data
    const validation = validateCreateData(projectData);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    // Set default status if not provided
    const dataToInsert = convertKeysToSnakeCase({
      ...projectData,
      status: projectData.status || 'active',
      createdAt: new Date()
    });

    const [result] = await connection('projects').insert(dataToInsert).returning('project_id');

    return { success: true, projectId: result.project_id };
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

export const getAllProjects = async () => {
  try {
    const projects = await connection('projects')
      .select('projects.*', 'clients.company_name as client_name')
      .leftJoin('clients', 'projects.client_id', 'clients.client_id');
    return convertKeysToCamelCase(projects);
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

export const getProjectById = async (projectId) => {
  try {
    const project = await connection('projects')
      .select('projects.*', 'clients.company_name as client_name')
      .leftJoin('clients', 'projects.client_id', 'clients.client_id')
      .where('projects.project_id', projectId)
      .first();
    return project ? convertKeysToCamelCase(project) : null;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

export const updateProject = async (projectId, updateData) => {
  try {
    // Remove system-managed fields if they exist
    const { projectId: id, createdAt, ...allowedUpdates } = updateData;

    // Validate the update data
    const validation = validateUpdateData(allowedUpdates);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
    
    const snakeCaseUpdates = convertKeysToSnakeCase(allowedUpdates);
    const updated = await connection('projects')
      .where('project_id', projectId)
      .update(snakeCaseUpdates);
    return updated > 0;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

export const deleteProject = async (projectId) => {
  try {
    const deleted = await connection('projects')
      .where('project_id', projectId)
      .del();
    return deleted > 0;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
}; 