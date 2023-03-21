const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const { sendMail } = require("../utils/mail");
const { generateVerifyToken } = require("../utils/auth");
//* constant
const { SECRET_KEY } = require("../constants/auth");
const { APP_NAME } = require("../constants/shared");
const { signUpTemplate, verifyTemplate } = require("../constants/mail");
//* Model
const User = require("../model/user");
const Token = require("../model/token");

exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    let loadedUser;
    //* validate
    if (!errors.isEmpty()) {
      const error = new Error("Validation failed");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }
    const { pwd, username } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).send({ message: "Username is not exist" });
    } else if (user.isBanned) {
      return res
        .status(401)
        .send({ message: `You have been banned from ${APP_NAME}` });
    } else if (!user.isActive) {
      return res
        .status(400)
        .send({ message: "You haven't verify your email address" });
    }

    loadedUser = user;
    const isPwdEqual = await bcrypt.compare(pwd, user.password);
    if (!isPwdEqual) {
      return res.status(401).send({ message: "Wrong password" });
    }

    const token = jwt.sign(
      {
        email: loadedUser.email,
        userId: loadedUser._id.toString(),
      },
      SECRET_KEY,
      { expiresIn: "3h" }
    );
    return res.status(200).json({
      message: "Login successfully",
      data: { user: loadedUser, access_token: token },
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.signUp = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorObj = {};
      //* add propteries to errorObj
      errors.array().map((err) => {
        errorObj[err.param] = err.msg;
      });

      return res.status(422).send({ data: errorObj });
    }

    const { email, pwd, username } = req.body;

    const hashedPwd = await bcrypt.hash(pwd, 12);
    const user = new User({
      _id: username,
      email,
      password: hashedPwd,
      username,
      role: "user",
    });
    const newUser = await user.save();
    const { _id: userId } = newUser;
    let verifyHashedString = await generateVerifyToken(email, userId);

    const token = new Token({
      _userId: userId,
      token: verifyHashedString,
      email,
    });
    const newToken = await token.save();
    const mail = signUpTemplate(newToken.email, newToken.token);
    await sendMail(mail);
    return res.status(200).json({
      message: "Register successfully",
      data: { userid: token._userId, email },
    });
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
    //* check token
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
          "We were unable to find a user for this verification. Please sign up",
      });
    } else if (user.isActive) {
      return res
        .status(200)
        .send({ message: "User has been already verified. Please login" });
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
    //* user not exist
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

    //* send token
    const token = new Token({
      _userId: userId,
      token: verifyHashedString,
      email,
    });

    await token.save();

    const mail = verifyTemplate(email, verifyHashedString);
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
exports.verifyCAPTCHA = async (req, res, next) => {
  try {
    const { captcha } = req.body;
    if (!captcha) {
      return res.status(400).send({ message: "Captcha is not verified " });
    }
    const verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captcha}`;
    const options = {
      method: "POST",
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captcha}`,
    };

    const response = await fetch(verifyURL, options);
    const data = await response.json();
    const success = data.success;
    if (!success) {
      return res.status(400).send({ message: "Captcha is not verified" });
    }

    return res.status(200).send({
      data: {
        captcha_verified: true,
      },
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
