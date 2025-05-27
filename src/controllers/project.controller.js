import { createProject, getAllProjects, getProjectById, updateProject, deleteProject } from '../services/project.service.js';

export const create = async (req, res) => {
    try {
        const result = await createProject(req.body);
        res.status(201).json({
            success: true,
            message: 'Project created successfully',
            projectId: result.projectId
        });
    } catch (error) {
        console.error('Create project error:', error);
        
        // Handle validation errors separately from other server errors
        if (error.message.startsWith('Validation failed:')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        res.status(500).json({ 
            success: false,
            message: 'Server error during project creation' 
        });
    }
};

export const getAll = async (req, res) => {
    try {
        const projects = await getAllProjects();
        res.status(200).json({
            success: true,
            projects
        });
    } catch (error) {
        console.error('Get all projects error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error while fetching projects' 
        });
    }
};

export const getOne = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await getProjectById(id);
        
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        res.status(200).json({
            success: true,
            project
        });
    } catch (error) {
        console.error('Get project error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error while fetching project' 
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

        const success = await updateProject(id, req.body);
        
        if (!success) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Project updated successfully'
        });
    } catch (error) {
        console.error('Update project error:', error);
        
        // Handle validation errors separately from other server errors
        if (error.message.startsWith('Validation failed:')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        res.status(500).json({ 
            success: false,
            message: 'Server error while updating project' 
        });
    }
};

export const remove = async (req, res) => {
    try {
        const { id } = req.params;
        const success = await deleteProject(id);
        
        if (!success) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Project deleted successfully'
        });
    } catch (error) {
        console.error('Delete project error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error while deleting project' 
        });
    }
}; 