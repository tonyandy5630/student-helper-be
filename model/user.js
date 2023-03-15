const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  _id: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
    unique: true,
  },
  password: {
    type: String,
    require: true,
  },
  fullname: {
    type: String,
    require: true,
  },
  role: {
    type: String,
    require: true,
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
