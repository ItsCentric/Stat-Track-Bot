const fs = require('fs');
const valAPI = require('unofficial-valorant-api');

const getFiles = (path, ending) => {
    return fs.readdirSync(path).filter(f=> f.endsWith(ending))
}

module.exports = { getFiles }