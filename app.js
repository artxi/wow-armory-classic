const Logger = require('./modules/logger');
const Database = require('./modules/database');
const WarcraftLogs = require('./modules/warcraftlogs');

try {

  const Express = require('express');
  const App = Express();
  const Path = require('path');

  const Settings = require('./config/settings');

  Logger.printInitInfo();
  Database.connect();

  //WarcraftLogs.requestCharacterGear('Basati', 'Mograine', 'eu');

  App.get('/', (req, res) => {
    res.sendFile(Path.resolve('public/views/index.html'));
    Logger.log('User connected to webview');
  });

  App.use(Express.static('public'));

  App.listen(Settings.port || 3000);
} catch (e) {
  Logger.error(e);
}