// All secrets come from the environment. See .env.example.
const crypto = require("crypto");

const isProduction = process.env.NODE_ENV === "production";

if (isProduction && (!process.env.SESSION_SECRET || !process.env.MONGODB_URI)) {
  throw new Error("SESSION_SECRET and MONGODB_URI must be set in production");
}

module.exports = {
  port: Number(process.env.PORT) || 3000,
  mongoUri: process.env.MONGODB_URI || "",
  // A random secret per process is fine for local development; sessions reset on restart.
  sessionSecret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex"),
  // Code that must be entered at sign-up to create a club admin account.
  adminSignupCode: process.env.ADMIN_SIGNUP_CODE || "",
  isProduction,
};
