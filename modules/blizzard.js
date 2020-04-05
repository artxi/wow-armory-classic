const Logger = require('./logger');
const Settings = require('../config/settings');
const Utils = require('./utils.js');

const credentials = {
  client: {
    id: Settings.blizzardClient.id,
    secret: Settings.blizzardClient.secret
  },
  auth: {
    tokenHost: "https://us.battle.net"
  }
};

const oauth2 = require("simple-oauth2").create(credentials);

let token;

module.exports = {
  /**
   * Request creature data to Wow Classic API and save it to our database
   * @param {string} creatureId from the Warcraft Logs URL
   */
  async requestCreature(creatureId) {
    const path = `/data/wow/creature/${creatureId}`;

    return request(path);
  },

  /**
   * Request item data to Wow Classic API and save it to our database
   * @param {string} itemId from the Warcraft Logs URL
   */
  async requestItem(itemId) {
    const path = `/data/wow/item/${itemId}`;

    return request(path);
  },
};

/**
 * Returns access token for api calls. Requests a new one if needed
 */
async function getToken() {
  if (!token || token.expired()) {
    Logger.log('Blizzard access token expired. Requesting new one');

    return oauth2.clientCredentials
      .getToken()
      .then(oauth2.accessToken.create)
      .then(t => {
        token = t;
        Logger.log('Blizzard access token received');

        return t.token.access_token;
      });
  } else {
    return token.token.access_token;
  }
}

async function request(path) {
  const token = await getToken();
  const options = {
    "method": "GET",
    "hostname": "us.api.blizzard.com",
    "path": `${path}?namespace=static-classic-us&locale=en_US&access_token=${token}`,
    "headers": {
      "cache-control": "no-cache"
    }
  };

  return Utils.httpGet(options);
}
