const Https = require("https");

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
            Logger.error(`Error ${res.statusCode}: ${data.error}`);
            reject(data.error);
          } else {
            Logger.log(`Response from ${options.path.substring(0, options.path.indexOf('?'))}: ${res.statusCode}`);
            resolve(data);
          }
        });
      });
  
      req.end();
    });
  }
};
