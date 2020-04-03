const Logger = require('./logger');
const Settings = require('../config/settings');
const Utils = require('./utils.js');

module.exports = {

  /**
   * Request creature data to Wow Classic API and save it to our database
   * @param {string} creatureId from the Warcraft Logs URL
   */
  async requestCreature(creatureId) {
    const path = `/data/wow/creature/${creatureId}`;

    return request(path);
  }
};

async function request(path) {
  const options = {
    "method": "GET",
    "hostname": "us.api.blizzard.com",
    "path": `${path}?namespace=static-classic-us&locale=en_US&access_token=${Settings.blizzardClient.accessToken}`,
    "headers": {
      "cache-control": "no-cache"
    }
  };

  return Utils.httpGet(options);
}
