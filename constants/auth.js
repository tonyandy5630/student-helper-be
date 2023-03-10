const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  SECRET_KEY: process.env.SECRET_KEY,
  MAIL_SENDER: "tonyandy456@protonmail.com",
};
