const express = require("express");
const mongoose = require("mongoose");
const app = express();
const bodyParser = require("body-parser");
const helmet = require("helmet");
const morgan = require("morgan");
const passport = require("passport");
const session = require("express-session");
const { MONGODB_URI, PORT } = require("./constants/shared");
require("./utils/passport");
//* Routes
const authRoutes = require("./routes/auth");

app.use(helmet());
app.use(morgan("combined"));
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

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

app.use("/auth", authRoutes);

mongoose
  .connect(MONGODB_URI)
  .then((res) => {
    console.log("connect success at " + PORT);
    app.listen(PORT);
  })
  .catch((err) => console.log(err));
