const fs = require('fs').promises;
const path = require('path');

async function getAudioMp3(filename) {
    const audioFilePath = path.resolve(`./public/${filename}/${filename}.mp3`);
    try {
        const audioData = await fs.readFile(audioFilePath);
        return audioData;
    } catch (error) {
        console.error(`Error reading audio file: ${error.message}`);
        throw new Error('Audio file not found');
    }
}

module.exports = getAudioMp3;