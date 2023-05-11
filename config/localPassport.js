const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const User = require("../model/user");

passport.use(
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "pwd",
      session: true,
    },
    async function (username, pwd, done) {
      try {
        const existedUser = await User.findOne({ username });

        if (!existedUser) {
          return done(null, false, { message: "User not found" });
        }

        const validate = await existedUser.validatePassword(pwd);
        if (!validate) {
          return done(null, false, { message: "Wrong password" });
        }
        console.log("/config/localPassport.js");

        return done(null, existedUser, { message: "Logged in Successfully" });
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

passport.serializeUser(async (user, done) => {
  done(null, user);
});

passport.deserializeUser(async (user, done) => {
  //* find user if existed
  const existedUser = await User.findOne({
    email: user.username,
    isActive: true,
  });
  if (existedUser) done(null, existedUser);
});
