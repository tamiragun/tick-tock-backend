import { createUser } from '../services/user.service.js';

export const register = async (req, res, next) => {
    try {
        await createUser(req.body);
        console.log("User added");
        res.status(201).json({
            message: 'User registered successfully',
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
        //next(error);
    }
}