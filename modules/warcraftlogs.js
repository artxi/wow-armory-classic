const Logger = require('./logger');
const Settings = require('../config/settings');
const Utils = require('./utils.js');
const Database = require('./database');
const Character = require('./character');

module.exports = {

  /**
   * Requests a full report if not present and parses data from all boss fights
   * @param {object} reportCode a full report
   */
  async loadNewReport(reportCode) {
    // Check if we have this report
    let reportExists = await Database.findOne('reports', {code: reportCode}, {_id: 1});

    if (reportExists) {
      return {message: 'This log is already in our database'};
    }

    // If not, request report to Warcraft Logs
    const report = await this.requestReport(reportCode);
    report.code = reportCode;

    const reportSummary = await this.createReportSummary(report);
    await Database.insertOne('reports', reportSummary);

    // Add gear from every fight to characters
    // TO-DO: Ideally we want to parse all fights asynchronously (Promise.all())
    // but atm it duplicates characters in DB. Re-think flow
    for (const fight of reportSummary.fights) {
      await this.parseFightData(fight.id, fight.name, reportSummary);
    }

    // Don't need this on response
    // Probably don't even need response
    delete reportSummary._id;
    delete reportSummary.characters;

    return reportSummary;
  },

  /**
   * Retrieves fight logs and processes all character gear data
   * @param {number} bossId id of the boss fight to parse
   * @param {string} bossName to insert in each gear set
   * @param {object} reportSummary from the full report
   * @param {number} reportDate date from the report
   */
  async parseFightData(bossId, bossName, reportSummary) {
    const fightData = await this.requestFightData(bossId, reportSummary);
    const characterGearData = fightData.events.filter(e => e.type === 'combatantinfo');
    const characterData = reportSummary.characters;

    const promises = [];
    
    for (const character of characterData) {
      const characterGear = characterGearData.find(c => c.sourceID === character.id);
      if (characterGear) {
        const gearSet = characterGear.gear;
        promises.push(Character.addGearSet(character, gearSet, reportSummary.date, bossName, bossId));
      }
    }

    await Promise.all(promises);
  },

  /**
   * Request a fight log from Warcraft Logs API
   * @param {string} bossId chosen by the user from the fight options
   * @param {object} fullReport from Warcraft Logs
   */
  async requestFightData(bossId, fullReport) {
    const fight = fullReport.fights.find(f => f.id === bossId);
    const path = `/report/events/summary/${fullReport.code}?start=${fight.startTime}&end=${fight.endTime}&hostility=0&`;

    return request(path);
  },

  /**
   * Request a report to Warcraft Logs API and save it to our database
   * @param {string} reportCode from the Warcraft Logs URL
   */
  async requestReport(reportCode) {
    const path = `/report/fights/${reportCode}?`;

    return request(path);
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
          // Add portrait if possible
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
