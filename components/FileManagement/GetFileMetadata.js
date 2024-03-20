const fs = require('fs').promises;

async function getFileMetadata(filename) {
    const metadataFilename = `${filename}_metadata.json`;
    try {
        const metadata = await fs.readFile(`./public/${filename}/${metadataFilename}`, 'utf-8');
        return JSON.parse(metadata);
    } catch (error) {
        console.error(`Error reading metadata file: ${error.message}`);
        throw new Error('Metadata not found');
    }
}

module.exports = getFileMetadata;