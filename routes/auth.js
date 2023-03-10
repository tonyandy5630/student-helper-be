const express = require("express");

const router = express.Router();
const { body } = require("express-validator");
const User = require("../model/user");
const authController = require("../controllers/auth");

router.post("/login", authController.login);

router.post(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Enter an email")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((user) => {
          if (user) {
            return Promise.reject("Email already exist");
          }
        });
      })
      .normalizeEmail(),
    body("pwd").trim().isLength({ min: 5 }),
    body("fullname").trim().not().isEmpty(),
  ],
  authController.signUp
);

module.exports = router;
