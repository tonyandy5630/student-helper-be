const dotenv = require("dotenv");
dotenv.config({ override: true });

module.exports = {
  MONGODB_URI: process.env.MONGODB_URI,
  APP_NAME: "RESME",
  PORT: process.env.SERVER_PORT,
  CLIENT_URL: process.env.CLIENT_URL,
};
