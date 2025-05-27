import { createSession, getAllSessions, getSessionById, updateSession, deleteSession } from '../services/session.service.js';

export const create = async (req, res) => {
    try {
        const result = await createSession(req.body);
        res.status(201).json({
            success: true,
            message: 'Session created successfully',
            sessionId: result.sessionId
        });
    } catch (error) {
        console.error('Create session error:', error);
        
        // Handle validation errors separately from other server errors
        if (error.message.startsWith('Validation failed:')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        res.status(500).json({ 
            success: false,
            message: 'Server error during session creation' 
        });
    }
};

export const getAll = async (req, res) => {
    try {
        const sessions = await getAllSessions();
        res.status(200).json({
            success: true,
            sessions
        });
    } catch (error) {
        console.error('Get all sessions error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error while fetching sessions' 
        });
    }
};

export const getOne = async (req, res) => {
    try {
        const { id } = req.params;
        const session = await getSessionById(id);
        
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        res.status(200).json({
            success: true,
            session
        });
    } catch (error) {
        console.error('Get session error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error while fetching session' 
        });
    }
};

export const update = async (req, res) => {
    try {
        const { id } = req.params;
        
        // If the request body is empty
        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No update data provided'
            });
        }

        const success = await updateSession(id, req.body);
        
        if (!success) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Session updated successfully'
        });
    } catch (error) {
        console.error('Update session error:', error);
        
        // Handle validation errors separately from other server errors
        if (error.message.startsWith('Validation failed:')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        res.status(500).json({ 
            success: false,
            message: 'Server error while updating session' 
        });
    }
};

export const remove = async (req, res) => {
    try {
        const { id } = req.params;
        const success = await deleteSession(id);
        
        if (!success) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Session deleted successfully'
        });
    } catch (error) {
        console.error('Delete session error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error while deleting session' 
        });
    }
}; 