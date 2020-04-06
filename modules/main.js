const Logger = require('./logger');
const WarcraftLogs = require('./warcraftlogs');
const Item = require('./item');
const Character = require('./character');
const Database = require('./database');
const Utils = require('./utils.js');

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
   * Return character data
   * @param {string} server will check lowerCase to lowerCase
   * @param {string} characterName will check lowerCase to lowerCase
   */
  async getCharacter(server, characterName) {
    
    return Character.getCharacter(server, characterName);
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
  },

  async getCsv() {
    let characterData = await Database.find('characters', {});

    const slots = ['head', 'neck', 'shoulder', 'chest', 'waist', 'legs', 'feet', 'wrist',
      'hand', 'ring1', 'ring2', 'trinket1', 'trinket2', 'back', 'weapon1', 'weapon2', 'ranged'];

    const fields = ['S.No', 'name', 'class', ...slots];

    const jsonData = [];

    let count = 1;
    for (const character of characterData) {
      const gearLine = {
        'S.No': count++,
        'name': character.name,
        'class': character.class
      };

      const enchantsLine = {
        'S.No': count++,
        'name': character.name,
        'class': character.class
      };

      for (const slot of slots) {
        const item = character.gear.find(g => g.slot === slot);
        if (item) {
          gearLine[slot] = item.name;
          if (item.enchant) {
            enchantsLine[slot] = item.enchant.name;
          } else {
            enchantsLine[slot] = '';
          }
        } else {
          gearLine[slot] = '';
          enchantsLine[slot] = '';
        }
      }

      jsonData.push(gearLine);
      jsonData.push(enchantsLine);
    }

    return Utils.formatJsonToCsv(jsonData, fields);
  }
};
