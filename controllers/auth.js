const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../constants/auth");

//* Model
const User = require("../model/user");

exports.login = (req, res, next) => {
  const errors = validationResult(req);
  let loadedUser;
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const { email, pwd, username, fullname } = req.body;
  console.log(username, pwd);
  User.findOne({ username })
    .then((user) => {
      if (!user) {
        const error = new Error("Username not exist");
        error.statusCode = 401;
        res.status(401).send(error.message);
        throw error;
      }
      loadedUser = user;
      return bcrypt.compare(pwd, user.password);
    })
    .then((isEqual) => {
      if (!isEqual) {
        const error = new Error("Wrong password");
        error.statusCode = 401;
        res.status(401).send(error.message);
        throw error;
      }
      const token = jwt.sign(
        {
          email: loadedUser.email,
          userId: loadedUser._id.toString(),
        },
        SECRET_KEY,
        { expiresIn: "3h" }
      );
      res
        .status(200)
        .json({ token, userId: loadedUser._id.toString() })
        .catch((error) => {
          if (!error.statusCode) {
            error.statusCode = 500;
          }
          next(error);
        });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.signUp = (res, req, next) => {};
