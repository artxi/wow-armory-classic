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

  async find(collection, query, projection) {
    const result = await Database.collection(collection).find(query, {projection: projection || {}}).toArray();
    Logger.log(`DB find: ${collection} ${JSON.stringify(query)}`)

    return result;
  },

  async findOne(collection, query, projection) {
    const result = await Database.collection(collection).findOne(query, {projection: projection || {}});
    // Logger.log(`DB find: ${collection} ${JSON.stringify(query)}`)

    return result;
  },

  async insertOne(collection, data) {
    await Database.collection(collection).insertOne(data);
    Logger.log(`DB insert: ${collection}`);
  },

  async insertMany(collection, data) {
    await Database.collection(collection).insertMany(data);
    Logger.log(`DB insert many: ${collection}`);
  },

  async updateOne(collection, query, data) {
    await Database.collection(collection).updateOne(query, data);
  },

  async updateMany(collection, query, data) {
    await Database.collection(collection).updateMany(query, data);
  }
};
