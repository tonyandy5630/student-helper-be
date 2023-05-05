const sgMail = require("@sendgrid/mail");
const dotenv = require("dotenv");
const { MAIL_SENDER } = require("../constants/auth");
const bcrypt = require("bcryptjs");

dotenv.config({ override: true });

class MailService {
  constructor() {
    this.sendTo = "";
    this.subject = "";
    this.text = "";
    this.html = "";
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }

  setTo(sendTo) {
    this.sendTo = sendTo;
    return this;
  }

  setSubject(subject) {
    this.subject = subject;
    return this;
  }

  setText(text) {
    this.text = text;
    return this;
  }

  setHtml(html) {
    this.html = html;
    return this;
  }

  buildMail() {
    try {
      if (to === "") {
        throw new Error("Cannot leave RECIPIENT empty");
      }

      if (subject === "") {
        throw new Error("Cannot leave SUBJECT empty");
      }

      if (text === "") {
        throw new Error("Cannot leave TEXT field empty");
      }

      return {
        to: this.to,
        subject: this.subject,
        text: this.text,
        html: this.html,
        attachments: this.attachments,
      };
    } catch (err) {
      console.error("Error building email :", err.message);
    }
  }

  sendMail = () => {
    const mail = {
      to: this.sendTo,
      from: MAIL_SENDER,
      subject: this.subject,
      text: this.text,
      html: this.html,
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

  hashVerify = async (verifyString) => {
    try {
      const hashedCode = await bcrypt.hash(verifyString, 12);
      return hashedCode;
    } catch (error) {
      return error;
    }
  };

  generateVerifyToken = async (string1, string2) => {
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
}
