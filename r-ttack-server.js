
// imports
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const cors = require('cors');
const ip = require('ip')
// routes (components)
const routes = require('./components/Authentication/AuthRoutes.js');
const RTL_MenuRoutes = require('./components/Rtl-sdr/RTL_MenuRoutes')
const Metadata_Routes = require('./components/FileManagement/MetadataRoutes')
const SystemCheck_Routes = require('./components/SystemCheck/SystemCheckRoutes');
const Notification_Routes = require('./components/Notifications/NotificationRoutes')

// settings
const app = express();
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        // Extract the IP address from the origin
        const originIP = new URL(origin).hostname;
        // Check if the request origin IP is a private IP address
        if (ip.isPrivate(originIP)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true, // Enable credentials (cookies, headers, etc.)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS', // Include OPTIONS method
};
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
    secret: 'your-secret-key', // will change this in full production
    resave: true,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Enable secure cookie in production
        sameSite: 'strict',
    },
}));
app.use((req, res, next) => {
    const requestOrigin = req.headers.origin;
    if (requestOrigin) {
        const originIP = new URL(requestOrigin).hostname;
        if (ip.isPrivate(originIP)) {
            res.setHeader('Access-Control-Allow-Origin', requestOrigin);
            res.setHeader('Access-Control-Allow-Credentials', true);
        }
    }
    next();
});

// Use Routes (components)
app.use('/', routes);
// For RLT Menu
app.use('/', RTL_MenuRoutes);
// For File Metadata
app.use('/', Metadata_Routes);
// For SystemCheck
app.use('/', SystemCheck_Routes);
// For Notifications
app.use('/', Notification_Routes);

// Run server
const PORT = process.env.PORT || 3200;
app.listen(PORT, () => {
    console.log(`R-ttack server is running on port ${PORT}`);
});
