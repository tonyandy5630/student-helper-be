const express = require("express");

const router = express.Router();

const User = require("../model/user");
const authController = require("../controllers/auth");

router.post("/login", authController.login);

module.exports = router;
