const { OAUTH_ID, OATH_CLIENT_SECRET } = require("../constants/auth");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const User = require("../model/user");
const { generateVerifyToken } = require("./auth");
const Token = require("../model/token");
const { verifyTemplate } = require("../constants/mail");
const { sendMail } = require("./mail");
passport.use(
  new GoogleStrategy(
    {
      clientID: OAUTH_ID,
      clientSecret: OATH_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
      scope: ["profile", "email"],
    },
    async function (request, accessToken, refreshToken, profile, done) {
      //* Add user to db here
      try {
        let existedUser = await User.findOne({ googleId: profile.id });

        //* existing user
        if (existedUser) return done(null, existedUser);
        const { id, displayName, email, picture, email_verified } = profile;
        console.log(profile);
        const newUser = new User({
          _id: email,
          googleId: id,
          email,
          username: displayName,
          avatar: picture,
          isActive: email_verified,
        });
        const saveNewUser = await newUser.save();
        //* not verified in google
        if (!email_verified) {
          //* verify token
          const verifyHashedString = await generateVerifyToken(id, email);
          const token = new Token({
            _userId: id,
            token: verifyHashedString,
            email,
          });
          await token.save();
          const mail = verifyTemplate(email, verifyHashedString);
          const sentMail = await sendMail(mail);
          const mailStatusCode = sentMail[0].statusCode;
          if (mailStatusCode < 300) {
            return done(null, saveNewUser);
          }
        }
        if (saveNewUser) {
          return done(null, saveNewUser);
        }
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  console.log(user);
  done(null, user);
});

passport.deserializeUser(async (user, done) => {
  //* find user if existed
  const existedUser = await User.findOne({ id: user.id, isActive: true });
  if (existedUser) done(null, existedUser);
});
