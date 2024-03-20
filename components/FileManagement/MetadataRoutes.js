const express = require('express');
const getFileMetadata = require('./GetFileMetadata');
const getAllFilesMetadata = require('./GetAllFilesMetadata')
const getAudio2Ch = require('./GetAudio2ChData');
const getAudioMp3 = require('./GetAudioMp3')
const getReferenceGuideList = require('./ReferenceGuideList')

const {exec} = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const fs = require('fs').promises;

const router = express.Router();

// set the last retrieved filename based on /api/getMetadata/:filename
let lastRetrievedFilename = null;
router.param('filename', (req, res, next, filename) => {
    lastRetrievedFilename = filename;
    next();
});

router.get('/api/getReferenceGuideList', async (req, res) => {
    try {
        const ReferenceGuide = await getReferenceGuideList();
        res.json(ReferenceGuide)
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});


// Get metadata for a specific file
router.get('/api/getMetadata/:filename', async (req, res) => {
    const filename = req.params.filename;
    try {
        const metadata = await getFileMetadata(filename);
        res.json(metadata);
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});


// Get audio data for the last retrieved filename
router.get('/api/getAudio2Ch', async (req, res) => {
    if (!lastRetrievedFilename) {
        return res.status(400).send('No filename specified');
    }
    try {
        const audioData = await getAudio2Ch(lastRetrievedFilename);
        res.json(audioData);
    } catch (error) {
        console.error(error)
        res.status(500).send('Internal Server Error');
    }
});

// Serve the MP3 file for the last retrieved filename
router.get('/api/getAudioMP3/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const audioData = await getAudioMp3(filename);
        res.setHeader('Content-Type', 'audio/mpeg');
        res.send(audioData);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Get metadata for all files
router.get('/api/getAllFilesMetadata', async (req, res) => {
    try {
        const allFilesMetadata = await getAllFilesMetadata();
        res.json(allFilesMetadata);
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

// Delete user capture
router.delete('/api/deleteUser/:username', async (req, res) => {
    const username = req.params.username;
    try {
        const {stdout, stderr} = await execPromise(`rm -r ./public/${username}`);
        if (stderr) {
            console.error(`Error deleting user ${username}: ${stderr}`);
            return res.status(500).send('Internal Server Error');
        }
        console.log(`User ${username} deleted successfully`);
        res.status(200).send('User deleted successfully');
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Delete device from ReferenceGuide.json
router.delete('/api/deleteDeviceReference/:device', async (req, res) => {
    const deviceId = parseInt(req.params.device);
    try {
        const filePath = './UserList/UserList.json';
        const data = await fs.readFile(filePath, 'utf-8');
        const devices = JSON.parse(data);
        const deviceIndex = devices.findIndex(device => device.id === deviceId);
        if (deviceIndex !== -1) {
            devices.splice(deviceIndex, 1);
            await fs.writeFile(filePath, JSON.stringify(devices, null, 2), 'utf-8');
            console.log(`Device with ID ${deviceId} deleted successfully`);
            res.status(200).send(`Device with ID ${deviceId} deleted successfully`);
        } else {
            console.error(`Device with ID ${deviceId} not found`);
            res.status(404).send(`Device with ID ${deviceId} not found`);
        }
    } catch (error) {
        console.error('Error deleting device:', error);
        res.status(500).send('Internal Server Error');
    }
});


// Add device to ReferenceGuide.json
router.post('/api/addDeviceReference', async (req, res) => {
    try {
        const filePath = './UserList/UserList.json';
        const data = await fs.readFile(filePath, 'utf-8');
        const devices = JSON.parse(data);
        const newDeviceData = req.body;
        // Assign a unique ID (assuming 'id' is not provided in the request body)
        // Not sure if I should use same scheme as RTL_Menu?
        /*
        let captureCounter = 0;
    function generateUniqueID() {
        const timestamp = Date.now();
        const uniqueID = `${recordIqFilename}_${timestamp}_${captureCounter}`;
        captureCounter += 1;
        return uniqueID;
    } */
        // For now this basic mapping works
        const uniqueId = Math.max(...devices.map(device => device.id), 0) + 1;
        newDeviceData.id = uniqueId;
        devices.push(newDeviceData);
        await fs.writeFile(filePath, JSON.stringify(devices, null, 2), 'utf-8');
        console.log('Device added successfully');
        res.status(201).json(newDeviceData);
    } catch (error) {
        console.error('Error adding device:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;