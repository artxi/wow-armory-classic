const Logger = require('./logger');
const Database = require('./database');
const WarcraftLogs = require('./warcraftlogs');

module.exports = {

  /**
   * User requests a new report
   * @param {string} reportCode from the Warcraft Logs URL
   */
  async parseNewReport(reportCode) {
    // Check if we have this report
    let report = await Database.findOne('reports', {code: reportCode});

    // If not, request report to Warcraft Logs
    if (!report) {
      report = await this.requestNewReport(reportCode);
    }

    // Return a summary so the user can choose a fight
    return WarcraftLogs.getReportSummary(report);
  },

  /**
   * Request a report to Warcraft Logs API and save it to our database
   * @param {string} reportCode from the Warcraft Logs URL
   */
  async requestNewReport(reportCode) {
    const newReportData = await WarcraftLogs.requestReport(reportCode);

    // Add the report code
    const dataToSave = {
      code: reportCode,
      data: newReportData
    };

    await Database.insertOne('reports', dataToSave);

    // We return this to display a summary
    return dataToSave;
  }
};
