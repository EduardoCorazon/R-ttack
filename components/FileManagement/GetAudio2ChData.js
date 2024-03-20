const fs = require('fs').promises;

async function getAudio2Ch(filename) {
    const audioFilename = `${filename}_audio2ch.json`;
    try {
        const audioData = await fs.readFile(`./public/${filename}/${audioFilename}`, 'utf-8');
        return JSON.parse(audioData);
    } catch (error) {
        console.error(`Error reading audio file: ${error.message}`);
        throw new Error('Audio file not found');
    }
}

module.exports = getAudio2Ch;