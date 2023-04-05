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
    const { pwd, username } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res
        .status(422)
        .send({ data: { username: "Username is not exist" } });
    } else if (user.isBanned) {
      return res
        .status(401)
        .send({ message: `You have been banned from ${APP_NAME}` });
    } else if (!user.isActive) {
      return res
        .status(422)
        .send({ data: { username: "You haven't verify your email address" } });
    }

    loadedUser = user;
    const isPwdEqual = await bcrypt.compare(pwd, user.password);
    if (!isPwdEqual) {
      return res.status(422).send({ data: { pwd: "Wrong password" } });
    }

    const token = jwt.sign(
      {
        email: loadedUser.email,
        userId: loadedUser._id.toString(),
        at: new Date().getTime(),
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
    const { email } = req.params;
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(406).send({
        message: "Email not found",
      });
    } else if (user.isActive) {
      return res.status(208).send({ message: "Email is verified" });
    }

    const token = await Token.findOne({ token: req.params.token });
    if (!token) {
      return res.status(401).send({
        message: "Token expired",
      });
    }

    //* verify user
    user.isActive = true;
    const verifyUser = await user.save();

    if (verifyUser) {
      await token.deleteOne({ _userId: verifyUser._id });
      return res
        .status(200)
        .send({ message: "Your account has successfully verified" });
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
    const { email: tokenEmail } = req.body;
    const userToResend = await User.findOne({ email: tokenEmail });
    const checkToken = await Token.findOne({ email: tokenEmail });

    if (checkToken) {
      return res
        .status(202)
        .send({ message: "An email has sent to your email. Please check" });
    }

    //* user not exist
    if (!userToResend) {
      return res.status(406).send({
        message:
          "We were unable to find a user with that email. Make sure your Email is correct!",
      });
      //* already activated
    } else if (userToResend.isActive) {
      return res.status(201).send({
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

exports.successAuthenticate = async function (req, res) {
  if (req.user) {
    const { email, followers, username, rankInSubjects, _id } = req.user;
    const user = { email, followers, username, rankInSubjects };
    const token = jwt.sign(
      {
        email: email,
        userId: _id,
      },
      SECRET_KEY,
      { expiresIn: "3h" }
    );
    return res.status(200).json({ data: { user, access_token: token } });
  }
  return res.status(401).send({ message: "not authenticate" });
};

exports.logout = async function (req, res, next) {
  try {
    if (!req.headers || !req.headers.authorization) {
      return res.status(401).send({ message: "Not authorized" });
    }

    if (!req.session) {
      return res.send({ message: "Session expired" });
    }

    if (!req.body) {
      return res.status(406).send({ message: "Didn't send body" });
    }
    const { userId: bodyId } = req.body;

    const token = req.headers.authorization;
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    const { userId: tokenId } = decodedToken;

    if (tokenId !== bodyId) {
      return res.status(401).send({ message: "not authenticated" });
    }

    req.session.destroy();
    return res.status(200).send({ message: "Log out successfully" });
  } catch (error) {
    return res.status(401).send({ message: "not authenticated" });
  }
};
