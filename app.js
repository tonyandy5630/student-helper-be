const express = require("express");
const mongoose = require("mongoose");
const app = express();

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

app.listen(3000);

mongoose
  .connect(
    "mongodb+srv://tonyandy76:20112001@cluster0.rl5slss.mongodb.net/?retryWrites=true&w=majority"
  )
  .then((res) => {
    app.listen(8080);
  })
  .catch((err) => console.log(err));
