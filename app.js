const Logger = require('./modules/logger');
const Utils = require('./modules/utils.js');
const Main = require('./modules/main.js');
const Database = require('./modules/database');
const WarcraftLogs = require('./modules/warcraftlogs');

const Express = require('express');
const App = Express();
const Path = require('path');

const Settings = require('./config/settings');

Logger.printInitInfo();
Database.connect();

App.get('/', (req, res) => {
  res.sendFile(Path.resolve('public/views/index.html'));
  Logger.log(`${Utils.parseIp(req.ip)} requested /`);
});

App.get('/characters/:name', async (req, res) => {
  Logger.log(`${Utils.parseIp(req.ip)} requested ${req.url}`);
  res.send(await WarcraftLogs.requestCharacterGear(req.params.name, 'Mograine', 'eu'));
});

App.use(Express.static('public'));
App.listen(Settings.port || 3000);
