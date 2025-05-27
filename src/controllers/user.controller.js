import { createUser, authenticateUser } from '../services/user.service.js';
import jwt from 'jsonwebtoken'; 

export const register = async (req, res) => {
    try {
        const result = await createUser(req.body);
        
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            userId: result.userId
        });
    } catch (error) {
        console.error('Registration error:', error);
        
        // Handle validation errors separately from other server errors
        if (error.message.startsWith('Validation failed:')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        res.status(500).json({ 
            success: false,
            message: 'Server error during registration' 
        });
    }
};

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
  