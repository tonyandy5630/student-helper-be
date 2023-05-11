const express = require("express");
const mongoose = require("mongoose");
const app = express();
const bodyParser = require("body-parser");
const helmet = require("helmet");
const morgan = require("morgan");
const passport = require("passport");
const session = require("express-session");
const { MONGODB_URI, PORT } = require("./constants/shared");
const cookieSession = require("cookie-session");
const cors = require("cors");
const authCheck = require("./middleware/auth-check");

const cookie_parser = require("cookie-parser");
//* Routes
const authRoutes = require("./routes/auth");
const classRoutes = require("./routes/class");
const { successAuthenticate } = require("./controllers/auth");
require("./config/googlePassport");
require("./config/localPassport");

app.use(helmet());
app.use(morgan("combined"));
// app.use(
//   cookieSession({
//     name: "authCookie",
//     keys: "session",
//     maxAge: 24 * 60 * 60 * 1000, // 24 hours
//   })
// );
app.use(
  session({
    secret: "SECRET",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());
app.use(cookie_parser());

app.use(
  cors({
    origin: process.env.CLIENT_URL, // allow to server to accept request from different origin
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, // allow session cookie from browser to pass through
    allowedHeaders: "Origin,X-Requested-With,Content-Type,Accept,Authorization",
  })
);
console.log("app.js");

app.use("/auth", authRoutes);
app.use("/class", classRoutes);

app.get("/", authCheck, successAuthenticate);

mongoose
  .connect(MONGODB_URI)
  .then((res) => {
    console.log("connect success at " + PORT);
    app.listen(PORT);
  })
  .catch((err) => console.log(err));
