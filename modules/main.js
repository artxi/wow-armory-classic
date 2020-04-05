const Logger = require('./logger');
const Database = require('./database');
const WarcraftLogs = require('./warcraftlogs');
const Blizzard = require('./blizzard');

module.exports = {

  /**
   * User requests a new report
   * @param {string} reportCode from the Warcraft Logs URL
   */
  async parseNewReport(reportCode) {

    return WarcraftLogs.getReportSummary(reportCode);
  },

  /**
   * Gets item data from database or Blizzard API
   * @param {string} itemId from the Warcraft Logs URL
   */
  async getItem(itemId) {
    let item = await Database.findOne('items', {id: parseInt(itemId)});

    if (!item) {
      item = await Blizzard.requestItem(itemId);
      Database.insertOne('items', item);
    }

    return item;
  },

  /**
   * User selected a fight to parse from the report
   * @param {string} reportCode from the Warcraft Logs URL
   * @param {string} bossId chosen by the user from the fight options
   */
  async parseFightFromReport(reportCode, bossId) {
    const fightData = await WarcraftLogs.requestFightData(reportCode, bossId);

    // No need to return data. Redirect user once done
    await WarcraftLogs.parseFightData(fightData);
  }
};
