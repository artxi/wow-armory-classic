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
  } catch (error) {
    const errorDetails = Logger.getErrorMessage(error);
    res.status(errorDetails.code).send(errorDetails.message);
  }
});

App.get('/reports/:code/boss/:id', async (req, res) => {
  try {
    Logger.log(`${Utils.parseIp(req.ip)} requested ${req.url}`);
    res.send(await Main.parseFightFromReport(req.params.code, req.params.id));
  } catch (error) {
    const errorDetails = Logger.getErrorMessage(error);
    res.status(errorDetails.code).send(errorDetails.message);
  }
});

App.get('/items/:id', async (req, res) => {
  try {
    Logger.log(`${Utils.parseIp(req.ip)} requested ${req.url}`);
    res.send(await Main.getItem(req.params.id));
  } catch (error) {
    const errorDetails = Logger.getErrorMessage(error);
    res.status(errorDetails.code).send(errorDetails.message);
  }
});

App.use(Express.static('public'));
App.listen(Settings.port || 3000);
