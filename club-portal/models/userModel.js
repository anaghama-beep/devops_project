const mongoose = require("mongoose");

const usersSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  usn: { type: String, required: true, trim: true },
  password: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  section: { type: String, required: true, trim: true },
  isAdmin: { type: Boolean, default: false },
  myEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Events" }],
});

const eventsSchema = new mongoose.Schema({
  eventId: { type: String, required: true, unique: true },
  events: [
    {
      eventName: { type: String, required: true, trim: true, maxlength: 120 },
      eventDesc: { type: String, required: true, trim: true, maxlength: 1000 },
    },
  ],
});

const Users = mongoose.model("users", usersSchema);
const Events = mongoose.model("events", eventsSchema);

module.exports = { Users, Events };
