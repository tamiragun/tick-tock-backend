import { createUser, authenticateUser } from '../services/user.service.js';
import jwt from 'jsonwebtoken'; 

export const register = async (req, res) => {
    try {
        await createUser(req.body);
        console.log("User added");
        res.status(201).json({
            message: 'User registered successfully',
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
}

export const login = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }
  
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address'
        });
      }
  
      // Authenticate user
      const authResult = await authenticateUser(email, password);
  
      if (!authResult.success) {
        return res.status(401).json({
          success: false,
          message: authResult.message
        });
      }
  
      // Generate JWT token
      let token = null;
      if (process.env.JWT_SECRET) {
        token = jwt.sign(
          { 
            userId: authResult.user.id, 
            email: authResult.user.email 
          },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        );
      }
  
      // Successful login response
      const response = {
        success: true,
        message: authResult.message,
        user: authResult.user
      };
  
      if (token) {
        response.token = token;
      }
  
      return res.status(200).json(response);
  
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
  