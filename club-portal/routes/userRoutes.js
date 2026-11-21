const express = require("express");
const auth = require("../middleware/auth");
const userController = require("../controllers/userController");

const router = express.Router();

router.get("/", (req, res) => res.redirect("/index"));
router.get("/index", auth.islogout, userController.loadRegister);
router.post("/index", userController.insertUser); // sign up
router.post("/index2", userController.verifyLogin); // log in
router.get("/secondpage", auth.islogin, userController.loadDashboard("secondpage"));
router.get("/secondpage_admin", auth.islogin, userController.loadDashboard("secondpage_admin"));
router.get("/logout", auth.islogin, userController.logout);

// Club event pages, plus admin-only management.
router.get("/events/:eventId", userController.fetchEvents);
router.post("/events/:eventId", auth.isadmin, userController.addEvent);
router.delete("/events/:eventId/:id", auth.isadmin, userController.deleteEvent);

module.exports = router;
