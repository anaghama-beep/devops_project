require("dotenv").config();
const app = require("./app");
const config = require("./config/config");
const { connectDatabase } = require("./config/db");

connectDatabase(config.mongoUri)
  .then(() => {
    app.listen(config.port, () => console.log(`Club portal running at http://localhost:${config.port}/index`));
  })
  .catch((error) => {
    console.error("Could not connect to MongoDB:", error.message);
    process.exit(1);
  });
