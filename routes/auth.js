const express = require("express");
const passport = require("passport");
const router = express.Router();
const { body } = require("express-validator");
const User = require("../model/user");
const authController = require("../controllers/auth");
const dotenv = require("dotenv");
const auth = require("../constants/auth");

dotenv.config();

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

router.get("/verification/:email/:token", authController.verifyEmail);

router.post(
  "/verification/resendToken",
  body("email").isEmail().withMessage("Must enter an email"),
  authController.resendVerifyEmail
);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/failed",
    successRedirect: "/success",
  })
);

module.exports = router;
