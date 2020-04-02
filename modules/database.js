const MongoClient = require('mongodb').MongoClient;

const Logger = require('./logger');

let db;

module.exports = {
  connect() {
    MongoClient.connect(`mongodb://192.168.1.103:27017/wow`, (err, db) => {
      if (err) {
        Logger.error(err);
      } else {
        Logger.log('DB Connected');
        db = db;
      }
    });
  },

  getDatabase() {
    return db;
  },

  disconnect() {
    
  }
};
