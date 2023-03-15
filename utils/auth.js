const bcrypt = require("bcryptjs");

exports.generateVerifyToken = async (string1, string2) => {
  try {
    const verifyString = string1.concat("-", string2);
    let verifyHashedString = await bcrypt.hash(verifyString, 12);
    if (verifyHashedString.includes("/")) {
      verifyHashedString = verifyHashedString.replace(/\//g, "s1L2a3S4h");
    }
    return verifyHashedString;
  } catch (error) {
    console.log(error);
  }
};
