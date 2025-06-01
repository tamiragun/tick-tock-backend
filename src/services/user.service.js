import knex from 'knex';
import bcrypt from 'bcrypt';
import { convertKeysToCamelCase } from '../utils/case-converter.js';

let connection;
const config = {
  client: 'sqlite3',
  connection: {
      filename: './data/ticktock.sqlite',
  },
  useNullAsDefault: true,
}
connection = knex(config);

export const createUser = async (userData) => {
  try {
    const { firstName, lastName, email, password } = userData;
    const errors = [];

    // Validation
    if (!firstName || firstName.trim() === '') {
      errors.push('First name is required');
    }
    
    if (!lastName || lastName.trim() === '') {
      errors.push('Last name is required');
    }
    
    if (!email || email.trim() === '') {
      errors.push('Email is required');
    } else {
      // Basic email validation using regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push('Please provide a valid email');
      } else {
        // Check if email already exists
        // const existingUser = await connection('users').where({ email: email.toLowerCase().trim() }).first();
        // if (existingUser) {
        //   errors.push({ field: 'email', message: 'Email already in use' });
        // }
      }
    }
    
    if (!password) {
      errors.push('Password is required');
    } else if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    } else {
      // Check password complexity
      // const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/;
      // if (!passwordRegex.test(password)) {
      //   errors.push({ 
      //     field: 'password', 
      //     message: 'Password must include one uppercase letter, one lowercase letter, one number, and one special character' 
      //   });
      // }
    }

    // Return validation errors if any
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
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

    console.log("User added successfully");
    return { success: true, userId: result.user_id };
  } catch (error) {
    if (error.message.startsWith('Validation failed:')) {
      throw error;
    }
    throw new Error(`Database error: ${error.message}`);
  }
}

export const findUserByEmail = async (email) => {
  try {
    const user = await connection('users')
      .where({ email })
      .first();
    return user;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

export const validatePassword = async (plainPassword, hashedPassword) => {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    throw new Error(`Password validation error: ${error.message}`);
  }
};

export const authenticateUser = async (email, password) => {
  try {
    // Find user by email
    const user = await findUserByEmail(email);
    
    if (!user) {
      return { success: false, message: 'Invalid email or password' };
    }

    // Validate password
    const isPasswordValid = await validatePassword(password, user.password);
    
    if (!isPasswordValid) {
      return { success: false, message: 'Invalid email or password' };
    }

    // Remove password from user object before returning
    const { password: _, ...userWithoutPassword } = user;
    
    console.log("Logged in");
    return { 
      success: true, 
      message: 'Login successful',
      user: convertKeysToCamelCase(userWithoutPassword)
    };
  } catch (error) {
    throw new Error(`Authentication error: ${error.message}`);
  }
};