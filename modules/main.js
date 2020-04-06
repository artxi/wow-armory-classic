const Logger = require('./logger');
const WarcraftLogs = require('./warcraftlogs');
const Item = require('./item');
const Character = require('./character');

module.exports = {

  /**
   * User requests a new report
   * @param {string} reportCode from the Warcraft Logs URL
   */
  async parseNewReport(reportCode) {

    return WarcraftLogs.getReportSummary(reportCode);
  },

  /**
   * Return raw item data
   * @param {string} itemId from the Warcraft Logs URL
   */
  async getItem(itemId) {
    
    return Item.getItem(itemId);
  },

  /**
   * Return character data
   * @param {string} server will check lowerCase to lowerCase
   * @param {string} characterName will check lowerCase to lowerCase
   */
  async getCharacter(server, characterName) {
    
    return Character.getCharacter(server, characterName);
  },

  /**
   * User selected a fight to parse from the report
   * @param {string} reportCode from the Warcraft Logs URL
   * @param {string} bossId chosen by the user from the fight options
   */
  async parseFightFromReport(reportCode, bossId) {
    const fightData = await WarcraftLogs.requestFightData(reportCode, bossId);

    // No need to return data. Redirect user once done
    await WarcraftLogs.parseFightData(fightData, reportCode);
  }
};
