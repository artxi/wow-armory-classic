const Logger = require('./logger');
const WarcraftLogs = require('./warcraftlogs');

module.exports = {

  async getCharacterGear(characterName, realmName, regionCode) {
    // TO-DO: First check if data is available in DB
    return WarcraftLogs.requestCharacterGear(characterName, realmName, regionCode)
  }
};
