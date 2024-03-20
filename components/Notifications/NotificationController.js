const {v4: uuidv4} = require('uuid');

let notifications = [];

const notifyUpdate = (message, description) => {
    const newNotification = {
        id: uuidv4(),
        message: message,
        description: description
    };
    notifications.unshift(newNotification);
    return newNotification;
};

const getNotifications = () => {
    return notifications;
};

const clearNotifications = () => {
    notifications = [];
};

const deleteNotification = (notificationId) => {
    const index = notifications.findIndex(notification => notification.id === notificationId);
    if (index !== -1) {
        notifications.splice(index, 1);
    }
};

module.exports = {notifyUpdate, getNotifications, clearNotifications, deleteNotification};