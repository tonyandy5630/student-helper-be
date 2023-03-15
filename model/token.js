const mongoose = require("mongoose");
const { token } = require("morgan");
const Schema = mongoose.Schema;

// const ObjectId = mongoose.Schema.Types.ObjectId;
const _24Hour = 86400000;

const tokenSchema = new Schema({
  _userId: {
    type: String,
    required: true,
    ref: "User",
  },
  email: {
    type: String,
    require: true,
  },
  token: { type: String, required: true },
  expireAt: { type: Date, default: Date.now, index: { expires: _24Hour } },
});

module.exports = mongoose.model("verifyToken", tokenSchema);
