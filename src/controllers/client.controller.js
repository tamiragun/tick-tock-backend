import { createClient, getAllClients, getClientById, updateClient, deleteClient } from '../services/client.service.js';

export const create = async (req, res) => {
    try {
        const { user_id, company_name } = req.body;
        
        const result = await createClient({ user_id, company_name });
        res.status(201).json({
            success: true,
            message: 'Client created successfully',
            clientId: result.clientId
        });
    } catch (error) {
        console.error('Create client error:', error);
        
        // Handle validation errors separately from other server errors
        if (error.message.startsWith('Validation failed:')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        res.status(500).json({ 
            success: false,
            message: 'Server error during client creation' 
        });
    }
};

export const getAll = async (req, res) => {
    try {
        const clients = await getAllClients();
        res.status(200).json({
            success: true,
            clients
        });
    } catch (error) {
        console.error('Get all clients error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error while fetching clients' 
        });
    }
};

export const getOne = async (req, res) => {
    try {
        const { id } = req.params;
        const client = await getClientById(id);
        
        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Client not found'
            });
        }

        res.status(200).json({
            success: true,
            client
        });
    } catch (error) {
        console.error('Get client error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error while fetching client' 
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

        const success = await updateClient(id, req.body);
        
        if (!success) {
            return res.status(404).json({
                success: false,
                message: 'Client not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Client updated successfully'
        });
    } catch (error) {
        console.error('Update client error:', error);
        
        // Handle validation errors separately from other server errors
        if (error.message.startsWith('Validation failed:')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        res.status(500).json({ 
            success: false,
            message: 'Server error while updating client' 
        });
    }
};

export const remove = async (req, res) => {
    try {
        const { id } = req.params;
        const success = await deleteClient(id);
        
        if (!success) {
            return res.status(404).json({
                success: false,
                message: 'Client not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Client deleted successfully'
        });
    } catch (error) {
        console.error('Delete client error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error while deleting client' 
        });
    }
}; 