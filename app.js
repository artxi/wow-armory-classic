const Logger = require('./modules/logger');
const Database = require('./modules/database');
const WarcraftLogs = require('./modules/warcraftlogs');

try {

  const Express = require('express');
  const App = Express();
  const Server = require('http').Server(App);
  const Io = require('socket.io')(Server);
  const Path = require('path');

  const Settings = require('./config/settings');

  Logger.printInitInfo();
  Database.connect();

  //WarcraftLogs.requestCharacterGear('Basati', 'Mograine', 'eu');

  Io.on('connection', socket => {
    setSocketEvents(socket);
  });

  function setSocketEvents(socket) {
    Logger.log('User connected to webview');
    // socket
    //   .on('getCurrentTargets', () => {
    //     socket.emit('currentTargets', Twitter.getCurrentTargets());
    //   })
    //   .on('addNewTarget', data => {
    //     Twitter.addUserData(data);
    //   })
    //   .on('deleteTarget', name => {
    //     Twitter.deleteTarget(name);
    //   });
  }

  App.get('/', (req, res) => {
    res.sendFile(Path.resolve('public/views/index.html'));
  });

  App.use(Express.static('public'));

  Server.listen(Settings.port || 3000);
} catch (e) {
  Logger.error(e);
}