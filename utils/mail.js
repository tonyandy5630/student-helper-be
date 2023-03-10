const sgMail = require("@sendgrid/mail");
const dotenv = require("dotenv");
const { MAIL_SENDER } = require("../constants/auth");

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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
