const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const { sendMail } = require("../utils/mail");
const { generateVerifyToken } = require("../utils/auth");
//* constant
const { SECRET_KEY } = require("../constants/auth");
const { APP_NAME, CLIENT_URL } = require("../constants/shared");

//* Model
const User = require("../model/user");
const Token = require("../model/token");
const user = require("../model/user");

exports.login = (req, res, next) => {
  const errors = validationResult(req);
  let loadedUser;
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const { email, pwd, username, fullname } = req.body;
  User.findOne({ username })
    .then((user) => {
      if (!user) {
        const error = new Error("Username not exist");
        error.statusCode = 401;
        res.status(401).send(error.message);
        throw error;
      } else if (user.isBanned) {
        const error = new Error(`You have been banned from ${APP_NAME}`);
        error.statusCode = 401;
        res.statusCode(401).send(error.message);
        throw error;
      }
      loadedUser = user;
      return bcrypt.compare(pwd, user.password);
    })
    .then((isEqual) => {
      if (!isEqual) {
        const error = new Error("Wrong password");
        error.statusCode = 401;
        res.status(401).send(error.message);
        throw error;
      }
      const token = jwt.sign(
        {
          email: loadedUser.email,
          userId: loadedUser._id.toString(),
        },
        SECRET_KEY,
        { expiresIn: "3h" }
      );
      res
        .status(200)
        .json({ token, userId: loadedUser._id.toString() })
        .catch((error) => {
          if (!error.statusCode) {
            error.statusCode = 500;
          }
          next(error);
        });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.signUp = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const error = new Error("Validation failed");
      error.statusCode = 422;
      error.data = errors.array();
      res.status(422).send(error.data);
      throw error;
    }
    const { email, fullname, pwd, username } = req.body;

    const hashedPwd = await bcrypt.hash(pwd, 12);
    const user = new User({
      _id: username,
      email,
      fullname,
      password: hashedPwd,
      username,
      role: "user",
    });
    const newUser = await user.save();
    const { _id: userId } = newUser;
    let verifyHashedString = generateVerifyToken(email, userId);

    const token = new Token({
      _userId: userId,
      token: verifyHashedString,
      email,
    });
    const newToken = await token.save();
    const mail = {
      sendTo: email,
      subject: "RESME Signup",
      text: `Welcome to RESME click for verify`,
      html: `<a clicktracking="off" href='${CLIENT_URL}/auth/verification/${newToken.email}/${newToken.token}'>verify</a> for verification`,
    };
    await sendMail(mail);
    return res
      .status(200)
      .json({ message: "check email", userid: token._userId });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.loginFailed = (req, res, next) => {
  return res.status(401).json({
    error: true,
    message: "Login in failed",
  });
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const token = await Token.findOne({ token: req.params.token });
    if (!token) {
      return res.status(400).send({
        msg: "Your verification link may have expired. Please click on resend for verify your Email.",
      });
    }
    const { _userId: tokenUserId, email: tokenEmail } = token;
    const user = await User.findOne({ _id: tokenUserId, email: tokenEmail });

    if (!user) {
      return res.status(401).send({
        message:
          "We were unable to find a user for this verification. Please SignUp!",
      });
    } else if (user.isActive) {
      return res
        .status(200)
        .send({ message: "User has been already verified. Please Login" });
    }

    //* verify user
    user.isActive = true;
    const verifyUser = await user.save();

    if (verifyUser) {
      await token.deleteOne({ _userId: verifyUser._id });
      return res
        .status(200)
        .send({ message: "Your account has been successfully verified" });
    }
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.resendVerifyEmail = async (req, res, next) => {
  try {
    const userToResend = await User.findOne({ email: req.body.email });
    if (!userToResend) {
      return res.status(400).send({
        message:
          "We were unable to find a user with that email. Make sure your Email is correct!",
      });
      //* already activated
    } else if (userToResend.isActive) {
      return res.status(200).send({
        message: "This account has been already verified. Please log in.",
      });
    }

    const { _id: userId, email } = userToResend;
    const verifyHashedString = await generateVerifyToken(userId, email);

    const token = new Token({
      _userId: userId,
      token: verifyHashedString,
      email,
    });

    await token.save();

    const mail = {
      sendTo: email,
      subject: "RESME resend verification link",
      text: `Welcome to RESME click for verify`,
      html: `<a clicktracking="off" href='${CLIENT_URL}/auth/verification/${email}/${verifyHashedString}'>Link</a> for verification`,
    };
    const sentMail = await sendMail(mail);
    const mailStatusCode = sentMail[0].statusCode;
    //* succeed
    if (mailStatusCode < 300) {
      return res.status(200).json({ message: "Sent verify link" });
    }
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
