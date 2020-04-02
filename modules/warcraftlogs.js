const Https = require("https");

const Logger = require('./logger');
const Settings = require('../config/settings');

module.exports = {

  async requestCharacterGear(playerName, realmName, regionCode) {
    const parses = await this.getPlayerParses(playerName, realmName, regionCode);

    const vaelastraszParses = parses.filter(p => p.encounterID === 611);
    const lastParse = vaelastraszParses.sort((a, b) => {return b.startTime - a.startTime})[0];

    return lastParse.gear;
  },

  async getPlayerParses(playerName, realmName, regionCode) {
    const path = `/parses/character/${playerName}/${realmName}/${regionCode}`;

    return request(path);
  }

};

async function request(path) {
  return new Promise ((resolve, reject) => {
    const options = {
      "method": "GET",
      "hostname": "classic.warcraftlogs.com",
      "port": 443,
      "path": `/v1${path}?api_key=${Settings.warcraftLogsKey}`,
      "headers": {
        "cache-control": "no-cache"
      }
    };

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
          reject();
        }
        else {
          resolve(data);
        }
      });
    });

    req.end();
  });
}
