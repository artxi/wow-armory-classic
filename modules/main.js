const Logger = require('./logger');
const WarcraftLogs = require('./warcraftlogs');
const Item = require('./item');
const Character = require('./character');
const Database = require('./database');
const Utils = require('./utils');

module.exports = {

  /**
   * User requests a new report
   * @param {string} reportCode from the Warcraft Logs URL
   */
  async loadNewReport(reportCode) {

    return WarcraftLogs.loadNewReport(reportCode);
  },

  /**
   * User selected a fight to parse from the report
   * @param {string} reportCode from the Warcraft Logs URL
   * @param {string} bossId chosen by the user from the fight options
   */
  async parseFightsFromReport(reportCode) {
    const fightData = await WarcraftLogs.requestFightData(reportCode, bossId);

    // No need to return data. Redirect user once done
    await WarcraftLogs.parseFightData(fightData, reportCode);
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

  async getGuildRoster(serverName, guildName) {
    const guildCharacters = await Database.find('characters', {
      guildName: {$regex: new RegExp(guildName, 'i')}
    });

    for (const character of guildCharacters) {
      const gear = character.gearSets.filter(s => s.bossId === 612).sort((a,b) => b.date - a.date)[0];

      character.lastUpdated = gear.date;
      character.gear = gear.items;

      delete character.gearSets;
    }

    return guildCharacters;
  },

  /**
   * For now, this is just for guild purposes (Asdern's spreadsheet)
   * Guild name is hardcoded both here and in DB
   * Boss is also hardcoded because we're wearing 'standard' gear
   */
  async getCsv() {
    let characterData = await Database.find('characters', {guildName: 'End Game'});

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

      // Get last set from Broodlord (612)
      const gearSet = character.gearSets.filter(s => s.bossId === 612).sort((a,b) => b.date - a.date)[0];

      for (const slot of slots) {
        const item = gearSet.items.find(g => g.slot === slot);
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
