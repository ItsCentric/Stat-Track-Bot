const fs = require('fs');
const valAPI = require('unofficial-valorant-api');

const getFiles = (path, ending) => {
    return fs.readdirSync(path).filter(f=> f.endsWith(ending))
}

const convertDuration = (duration, callback) => {
    const seconds = duration / 1000
    let durationSeconds = Math.round(seconds % 60);
    const durationMinutes = Math.round((seconds - durationSeconds) / 60)
  
    if (durationSeconds < 10) {
      durationSeconds = String(durationSeconds / 10);
      durationSeconds = durationSeconds[0] + durationSeconds[2]
    }
    let newDuration = `${durationMinutes}:${durationSeconds}`
    callback(newDuration)
}

function roundTo(n, digits) {
    if (digits === undefined) {
      digits = 0;
    }
  
    var multiplicator = Math.pow(10, digits);
    n = parseFloat((n * multiplicator).toFixed(11));
    var test =(Math.round(n) / multiplicator);
    return +(test.toFixed(digits));
}

function regionStringConverter(regionCode) {
  let regionString;
  
  switch(regionCode) {
    case 'na':
      regionString = 'North America';
      break;
    case 'eu':
      regionString = 'Europe';
      break;
    case 'kr':
      regionString = 'Korea';
      break;
    case 'ap':
      regionString = 'Asia-Pacific';
      break;
  }

  return regionString;
}

module.exports = { getFiles, convertDuration, roundTo, regionStringConverter }