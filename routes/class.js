const express = require("express");
const { body } = require("express-validator");
const dotenv = require("dotenv");
const router = express.Router();
const classController = require("../controllers/class");

router.get("/allClass", classController.getAllClasses);
module.exports = router;
