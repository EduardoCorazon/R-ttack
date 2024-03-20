const fs = require('fs').promises;

async function getAllFilesMetadata() {
    const publicDir = './public';
    try {
        const directories = await fs.readdir(publicDir);
        const metadataPromises = directories.map(async (directory) => {
            const metadataFilename = `${directory}/${directory}_metadata.json`;
            const metadata = await fs.readFile(`${publicDir}/${metadataFilename}`, 'utf-8');
            return {
                directory,
                metadata: JSON.parse(metadata),
            };
        });
        const metadataList = await Promise.all(metadataPromises);
        return metadataList;
    } catch (error) {
        console.error(`Error reading directory: ${error.message}`);
        throw new Error('Error retrieving file metadata');
    }
}

module.exports = getAllFilesMetadata;
