const express = require('express');
const {menuAction, stopProcesses, stopAttacks, setCaptureSettings, getLastItem} = require('./RTL_Menu');

const router = express.Router();

router.post('/setCaptureSettings', (req, res) => {
    const {frequency, sampleRate, gain, type, demodulation, fileName} = req.body;
    setCaptureSettings(frequency, sampleRate, gain, type, demodulation, fileName);
    res.json({success: true});
});

router.get('/stop', (req, res) => {
    stopProcesses();
    res.json({success: true});
});

router.get('/stopAttack', (req, res) => {
    stopAttacks();
    res.json({success: true});
});

router.get('/status', (req, res) => {
    res.json({lastItem: getLastItem()});
});

router.post('/menu', (req, res) => {
    const {choice} = req.body;
    menuAction(choice);
    res.json({success: true});
});

module.exports = router;