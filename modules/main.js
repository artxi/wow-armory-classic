const Logger = require('./logger');
const WarcraftLogs = require('./warcraftlogs');
const Database = require('./database');

module.exports = {

  async parseNewReport(reportCode) {
    // Check if we have this report
    const report = await Database.findOne('reports', {code: reportCode});

    // If not, request report from Warcraft Logs
    if (!report) {
      await this.requestNewReport(reportCode);
    }

    // Continue
  },

  async requestNewReport(reportCode) {
    const newReportData = await WarcraftLogs.requestReport(reportCode);

    // Save report data to database
    await Database.insertOne('reports', {
      code: reportCode,
      data: newReportData
    });
  }
};
