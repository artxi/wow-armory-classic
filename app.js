const Logger = require('./modules/logger');
const Utils = require('./modules/utils.js');
const Database = require('./modules/database');
const Main = require('./modules/main.js');

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

App.get('/reports/new/:id', async (req, res) => {
  try {
    Logger.log(`${Utils.parseIp(req.ip)} requested ${req.url}`);
    res.send(await Main.parseNewReport(req.params.id));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

App.use(Express.static('public'));
App.listen(Settings.port || 3000);
