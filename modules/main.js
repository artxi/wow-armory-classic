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
    const character = await Character.getCharacter(server, characterName);
    character.gearSets = character.gearSets.sort((a, b) => b.date - a.date);

    return character;
  },

  async getGuildRoster(serverName, guildName) {
    const guildCharacters = await Database.find('characters', {
      guildName: {$regex: new RegExp(guildName, 'i')}
    });

    for (const character of guildCharacters) {
      const gear = character.gearSets.filter(s => s.bossId === 612 || s.bossId === 712).sort((a, b) => b.date - a.date)[0];

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

    const fields = ['S.No', 'name', 'class'];

    for (const slot of slots) {
      fields.push(slot + 'Quality');
      fields.push(slot);
    }

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

      // Get last set from BWL Broodlord (612) or AQ Fankriss (712)
      const gearSet = character.gearSets.filter(s => s.bossId === 612 || s.bossId === 712).sort((a, b) => b.date - a.date)[0];

      for (const slot of slots) {
        const item = gearSet.items[slot];
        if (item && item.quality) {
          gearLine[slot + 'Quality'] = item.quality;
          gearLine[slot] = item.name;
          
          if (item.enchant) {
            let name;

            switch (item.enchant.id) {
              case 2583:
                name = '+10 Sta / +7 Def / +15 Block';
                break;
              case 2584:
                name = '+10 Sta / +7 Def / +24 SP';
                break;
              case 2585:
                name = '+28 AP / +1% Dodge';
                break;
              case 2586:
                name = '+24 AP / +10 Sta / +1% Hit';
                break;
              case 2588:
                name = '+18 SP / +1% Hit';
                break;
              case 2589:
                name = '+18 SP / +10 Sta';
                break;
              case 2590:
                name = '+10 Sta / +4MP5 / +24 SP';
                break;
              case 2591:
                name = '+10 Sta / +10 Int / +24 SP';
                break;
              case 2604:
                name = '+33 Healing Spells';
                break;
              case 2605:
                name = '+18 Spell Power';
                break;
              case 2606:
                name = '+30 AP';
                break;
              default:
                name = item.enchant.name;
                break;
            }

            enchantsLine[slot] = name;
          } else {
            enchantsLine[slot] = ' ';
          }
        } else {
          gearLine[slot] = '';
          enchantsLine[slot] = ' ';
        }
      }

      jsonData.push(gearLine);
      jsonData.push(enchantsLine);
    }

    return Utils.formatJsonToCsv(jsonData, fields);
  }
};
