const Logger = require('./logger');
const WarcraftLogs = require('./warcraftlogs');
const Database = require('./database');

module.exports = {

  async parseNewReport(res, reportCode) {
    // Check if we have this report
    const reportExists = await Database.findOne('reports', {code: reportCode});

    if (reportExists) {
      throw new Error('This report is already in our database');
    }

    // If not, retrieve data from Warcraft Logs
    const newReportData = await WarcraftLogs.requestNewReport(reportCode);

    // Save report data to database
    await Database.insertOne('reports', {
      code: reportCode,
      data: newReportData
    });

    return 'OK';
  }
};
