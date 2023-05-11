const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");
const USER_ROLE = "USER";
const jwt = require("jsonwebtoken");
// const ADMIN_ROLE = "ADMIN";

const userSchema = new Schema({
  _id: {
    type: String,
    require: true,
  },
  avatar: {
    data: Buffer,
    contentType: String,
  },
  googleId: String,
  email: {
    type: String,
    require: true,
    unique: true,
  },
  password: {
    type: String,
    require: true,
  },
  fullname: String,
  role: {
    type: String,
    require: true,
    default: USER_ROLE,
  },
  username: {
    type: String,
    require: true,
    unique: true,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  followers: {
    type: Number,
    default: 0,
  },
  rankInSubjects: {
    type: [Object],
    subjectRank: {
      subjectCode: String,
      rank: Number,
    },
  },
  hasSupportProfile: {
    type: Boolean,
    default: false,
  },
  isBanned: {
    type: Boolean,
    default: false,
  },
});

userSchema.methods.validatePassword = async function (pwd) {
  return bcrypt.compare(pwd, this.password);
};

userSchema.methods.jwtSign = async function () {
  return jwt.sign(
    {
      email: this.email,
      userId: this._id.toString(),
      at: new Date().getTime(),
    },
    SECRET_KEY,
    { expiresIn: "3h" }
  );
};

module.exports = mongoose.model("User", userSchema);
