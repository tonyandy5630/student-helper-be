const { CLIENT_URL } = require("./shared");

exports.signUpTemplate = (email, token) => {
  return {
    sendTo: email,
    subject: "RESME Signup",
    text: `Welcome to RESME click for verify`,
    html: `<a clicktracking="off" href='${CLIENT_URL}/auth/verification/${email}/${token}'>verify</a> for verification`,
  };
};

exports.verifyTemplate = (email, token) => {
  return {
    sendTo: email,
    subject: "RESME resend verification link",
    text: `Welcome to RESME click for verify`,
    html: `<a clicktracking="off" href='${CLIENT_URL}/auth/verification/${email}/${token}'>Link</a> for verification`,
  };
};
