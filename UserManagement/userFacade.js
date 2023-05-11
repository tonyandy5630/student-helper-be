const { APP_NAME } = require("../constants/shared");
const User = require("../model/user");
const bcrypt = require("bcryptjs");
const passport = require("passport");

/**
 * log in a user
 *
 * @static
 * @param {object} req express request object
 * @param {object} res express response object
 * @param {object} next next middleware
 * @returns {json} json object with status, and access token
 * @memberof UserFacade
 */

class UserFacade {
  static async login(username, pwd) {}
}
