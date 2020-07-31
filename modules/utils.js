const Https = require('https');
const Json2Csv = require('json2csv');

const Logger = require('./logger');

module.exports = {
  parseIp(string) {
    return string.substring(string.indexOf(':', 3) + 1);
  },

  async httpGet(options) {
    return new Promise((resolve, reject) => {
      Logger.log(`Request to ${options.path.substring(0, options.path.indexOf('?'))}`);
  
      const req = Https.request(options, res => {
        let parts = [];
        req.on('error', err => {
          callback(err);
        });
  
        res.on("data", part => {
          parts.push(part);
        });
  
        res.on("end", () => {
          let data = Buffer.concat(parts);
          data = JSON.parse(data);
  
          if (res.statusCode < 200 || res.statusCode >= 300) {
            Logger.error(`Error ${res.statusCode}: ${data.error || data.detail}`);
            reject(data);
          } else {
            Logger.log(`Response from ${options.path.substring(0, options.path.indexOf('?'))}: ${res.statusCode}`);
            resolve(data);
          }
        });
      });
  
      req.end();
    });
  },

  formatJsonToCsv(jsonData, fields) {
    const opts = {fields, delimiter: ';', excelStrings: true, withBOM: true};
  
    try {
      return Json2Csv.parse(jsonData, opts);
    } catch (err) {
      Logger.error(err);
    }
  }
};

