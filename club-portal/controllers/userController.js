const crypto = require("crypto");
const bcrypt = require("bcrypt");
const { Users, Events } = require("../models/userModel");
const clubs = require("../data/clubs");
const config = require("../config/config");

const hashPassword = (password) => bcrypt.hash(password, 10);

// Constant-time comparison so the admin code cannot be guessed through response timing.
function isValidAdminCode(code) {
  if (!config.adminSignupCode || !code) return false;
  const a = Buffer.from(String(code));
  const b = Buffer.from(config.adminSignupCode);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function startSession(req, user) {
  return new Promise((resolve, reject) => {
    // Issue a fresh session id on login to prevent session fixation.
    req.session.regenerate((err) => {
      if (err) return reject(err);
      req.session.user_id = String(user._id);
      req.session.isAdmin = Boolean(user.isAdmin);
      resolve();
    });
  });
}

const dashboardFor = (user) => (user.isAdmin ? "/secondpage_admin" : "/secondpage");

const loadRegister = (req, res) => res.render("index");

const loadDashboard = (view) => async (req, res, next) => {
  try {
    const user = await Users.findById(req.session.user_id);
    if (!user) {
      req.session.destroy(() => res.redirect("/index"));
      return;
    }
    if (view === "secondpage_admin" && !user.isAdmin) return res.redirect("/secondpage");
    res.render(view, { name: user.name, usn: user.usn, section: user.section });
  } catch (error) {
    next(error);
  }
};

const insertUser = async (req, res, next) => {
  try {
    const { name, email, usn, section, pass, isAdmin: adminCode } = req.body;
    if (!name || !email || !usn || !section || !pass) {
      return res.status(400).render("index", { message: "Please fill in all the fields" });
    }
    if (adminCode && !isValidAdminCode(adminCode)) {
      return res.status(403).render("index", { message: "Invalid admin code" });
    }
    if (await Users.exists({ email: email.toLowerCase().trim() })) {
      return res.status(409).render("index", { message: "User already exists! Please login to continue" });
    }
    const user = await Users.create({
      name,
      email,
      usn,
      section,
      isAdmin: isValidAdminCode(adminCode),
      password: await hashPassword(pass),
    });
    await startSession(req, user);
    res.redirect(dashboardFor(user));
  } catch (error) {
    next(error);
  }
};

const verifyLogin = async (req, res, next) => {
  try {
    const { email, pass } = req.body;
    const user = email && (await Users.findOne({ email: String(email).toLowerCase().trim() }));
    // The same message for unknown email and wrong password avoids revealing which accounts exist.
    if (!user || !(await bcrypt.compare(String(pass || ""), user.password))) {
      return res.status(401).render("index", { message: "Email or password is incorrect" });
    }
    await startSession(req, user);
    res.redirect(dashboardFor(user));
  } catch (error) {
    next(error);
  }
};

const logout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.redirect("/index");
  });
};

const fetchEvents = async (req, res, next) => {
  try {
    const club = clubs[req.params.eventId];
    if (!club) return res.status(404).send("Club not found");
    const doc = await Events.findOne({ eventId: req.params.eventId }).lean();
    res.render(club.view, {
      clubId: req.params.eventId,
      clubName: club.name,
      isUserAdmin: Boolean(req.session.isAdmin),
      eventList: doc ? doc.events : [],
    });
  } catch (error) {
    next(error);
  }
};

const addEvent = async (req, res, next) => {
  try {
    if (!clubs[req.params.eventId]) return res.status(404).json({ error: "Club not found" });
    const eventName = String(req.body.eventName || "").trim();
    const eventDesc = String(req.body.eventDesc || "").trim();
    if (!eventName || !eventDesc) return res.status(400).json({ error: "Event name and description are required" });
    const doc = await Events.findOneAndUpdate(
      { eventId: req.params.eventId },
      { $push: { events: { eventName, eventDesc } } },
      { upsert: true, new: true, runValidators: true },
    );
    res.status(201).json(doc.events[doc.events.length - 1]);
  } catch (error) {
    next(error);
  }
};

const deleteEvent = async (req, res, next) => {
  try {
    const result = await Events.updateOne(
      { eventId: req.params.eventId },
      { $pull: { events: { _id: req.params.id } } },
    );
    if (!result.modifiedCount) return res.status(404).json({ error: "Event not found" });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  loadRegister,
  loadDashboard,
  insertUser,
  verifyLogin,
  logout,
  fetchEvents,
  addEvent,
  deleteEvent,
};
