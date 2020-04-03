const Logger = require('./logger');
const Settings = require('../config/settings');
const Utils = require('./utils.js');

module.exports = {

  /**
   * Request a report to Warcraft Logs API and save it to our database
   * @param {string} reportCode from the Warcraft Logs URL
   */
  async requestReport(reportCode) {
    const path = `/report/fights/${reportCode}`;

    return request(path);
  },

  /**
   * Create a summary so the user can choose a fight
   * @param {object} report a full report
   */
  async getReportSummary(report) {
    const reportSummary = {
      code: report.code,
      title: report.data.title,
      uploader: report.data.owner,
      date: report.data.end,
      fights: []
    };

    // Will probably need to sort by date
    for (const fight of report.data.fights) {
      if (fight.boss) {
        reportSummary.fights.push({
          id: fight.boss,
          name: fight.name
          // Add portrait
        });
      }
    }

    return reportSummary;
  }
};

async function request(path) {
  const options = {
    "method": "GET",
    "hostname": "classic.warcraftlogs.com",
    "port": 443,
    "path": `/v1${path}?api_key=${Settings.warcraftLogs.apiKey}`,
    "headers": {
      "cache-control": "no-cache"
    }
  };

  return Utils.httpGet(options);
}
