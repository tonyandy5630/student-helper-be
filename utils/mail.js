const sgMail = require("@sendgrid/mail");
const path = require("path");
const dotenv = require("dotenv");
const { MAIL_SENDER } = require("../constants/auth");

dotenv.config({ override: true });

// sgMail.setApiKey(process.env.SENDGRID_API_KEY);
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
console.log(process.env.SENDGRID_API_KEY);

exports.sendMail = ({ sendTo, subject, text, html }) => {
  const mail = {
    to: sendTo,
    from: MAIL_SENDER,
    subject,
    text,
    html,
  };

  sgMail.send(mail).then(
    () => {
      console.log("sent");
    },
    (err) => {
      console.error(err);

      if (err.response) {
        console.error(err.response.body);
      }
    }
  );
};
