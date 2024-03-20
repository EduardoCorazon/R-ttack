const express = require('express');
const jwt = require('jsonwebtoken');
const {users, checkSession} = require('./Authentication');

const router = express.Router();

router.post('/login', (req, res) => {
    const {username, password} = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        const token = jwt.sign({user: {id: user.id, username: user.username}}, 'your-secret-key');
        res.cookie('token', token, {httpOnly: true, secure: process.env.NODE_ENV === 'production'});
        res.send({success: true, user: {id: user.id, username: user.username}});
    } else {
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
            }
        });
        res.status(401).send({success: false, message: 'Authentication failed'});
    }
});

router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).send({success: false, message: 'Internal server error'});
        } else {
            res.clearCookie('connect.sid');
            res.clearCookie('token');
            res.send({success: true});
        }
    });
});

// Protected route
router.get('/protected-route', checkSession, (req, res) => {
    res.send({success: true, message: 'Authenticated user', user: req.session.user});
});

// Protected route (more so used as a test)
router.get('/user', checkSession, (req, res) => {
    res.send({success: true, user: req.session.user});
});

module.exports = router;
