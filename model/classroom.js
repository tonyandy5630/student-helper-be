const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;
const classSchema = new Schema({
  _id: {
    type: ObjectId,
    require: true,
  },
  enrolls: {
    type: Number,
    require: true,
  },
  tutor: {
    type: ObjectId,
    ref: "User",
    require: true,
  },
  subject: {
    type: String,
    ref: "Subject",
    require: true,
  },
  name: {
    type: String,
    require: true,
  },
});

module.exports = model("Classroom", classSchema);
