import api from '../api/axiosConfig';

// Get all notifications
export const getAllNotifications = async (params = {}) => {
    try {
        const response = await api.get('/notifications', { params });
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch notifications'
        };
    }
};

// Get notification stats
export const getNotificationStats = async () => {
    try {
        const response = await api.get('/notifications/stats');
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch notification stats'
        };
    }
};

// Mark notification as read
export const markAsRead = async (notificationId) => {
    try {
        const response = await api.patch(`/notifications/${notificationId}/read`);
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to mark as read'
        };
    }
};

// Mark all notifications as read
export const markAllAsRead = async () => {
    try {
        const response = await api.patch('/notifications/mark-all-read');
        return {
            success: true,
            message: response.data.message
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to mark all as read'
        };
    }
};

// Delete notification
export const deleteNotification = async (notificationId) => {
    try {
        const response = await api.delete(`/notifications/${notificationId}`);
        return {
            success: true,
            message: response.data.message
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to delete notification'
        };
    }
};

// Send welcome email to user
export const sendWelcomeEmail = async (userId) => {
    try {
        const response = await api.post(`/notifications/welcome/${userId}`);
        return {
            success: true,
            message: response.data.message
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to send welcome email'
        };
    }
};

// Send order confirmation email
export const sendOrderConfirmation = async (orderId) => {
    try {
        const response = await api.post(`/notifications/order-confirmation/${orderId}`);
        return {
            success: true,
            message: response.data.message
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to send order confirmation'
        };
    }
};

// Send order status update notification
export const sendOrderStatusUpdate = async (orderId, status) => {
    try {
        const response = await api.post(`/notifications/order-status/${orderId}`, { status });
        return {
            success: true,
            message: response.data.message
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to send status update'
        };
    }
};

// Send bulk notification
export const sendBulkNotification = async (notificationData) => {
    try {
        const response = await api.post('/notifications/bulk', notificationData);
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to send bulk notification'
        };
    }
};

