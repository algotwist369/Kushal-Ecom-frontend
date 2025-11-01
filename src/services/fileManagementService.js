import api from '../api/axiosConfig';

// Get upload statistics
export const getUploadStats = async () => {
    try {
        const response = await api.get('/files/stats');
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch upload stats'
        };
    }
};

// Get files in directory
export const getDirectoryFiles = async (directory) => {
    try {
        const response = await api.get(`/files/directory/${directory}`);
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch directory files'
        };
    }
};

// Get file info
export const getFileInfo = async (directory, filename) => {
    try {
        const response = await api.get(`/files/file/${directory}/${filename}`);
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch file info'
        };
    }
};

// Delete file
export const deleteFile = async (directory, filename) => {
    try {
        const response = await api.delete(`/files/file/${directory}/${filename}`);
        return {
            success: true,
            message: response.data.message || 'File deleted successfully'
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to delete file'
        };
    }
};

// Clean old files
export const cleanOldFiles = async (days = 30) => {
    try {
        const response = await api.post(`/files/clean?days=${days}`);
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to clean old files'
        };
    }
};

