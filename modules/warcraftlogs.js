const Https = require("https");

const Logger = require('./logger');
const Settings = require('../config/settings');

module.exports = {

  async requestNewReport(reportId) {
    const path = `/report/fights/${reportId}`;

    return request(path);
  }
};

async function request(path) {
  return new Promise ((resolve, reject) => {
    const options = {
      "method": "GET",
      "hostname": "classic.warcraftlogs.com",
      "port": 443,
      "path": `/v1${path}?api_key=${Settings.warcraftLogs.apiKey}`,
      "headers": {
        "cache-control": "no-cache"
      }
    };

    Logger.log(`Request to ${path}`)

    const req = Https.request(options, function(res) {
      let parts = [];
      req.on('error', function(err) {
        callback(err);
      });

      res.on("data", function(part) {
        parts.push(part);
      });

      res.on("end", function() {
        let data = Buffer.concat(parts);
        data = JSON.parse(data);

        if (res.statusCode < 200 || res.statusCode >= 300) {
          Logger.error(new Error(res.statusCode + ' - ' + data.error));
          resolve(data.error);
        }
        else {
          Logger.log(`Response from ${path}: ${res.statusCode}`)
          resolve(data);
        }
      });
    });

    req.end();
  });
}
