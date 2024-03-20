const fs = require('fs').promises;

async function getReferenceGuideList() {
    try {
        const ReferenceGuideJson = await fs.readFile(`./ReferenceGuide/ReferenceGuide.json`, 'utf-8');
        return JSON.parse(ReferenceGuideJson);
    } catch (error) {
        console.error(`Error reading metadata file: ${error.message}`);
        throw new Error('Metadata not found');
    }
}

module.exports = getReferenceGuideList;