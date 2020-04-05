const Logger = require('./modules/logger');
const Utils = require('./modules/utils.js');
const Database = require('./modules/database');
const Main = require('./modules/main.js');

const Express = require('express');
const App = Express();
const cors = require('cors');
const Path = require('path');

const Settings = require('./config/settings');

Logger.printInitInfo();

Database.connect();

App.use(cors());

App.get('/', (req, res) => {
  res.sendFile(Path.resolve('public/views/index.html'));
  Logger.log(`${Utils.parseIp(req.ip)} requested /`);
});

App.get('/reports/new/:code', async (req, res) => {
  try {
    Logger.log(`${Utils.parseIp(req.ip)} requested ${req.url}`);
    
    res.send(await Main.parseNewReport(req.params.code));
    Logger.log(`${Utils.parseIp(req.ip)} received summary for report ${req.params.code}`);
  } catch (err) {
    Logger.error(err.message || err)
    res.status(400).send(err.message || err);
  }
});

App.get('/reports/:code/boss/:id', async (req, res) => {
  try {
    Logger.log(`${Utils.parseIp(req.ip)} requested ${req.url}`);
    res.send(await Main.parseFightFromReport(req.params.code, req.params.id));
  } catch (err) {
    Logger.error(err.message || err)
    res.status(400).send(err.message || err);
  }
});

App.get('/items/:id', async (req, res) => {
  try {
    Logger.log(`${Utils.parseIp(req.ip)} requested ${req.url}`);
    res.send(await Main.getItem(req.params.id));
  } catch (err) {
    Logger.error(err.message || err)
    res.status(400).send(err.message || err);
  }
});

App.use(Express.static('public'));
App.listen(Settings.port || 3000);
