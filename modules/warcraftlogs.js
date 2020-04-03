const Https = require("https");

const Logger = require('./logger');
const Settings = require('../config/settings');

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
  return new Promise((resolve, reject) => {
    const options = {
      "method": "GET",
      "hostname": "classic.warcraftlogs.com",
      "port": 443,
      "path": `/v1${path}?api_key=${Settings.warcraftLogs.apiKey}`,
      "headers": {
        "cache-control": "no-cache"
      }
    };

    Logger.log(`Request to ${path}`);

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
          Logger.log(`Response from ${path}: ${res.statusCode}`);
          resolve(data);
        }
      });
    });

    req.end();
  });
}
