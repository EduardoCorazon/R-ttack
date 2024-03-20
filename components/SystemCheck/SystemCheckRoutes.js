// routes.js
const express = require('express');
const {
    checkRtlSdrInstallation,
    checkSoxInstallation,
    checkFfmpegInstallation,
    checkLCJSVerification
} = require('./CheckRTL_Installed');

const router = express.Router();

// Check if rtl_sdr is installed
router.get('/api/SystemCheck/rtl_sdr', async (req, res) => {
    try {
        const message = await checkRtlSdrInstallation();
        res.status(200).json({message});
    } catch (error) {
        console.error(error);
        res.status(500).json({error: error.message || 'rtl_sdr is not installed on the system'});
    }
});

// Check if sox is installed
router.get('/api/SystemCheck/sox', async (req, res) => {
    try {
        const message = await checkSoxInstallation();
        res.status(200).json({message});
    } catch (error) {
        console.error(error);
        res.status(500).json({error: error.message || 'sox is not installed on the system'});
    }
});

// Check if ffmpeg is installed
router.get('/api/SystemCheck/ffmpeg', async (req, res) => {
    try {
        const message = await checkFfmpegInstallation();
        res.status(200).json({message});
    } catch (error) {
        console.error(error);
        res.status(500).json({error: error.message || 'ffmpeg is not installed on the system'});
    }
});

// Check LightningChartJs activation
router.get('/api/SystemCheck/lightningchart', async (req, res) => {
    try {
        const message = await checkLCJSVerification();
        res.status(200).json({message});
    } catch (error) {
        console.error(error);
        res.status(500).json({error: error.message || 'LightningChartJs is not activated on the system'});
    }
});

module.exports = router;