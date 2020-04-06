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
        Database = db.db('wow');
        Logger.log('Connected to database');
      }
    });
  },

  async findOne(collection, query, projection) {
    const result = await Database.collection(collection).findOne(query, {projection: projection || {}});
    Logger.log(`DB find: ${collection} ${JSON.stringify(query)}`)

    return result;
  },

  async insertOne(collection, data) {
    const result = await Database.collection(collection).insertOne(data);
    Logger.log(`DB insert: ${collection} ${result.insertedId.toString()}`);
  },

  async updateOne(collection, query, data) {
    await Database.collection(collection).updateOne(query, data);
  }
};
