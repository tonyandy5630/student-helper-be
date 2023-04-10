const { SECRET_KEY } = require("../constants/auth");
const jwt = require("jsonwebtoken");
module.exports = async (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    console.log(req.get("Authorization"));
    return res.status(401).send({ message: "Not authenticated" });
  }

  let decodedToken;
  try {
    decodedToken = await jwt.verify(authHeader, SECRET_KEY);
    if (!decodedToken) {
      return res.status(401).send({ message: "Not authenticated" });
    }
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }

  next();
};
