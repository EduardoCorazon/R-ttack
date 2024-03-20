const jwt = require('jsonwebtoken');

// currently there is no need for multiple users
const users = [
    {id: 1, username: 'admin', password: 'password'},
    /*{ id: 2, username: 'user2', password: 'password2' },*/
];

const checkSession = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).send({success: false, message: 'Unauthorized'});
    }
    try {
        // Verify the token using the secret key
        const decoded = jwt.verify(token, 'your-secret-key');
        req.session.user = decoded.user;
        next();
    } catch (error) {
        return res.status(401).send({success: false, message: 'Unauthorized'});
    }
};

module.exports = {users, checkSession};
