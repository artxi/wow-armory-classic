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
   * @param {string} bossName name of the fight boss
   * @param {number} bossId id of the fight boss
   */
  async addGearSet(characterData, characterGear, reportDate, bossName, bossId) {
    let gear = await this.formatGear(characterGear);

    if (!gear.items.weapon2) {
      gear.items.weapon2 = await Item.getMockOffHand();
    }

    if (!gear.items.ranged) {
      if (['Druid', 'Paladin', 'Shaman'].includes(characterData.type)) {
        gear.items.ranged = await Item.getMockRelic();
      } else {
        gear.items.ranged = await Item.getMockRanged();
      }
    }

    gear = {
      ...gear,
      bossName: bossName,
      bossId: bossId,
      date: reportDate
    };

    const character = await Database.findOne('characters', {
      guid: characterData.guid,
      name: characterData.name
    });

    if (character) {
      return this.update(character._id, gear);
    } else {
      return this.create(characterData, gear);
    }
  },

  /**
   * Creates a new character
   * @param {object} characterData name, server, class, etc
   * @param {object} newGear new gear from parsed log
   */
  async create(characterData, newGear) {
    const character = {
      guid: characterData.guid,
      name: characterData.name,
      server: characterData.server,
      class: characterData.type,
      gearSets: [newGear]
    };

    return Database.insertOne('characters', character);
  },

  /**
   * Updates an existing character with the new gear set
   * @param {*} mongoId 
   * @param {object} newGear new gear from parsed log
   */
  async update(mongoId, newGear) {

    return Database.updateOne('characters', {_id: mongoId}, {$push: {gearSets: newGear}});
  },

  /**
   * Convert gear object to desired format for storage & display
   * @param {object} characterGear new gear from parsed log
   */
  async formatGear(characterGear) {
    const gear = {
      items: {}
    };

    let ringCount = 1;
    let trinketCount = 1;
    let weaponCount = 1;

    for (const gearItem of characterGear.filter(i => i.id !== 0)) {
      const itemData = await Item.getItem(gearItem.id);

      let slot = itemData.inventory_type.type.toLowerCase()

      const item = {
        id: gearItem.id,
        name: itemData.name,
        quality: itemData.quality.type.toLowerCase(),
        icon: gearItem.icon
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

      switch (slot) {
        case 'ring':
        case 'finger':
          slot = `ring${ringCount++}`
          break;
        case 'trinket':
          slot = `trinket${trinketCount++}`
          break;
        case 'rangedright':
          slot = 'ranged';
          break;
        case 'robe':
          slot = 'chest';
          break;
        case 'cloak':
          slot = 'back';
          break;
        case 'weapon':
        case 'weaponmainhand':
        case 'twohweapon':
        case 'holdable':
        case 'shield':
        case 'weaponoffhand':
          slot = `weapon${weaponCount++}`
          break;
      }

      gear.items[slot] = item;
    }

    return gear;
  }
};
