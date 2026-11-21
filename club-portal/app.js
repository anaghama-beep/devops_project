const path = require("path");
const express = require("express");
const session = require("express-session");
const config = require("./config/config");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.disable("x-powered-by");
if (config.isProduction) app.set("trust proxy", 1);

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: "lax", secure: config.isProduction, maxAge: 1000 * 60 * 60 * 8 },
  }),
);

app.use("/", userRoutes);

app.use((req, res) => res.status(404).send("Page not found"));
app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  res.status(500).send("Something went wrong");
});

module.exports = app;
