import fs from 'fs';
import path from 'path';

const saveJson = (filePath, data) => {
    fs.writeFileSync(filePath, JSON.stringify(data), 'utf8');
};

export default saveJson;