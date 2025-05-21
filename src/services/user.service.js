import knex from 'knex';
import { hash } from 'bcrypt';

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
  // Validation, password hashing, database operations
  // Return user without sensitive data
  const { firstName, lastName, email, password } = userData;
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
        // const existingUser = await connection('users').where({ email: email.toLowerCase().trim() }).first();
        // if (existingUser) {
        //   errors.push({ field: 'email', message: 'Email already in use' });
        // }
      }
    }
    
    if (!password) {
      errors.push({ field: 'password', message: 'Password is required' });
    } else if (password.length < 8) {
      errors.push({ field: 'password', message: 'Password must be at least 8 characters long' });
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
      return res.status(400).json({ errors });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await hash(password, saltRounds);

    // Insert user into database using Knex
    await connection('users').insert({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      user_role: "user",
      created_at: new Date()
    }).returning('user_id');
}