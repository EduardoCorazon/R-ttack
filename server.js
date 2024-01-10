// server.js settings
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5001;

// Api calls
const {checkRtlSdrInstallation} = require("./rtlSdrChecker");

app.use(cors());

// Test call (Remove in production)
app.get('/', (req, res) => {
    res.send('Backend called successfully!');
});


/* This is the general template we will follow, we just need to make meaningfull calls for R-ttack_Dashboards to use
app.get('/api', (req, res) => {
    res.send('Response from backend')
});
*/

// Check if rtl_sdr is installed
app.get('/api/check', async (req, res) => {
    try {
        const message = await checkRtlSdrInstallation();
        res.send(message);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
