const MongoClient = require('mongodb').MongoClient;

const Logger = require('./logger');
const Settings = require('../config/settings');

let Database;

module.exports = {

  connect() {
    MongoClient.connect(Settings.mongoDB.connectionString, { useUnifiedTopology: true }, (err, db) => {
      if (err) {
        Logger.error(err);
      } else {
        Logger.log('DB Connected');
        Database = db.db('wow');

        return Database;
      }
    });
  },

  async findOne(collection, query) {
    const data = await Database.collection(collection).findOne(query);
    Logger.log(`DB find: ${collection} ${JSON.stringify(query)}`)

    return data;
  },

  async insertOne(collection, query) {
    const data = await Database.collection(collection).insertOne(query);
    Logger.log(`DB insert: ${collection} ${data.insertedId.toString()}`);

    return data;
  },

  disconnect() {
    
  }
};
