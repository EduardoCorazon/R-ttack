const express = require('express');
const {notifyUpdate, getNotifications, clearNotifications, deleteNotification} = require('./NotificationController');

const router = express.Router();

router.post('/notify-update', (req, res) => {
    const {message, description} = req.body;
    const newNotification = notifyUpdate(message, description);
    res.json({status: 'Notification received', notification: newNotification});
});

router.get('/get-notifications', (req, res) => {
    const notifications = getNotifications();
    res.json(notifications);
});

router.post('/clear-notifications', (req, res) => {
    clearNotifications();
    res.json({status: 'Notifications cleared'});
});

router.post('/delete-notification', (req, res) => {
    const {id} = req.body;
    deleteNotification(id);
    res.json({status: 'Notification deleted', notificationId: id});
});

module.exports = router;