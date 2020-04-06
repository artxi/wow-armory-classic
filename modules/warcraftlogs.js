const Logger = require('./logger');
const Settings = require('../config/settings');
const Utils = require('./utils.js');
const Database = require('./database');
const Character = require('./character');

module.exports = {

  /**
   * Request a report to Warcraft Logs API and save it to our database
   * @param {string} reportCode from the Warcraft Logs URL
   */
  async requestReport(reportCode) {
    const path = `/report/fights/${reportCode}?`;

    return request(path);
  },

  /**
   * Request a fight log from Warcraft Logs API
   * @param {string} reportCode from the Warcraft Logs URL
   * @param {string} bossId chosen by the user from the fight options
   */
  async requestFightData(reportCode, bossId) {
    const fullReport = await Database.findOne('reports', {code: reportCode});
    const fight = fullReport.fights.find(f => f.id === bossId);

    const path = `/report/events/summary/${reportCode}?start=${fight.starTime}&end=${fight.endTime}&hostility=0&`;

    return request(path);
  },

  /**
   * 
   * @param {object} fightData a fight event from Warcraft Logs API
   * @param {string} reportCode from the Warcraft Logs URL
   */
  async parseFightData(fightData, reportCode) {
    // Save character data to database
    const characterGearData = fightData.events.filter(e => e.type === 'combatantinfo');
    const characterData = await Database.findOne('reports', {code: reportCode}, {_id: 0, characters: 1});

    const promises = [];
    
    for (const character of characterData.characters) {
      const characterGear = characterGearData.find(c => c.sourceID === character.id);
      if (characterGear) {
        const gear = characterGear.gear;
        promises.push(Character.updateCharacter(character, gear));
      }
    }

    await Promise.all(promises);
  },

  /**
   * Get a report summary so the user can choose a fight
   * @param {object} report a full report
   */
  async getReportSummary(reportCode) {
    // Check if we have this report
    let reportSummary = await Database.findOne('reports', {code: reportCode});

    // If not, request report to Warcraft Logs
    if (!reportSummary) {
      const report = await this.requestReport(reportCode);
      report.code = reportCode;

      reportSummary = await this.createReportSummary(report);
      Database.insertOne('reports', reportSummary);
    } else {
      // If the report was already parsed
      // warn the user a new fight parse will erase previous data
      reportSummary.alreadyParsed = true;
    }

    delete reportSummary._id;
    delete reportSummary.characters;
    
    return reportSummary;
  },

  /**
   * Create a report summary so the user can choose a fight
   * @param {object} report a full report
   */
  async createReportSummary(report) {
    const reportSummary = {
      code: report.code,
      title: report.title,
      uploader: report.owner,
      date: report.end,
      characters: report.friendlies.filter(f => {
        delete f.fights;
        return f.type !== 'Boss'
      }),
      fights: []
    };

    // Will probably need to sort by date
    for (const fight of report.fights) {
      if (fight.boss) {
        reportSummary.fights.push({
          id: fight.boss,
          name: fight.name,
          startTime: fight.start_time,
          endTime: fight.end_time
          // Add portrait
        });
      }
    }

    return reportSummary;
  }
};

/**
 * Prepare path for request
 * @param {string} path for api
 */
async function request(path) {
  const options = {
    "method": "GET",
    "hostname": "classic.warcraftlogs.com",
    "port": 443,
    "path": `/v1${path}api_key=${Settings.warcraftLogs.apiKey}`,
    "headers": {
      "cache-control": "no-cache"
    }
  };

  return Utils.httpGet(options);
}
