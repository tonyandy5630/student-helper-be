const sgMail = require("@sendgrid/mail");
const path = require("path");
const dotenv = require("dotenv");
const { MAIL_SENDER } = require("../constants/auth");
const bcrypt = require("bcryptjs");

dotenv.config({ override: true });

// sgMail.setApiKey(process.env.SENDGRID_API_KEY);
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.sendMail = ({ sendTo, subject, text, html }) => {
  const mail = {
    to: sendTo,
    from: MAIL_SENDER,
    subject,
    text,
    html,
    trackingSettings: {
      clickTracking: {
        enable: false,
        enableText: false,
      },
      openTracking: {
        enable: false,
      },
    },
  };

  return sgMail.send(mail);
};

exports.hashVerify = async (verifyString) => {
  try {
    const hashedCode = await bcrypt.hash(verifyString, 12);
    return hashedCode;
  } catch (error) {
    return error;
  }
};
