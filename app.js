const Logger = require('./modules/logger');
const Utils = require('./modules/utils');
const Database = require('./modules/database');
const Main = require('./modules/main');
const Blizzard = require('./modules/blizzard');

const Express = require('express');
const App = Express();
const cors = require('cors');
const Path = require('path');
const BodyParser = require('body-parser');

const Settings = require('./config/settings');

Logger.printInitInfo();

Database.connect();
Blizzard.load();

App.use(cors());
App.use(BodyParser.json());

App.get('/', (req, res) => {
  res.sendFile(Path.resolve('public/views/index.html'));
  Logger.log(`${Utils.parseIp(req.ip)} requested /`);
});

App.put('/reports/new', async (req, res) => {
  try {
    Logger.log(`${Utils.parseIp(req.ip)} requested ${req.url}`);
    res.send(await Main.loadNewReport(req.body.code));
  } catch (error) {
    const errorDetails = Logger.getErrorMessage(error);
    res.status(errorDetails.code).send(errorDetails.message);
  }
});

App.get('/csv', async (req, res) => {
  try {
    Logger.log(`${Utils.parseIp(req.ip)} requested ${req.url}`);
    res.attachment('end_game.csv');
    res.send(await Main.getCsv());
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

App.get('/characters/:server/:name', async (req, res) => {
  try {
    Logger.log(`${Utils.parseIp(req.ip)} requested ${req.url}`);
    res.send(await Main.getCharacter(req.params.server, req.params.name));
  } catch (error) {
    const errorDetails = Logger.getErrorMessage(error);
    res.status(errorDetails.code).send(errorDetails.message);
  }
});

App.use(Express.static('public'));
App.listen(Settings.port || 3000);
