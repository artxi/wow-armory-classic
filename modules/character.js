const Logger = require('./logger');
const Database = require('./database');
const Item = require('./item');

module.exports = {

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

  async update(mongoId, characterGear) {
    const newGear = await this.formatGear(characterGear);

    return Database.updateOne('characters', {_id: mongoId}, {$set: {gear: newGear}});
  },

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
        item.enchant = gearItem.permanentEnchant;
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
