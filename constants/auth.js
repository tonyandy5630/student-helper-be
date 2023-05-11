const dotenv = require("dotenv");
const client = process.env.CLIENT_URL;

dotenv.config();

module.exports = {
  SECRET_KEY: process.env.SECRET_KEY,
  MAIL_SENDER: "tonyandy456@protonmail.com",
  OAUTH_ID: process.env.OATH_ID,
  OAUTH_REDIRECT_URL: process.env.OAUTH_REDIRECT_URL,
  OATH_CLIENT_SECRET: process.env.OAUTH_CLIENT_SECRET,
  passportRedirectOptns: {
    session: true,
    failureRedirect: "/failed",
    successRedirect: `${client}/dashboard`,
  },
};
