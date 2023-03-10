const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const userSchema = new Schema({
  _id: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
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
  },
  isActive: {
    type: Boolean,
    require: true,
  },
  followers: {
    type: Number,
    require: true,
  },
  rankInSubjects: {
    type: [Object],
    subjectRank: {
      subjectCode: String,
      rank: Number,
    },
  },
});

module.exports = mongoose.model("User", userSchema);
