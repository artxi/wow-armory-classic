const Logger = require('./logger');
const WarcraftLogs = require('./warcraftlogs');
const Item = require('./item');

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
