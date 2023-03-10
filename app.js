const express = require("express");
const mongoose = require("mongoose");
const app = express();
const bodyParser = require("body-parser");
const helmet = require("helmet");
const morgan = require("morgan");

//* Routes
const authRoutes = require("./routes/auth");

app.use(helmet());
app.use(morgan("combined"));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

app.use(bodyParser.json());

app.use("/auth", authRoutes);

mongoose
  .connect(
    "mongodb+srv://tonyandy76:20112001@cluster0.rl5slss.mongodb.net/RESME?retryWrites=true&w=majority"
  )
  .then((res) => {
    console.log("connect success");
    app.listen(8080);
  })
  .catch((err) => console.log(err));
