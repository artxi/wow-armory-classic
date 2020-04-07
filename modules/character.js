const Logger = require('./logger');
const Database = require('./database');
const Item = require('./item');

module.exports = {

  /**
   * @param {string} server will check lowerCase to lowerCase
   * @param {string} characterName will check lowerCase to lowerCase
   */
  async getCharacter(server, characterName) {
    const serverToCheck = server[0].toUpperCase() + server.toLowerCase().slice(1);
    const nameToCheck = characterName[0].toUpperCase() + characterName.toLowerCase().slice(1);

    const character = await Database.findOne('characters', {
      name: nameToCheck,
      server: serverToCheck
    });

    if (!character) {
      throw new Error('Character not found');
    }

    return character;
  },

  /**
   * Updates or creates a character with the new gear set
   * @param {object} characterData name, server, class, etc
   * @param {object} characterGear new gear from parsed log
   * @param {number} reportDate date from the report
   * @param {string} bossName to display
   */
  async addGearSet(characterData, characterGear, reportDate, bossName, bossId) {
    const character = await Database.findOne('characters', {
      guid: characterData.guid,
      name: characterData.name
    });

    if (character) {
      return this.update(character._id, characterGear, reportDate, bossName, bossId);
    } else {
      return this.create(characterData, characterGear, reportDate, bossName, bossId);
    }
  },

  /**
   * Creates a new character
   * @param {object} characterData name, server, class, etc
   * @param {object} characterGear new gear from parsed log
   * @param {number} reportDate date from the report
   */
  async create(characterData, characterGear, reportDate, bossName, bossId) {
    const character = {
      guid: characterData.guid,
      name: characterData.name,
      server: characterData.server,
      class: characterData.type,
      gearSets: []
    };

    character.gearSets.push(await this.formatGear(characterGear, reportDate, bossName, bossId));

    return Database.insertOne('characters', character);
  },

  /**
   * Updates an existing character with the new gear set
   * @param {*} mongoId 
   * @param {object} characterGear new gear from parsed log
   * @param {number} reportDate date from the report
   */
  async update(mongoId, characterGear, reportDate, bossName, bossId) {
    const newGear = await this.formatGear(characterGear, reportDate, bossName, bossId);

    return Database.updateOne('characters', {_id: mongoId}, {$push: {gearSets: newGear}});
  },

  /**
   * Convert gear object to desired format for storage & display
   * @param {object} characterGear new gear from parsed log
   * @param {number} reportDate date from the report
   */
  async formatGear(characterGear, reportDate, bossName, bossId) {
    const gear = {
      date: reportDate,
      bossName: bossName,
      bossId: bossId,
      items: []
    };

    let ringCount = 1;
    let trinketCount = 1;
    let weaponCount = 1;

    for (const gearItem of characterGear.filter(i => i.id !== 0)) {
      const itemData = await Item.getItem(gearItem.id);

      const item = {
        id: gearItem.id,
        name: itemData.name,
        quality: itemData.quality.type.toLowerCase(),
        icon: gearItem.icon,
        slot: itemData.inventory_type.type.toLowerCase()
      };

      if (gearItem.permanentEnchant) {
        item.enchant = {
          id: gearItem.permanentEnchant,
        };

        const enchant = await Database.findOne('enchants', {id: gearItem.permanentEnchant});
        if (enchant && enchant.name) {
          item.enchant.name = enchant.name;
        }
      }

      switch (item.slot) {
        case 'ring':
        case 'finger':
          item.slot = `ring${ringCount++}`
          break;
        case 'trinket':
          item.slot = `trinket${trinketCount++}`
          break;
        case 'rangedright':
          item.slot = 'ranged';
          break;
        case 'robe':
          item.slot = 'chest';
          break;
        case 'cloak':
          item.slot = 'back';
          break;
        case 'weapon':
        case 'weaponmainhand':
        case 'twohweapon':
        case 'holdable':
        case 'shield':
          item.slot = `weapon${weaponCount++}`
          break;
      }

      gear.items.push(item);
    }

    gear.date = reportDate;

    return gear;
  }
};
