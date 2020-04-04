const Logger = require('./logger');
const Database = require('./database');
const WarcraftLogs = require('./warcraftlogs');

module.exports = {

  /**
   * User requests a new report
   * @param {string} reportCode from the Warcraft Logs URL
   */
  async parseNewReport(reportCode, force) {

    return WarcraftLogs.getReportSummary(reportCode);
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
