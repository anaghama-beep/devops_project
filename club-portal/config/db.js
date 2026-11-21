const mongoose = require("mongoose");
const { Events } = require("../models/userModel");
const demoEvents = require("../data/demoEvents");

let memoryServer;

/**
 * Connect to MongoDB. With MONGODB_URI unset, start an in-memory MongoDB and load
 * demo events so the app can be tried without any database setup.
 */
async function connectDatabase(uri) {
  if (!uri) {
    let MongoMemoryServer;
    try {
      ({ MongoMemoryServer } = require("mongodb-memory-server"));
    } catch {
      throw new Error("MONGODB_URI is not set. Set it, or install dev dependencies to use the in-memory demo database.");
    }
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri();
    await mongoose.connect(uri);
    await seedEvents();
    console.log("Using an in-memory MongoDB with demo data (set MONGODB_URI to use a real database)");
    return;
  }
  await mongoose.connect(uri);
}

async function seedEvents() {
  for (const [eventId, events] of Object.entries(demoEvents)) {
    await Events.updateOne({ eventId }, { $setOnInsert: { eventId, events } }, { upsert: true });
  }
}

async function disconnectDatabase() {
  await mongoose.disconnect();
  if (memoryServer) await memoryServer.stop();
}

module.exports = { connectDatabase, disconnectDatabase, seedEvents };
