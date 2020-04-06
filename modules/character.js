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
   */
  async updateCharacter(characterData, characterGear) {
    const character = await Database.findOne('characters', {
      guid: characterData.guid,
      name: characterData.name
    });

    if (character) {
      return this.update(character._id, characterGear);
    } else {
      return this.create(characterData, characterGear);
    }
  },

  /**
   * Creates a new character
   * @param {object} characterData name, server, class, etc
   * @param {object} characterGear new gear from parsed log
   */
  async create(characterData, characterGear) {
    const character = {
      guid: characterData.guid,
      name: characterData.name,
      server: characterData.server,
      class: characterData.type,
      gear: await this.formatGear(characterGear)
    };

    return Database.insertOne('characters', character);
  },

  /**
   * Updates an existing character with the new gear set
   * @param {*} mongoId 
   * @param {object} characterGear new gear from parsed log
   */
  async update(mongoId, characterGear) {
    const newGear = await this.formatGear(characterGear);

    return Database.updateOne('characters', {_id: mongoId}, {$set: {gear: newGear}});
  },

  /**
   * Convert gear object to desired format for storage & display
   * @param {object} characterGear new gear from parsed log
   */
  async formatGear(characterGear) {
    const gear = [];

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
          item.slot = `ring${ringCount++}`
          break;
        case 'trinket':
          item.slot = `trinket${trinketCount++}`
          break;
        case 'weapon':
        case 'holdable':
        case 'shield':
        case 'weaponmainhand':
          item.slot = `weapon${weaponCount++}`
          break;
      }

      gear.push(item);
    }

    return gear;
  }
};
