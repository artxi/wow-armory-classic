const Logger = require('./modules/logger');
const Utils = require('./modules/utils.js');
const Main = require('./modules/main.js');
const Database = require('./modules/database');

const Express = require('express');
const App = Express();
const Path = require('path');

const Settings = require('./config/settings');

Logger.printInitInfo();
//Database.connect();

App.get('/', (req, res) => {
  res.sendFile(Path.resolve('public/views/index.html'));
  Logger.log(`${Utils.parseIp(req.ip)} requested /`);
});

App.get('/characters/:character', async (req, res) => {
  Logger.log(`${Utils.parseIp(req.ip)} requested ${req.url}`);  
  res.send(await Main.getCharacterGear(req.params.character, 'Mograine', 'eu'));
});

App.get('/characters/guild/:guild', async (req, res) => {
  Logger.log(`${Utils.parseIp(req.ip)} requested ${req.url}`);
  res.send(await Main.getGuildRosterGear(req.params.guild, 'Mograine', 'eu'));
});

App.use(Express.static('public'));
App.listen(Settings.port || 3000);
