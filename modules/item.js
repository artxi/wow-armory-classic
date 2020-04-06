const Logger = require('./logger');
const Database = require('./database');
const Blizzard = require('./blizzard');

module.exports = {

  /**
   * Gets item data from database or Blizzard API
   * @param {string} itemId from the Warcraft Logs URL
   */
  async getItem(itemId) {
    let item = await Database.findOne('items', {id: parseInt(itemId)});

    if (!item) {
      item = await Blizzard.requestItem(itemId);
      Database.insertOne('items', item);
    }

    return item;
  },
};
