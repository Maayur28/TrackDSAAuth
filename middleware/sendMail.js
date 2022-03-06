const nodemailer = require("nodemailer");

sendMailObj = {};

sendMailObj.sendContactMail = (obj) => {
  const transport = nodemailer.createTransport({
    host: "smtpout.secureserver.net",
    secure: true,
    secureConnection: false, // TLS requires secureConnection to be false
    tls: {
      ciphers: "SSLv3",
    },
    requireTLS: true,
    port: 465,
    debug: true,
    auth: {
      user: process.env.email,
      pass: process.env.password,
    },
  });
  const mailData = {
    from: process.env.email,
    to: "mayuragarwal2812@gmail.com",
    subject: `TrackDSA Suggestion/Feedback`,
    html: `<div>${obj.message}</div><p>Sent By: ${obj.name}</p><p>Sent from: ${obj.email}</p>`,
  };
  transport.sendMail(mailData, function (err, info) {
    if (err) {
      console.log(err);
      throw error;
    } else {
      console.log("success contact mail");
    }
  });
};

sendMailObj.sendResetMail = (receiverMail, name, token) => {
  const transport = nodemailer.createTransport({
    host: "smtpout.secureserver.net",
    secure: true,
    secureConnection: false, // TLS requires secureConnection to be false
    tls: {
      ciphers: "SSLv3",
    },
    requireTLS: true,
    port: 465,
    debug: true,
    auth: {
      user: process.env.email,
      pass: process.env.password,
    },
  });
  const message = {
    from: process.env.email,
    to: receiverMail,
    subject: "Reset your password",
    html: `<h2>Hi <b>${name}</b>,</h2><p>Please click on the button below to reset your password (valid only for 5 minutes)<br><br><a href=https://trackdsa.vercel.app/reset/${token} style="margin-top:10px;color:white;background-color:rgb(0,21,41);padding:10px 20px;border-radius:50px;text-decoration:none ">CLICK ME</a><p>If this doesn't work please try to copy and paste the link in your browser given below </p><br><a href=https://trackdsa.vercel.app/reset/${token}>https://trackdsa.vercel.app/reset/${token}</a>`,
  };
  transport.sendMail(message, (error, info) => {
    if (error) {
      console.log(error);
      throw error;
    } else {
      console.log("success reset mail");
    }
  });
};

sendMailObj.sendOtpMail = (receiverMail, token) => {
  const transport = nodemailer.createTransport({
    host: "smtpout.secureserver.net",
    secure: true,
    secureConnection: false, // TLS requires secureConnection to be false
    tls: {
      ciphers: "SSLv3",
    },
    requireTLS: true,
    port: 465,
    debug: true,
    auth: {
      user: process.env.email,
      pass: process.env.password,
    },
  });
  const message = {
    from: process.env.email,
    to: receiverMail,
    subject: "Verify Email Address",
    html: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2;color:black">
        <div style="margin:20px auto;width:90%;padding:20px 0">
        <div style="border-bottom:1px solid #eee">
        <p style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">TrackDSA</p>
        </div>
        <p style="font-size:1.1em">Hi,</p>
        <p>Thank you for choosing DSATracker. Use the <span style="font-weight:800;margin: 0 auto;color:#00274c;width: max-content;padding: 0px 2px">${token}</span> to complete your sign Up. Valid only for 5 minutes</p>
        <p style="font-size:0.9em;">Regards,<br />TrackDSA Team</p>
        <hr style="border:none;border-top:1px solid #eee" />
        <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
        <p>Mayur Agarwal</p>
        <p>007, Uttar Pradesh</p>
        <p>India</p>
        </div>
        </div>
        </div>`,
  };
  transport.sendMail(message, (error, info) => {
    if (error) {
      console.log(error);
      throw error;
    } else {
      console.log("success");
    }
  });
};
module.exports = sendMailObj;
