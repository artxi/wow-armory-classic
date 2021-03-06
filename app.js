const Logger = require('./modules/logger');
const Utils = require('./modules/utils');
const Database = require('./modules/database');
const Main = require('./modules/main');
const Blizzard = require('./modules/blizzard');

const Express = require('express');
const Https = require('https');
const Fs = require('fs');
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

App.get('/reports/new/:code', async (req, res) => {
  try {
    Logger.log(`${Utils.parseIp(req.ip)} requested ${req.url}`);
    res.status(200).send(await Main.loadNewReport(req.params.code));
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

App.get('/guilds/:server/:guild/roster', async (req, res) => {
  try {
    Logger.log(`${Utils.parseIp(req.ip)} requested ${req.url}`);
    res.send(await Main.getGuildRoster(req.params.server, req.params.guild));
  } catch (error) {
    const errorDetails = Logger.getErrorMessage(error);
    res.status(errorDetails.code).send(errorDetails.message);
  }
});

const options = {
  key: Fs.readFileSync(Settings.https.key),
  cert: Fs.readFileSync(Settings.https.cert)
};

Https.createServer(options, App).listen(Settings.port || 3000);