const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const USER_ROLE = "USER";
const ADMIN_ROLE = "ADMIN";

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
  password: String,
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
  isBanned: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("User", userSchema);
