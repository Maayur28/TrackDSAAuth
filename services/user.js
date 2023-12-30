// const model = require("../models/user");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const validator = require("../utilities/validator");
const model = require("../model/user");
const { nextTick } = require("async");
const moment = require("moment");
const CryptoJS = require("crypto-js");
const otpObj = require("../middleware/otp");
const sendMailObj = require("../middleware/sendMail");
const DeviceDetector = require("node-device-detector");
const { default: axios } = require("axios");
require("dotenv").config();
let userService = {};

const detector = new DeviceDetector({
  clientIndexes: true,
  deviceIndexes: true,
  deviceAliasCode: false,
});

userService.LoginService = async (userObj, userAgent) => {
  try {
    if (validator.LoginValidator(userObj)) {
      const getUser = await model.LoginModel(userObj);
      if (getUser) {
        if (await bcrypt.compare(userObj.password, getUser.password)) {
          delete userObj.password;
          const getUserId = getUser.userid;
          if (getUserId) {
            const jwtAccessToken = jwt.sign(
              {
                userid: getUserId,
              },
              process.env.TOKEN_SECRET,
              { expiresIn: "1d" }
            );
            const jwtRefreshToken = jwt.sign(
              { userid: getUserId },
              process.env.TOKEN_SECRET,
              { expiresIn: "7d" }
            );
            if (jwtAccessToken && jwtRefreshToken) {
              const accessToken = CryptoJS.AES.encrypt(
                jwtAccessToken,
                process.env.CIPHER_TOKEN
              ).toString();
              if (accessToken) {
                const userLoginStatus = await model.LoginStatusUpdate(
                  jwtRefreshToken,
                  getUserId
                );
                if (userLoginStatus) {
                  const result = detector.detect(userAgent);
                  await sendMailObj.sendLoginMail(
                    result.client.name,
                    result.client.type,
                    result.device.type,
                    userObj.email
                  );
                  let name = getUser.name;
                  name = name.substring(0, name.indexOf(" "));
                  name = name.substring(0, 8);
                  let image = getUser.image;
                  return { accessToken, jwtRefreshToken, name, image };
                } else {
                  let err = new Error();
                  err.status = 500;
                  err.message = "Server is busy!Please try again later";
                  throw err;
                }
              } else {
                let err = new Error();
                err.status = 503;
                err.message =
                  "Unexpected error occured! Please try again later";
                throw err;
              }
            } else {
              let err = new Error();
              err.status = 503;
              err.message = "Unexpected error occured! Please try again later";
              throw err;
            }
          } else {
            let err = new Error();
            err.status = 500;
            err.message = "Server is busy! Please try again later";
            throw err;
          }
        } else {
          delete userObj.password;
          let err = new Error();
          err.status = 401;
          err.message = "Invalid username or password";
          throw err;
        }
      } else {
        let err = new Error();
        err.status = 404;
        err.message = "Invalid username or password";
        throw err;
      }
    } else {
      npm;
      let err = new Error();
      err.status = 400;
      err.message = "Invalid credentials!!!";
      throw err;
    }
  } catch (error) {
    let err = new Error();
    err.status = 400;
    err.message = error.message || "Invalid credentials!!!";
    throw err;
  }
};

userService.RegisterService = async (userObj) => {
  try {
    const valid = await validator.RegisterValidator(userObj);
    if (valid) {
      userObj.userid = uuidv4();
      userObj = _.pick(userObj, [
        "userid",
        "name",
        "email",
        "password",
        "gender",
      ]);
      userObj.password = await bcrypt.hash(
        userObj.password,
        await bcrypt.genSalt(11)
      );
      const jwtAccessToken = jwt.sign(
        {
          userid: userObj.userid,
        },
        process.env.TOKEN_SECRET,
        { expiresIn: "5m" }
      );
      if (jwtAccessToken) {
        userObj.accountCreatedOn = moment()
          .utcOffset("+05:30")
          .format("MMMM Do YYYY, h:mm:ss a");
        userObj.lastUpdatedOn = moment()
          .utcOffset("+05:30")
          .format("MMMM Do YYYY, h:mm:ss a");
        const obj = otpObj.generateOtp();
        userObj.secret = obj.secret;
        userObj.otp = obj.token;
        const registerStatus = await model.RegisterUser(userObj);
        if (registerStatus) {
          const sessionToken = CryptoJS.AES.encrypt(
            jwtAccessToken,
            process.env.CIPHER_TOKEN
          ).toString();
          await sendMailObj.sendOtpMail(userObj.name, userObj.email, obj.token);
          return sessionToken;
        } else {
          let err = new Error();
          err.status = 500;
          err.message = "Server is busy! Please try again later";
          throw err;
        }
      } else {
        let err = new Error();
        err.status = 500;
        err.message = "Server is busy! Please try again later";
        throw err;
      }
    } else {
      let err = new Error();
      err.status = 400;
      err.message = "Invalid credentials!!!";
      throw err;
    }
  } catch (error) {
    let err = new Error();
    err.status = 400;
    err.message = error.message || error || "Invalid credentials!!!";
    throw err;
  }
};

userService.VerifyOtp = async (userid) => {
  const jwtAccessToken = jwt.sign(
    {
      userid: userid,
    },
    process.env.TOKEN_SECRET,
    { expiresIn: "1d" }
  );
  const jwtRefreshToken = jwt.sign(
    { userid: userid },
    process.env.TOKEN_SECRET,
    { expiresIn: "7d" }
  );
  if (jwtAccessToken && jwtRefreshToken) {
    let getUser = await model.VerifyOtp(userid, jwtRefreshToken);
    if (getUser) {
      let accessToken = CryptoJS.AES.encrypt(
        jwtAccessToken,
        process.env.CIPHER_TOKEN
      ).toString();
      let name = getUser.name;
      name = name.split(" ")[0];
      name = name.substring(0, 8);
      let image = getUser.image;
      return { accessToken, jwtRefreshToken, name, image };
    } else {
      let err = new Error();
      err.status = 500;
      err.message = "Server is busy! Please try again later";
      throw err;
    }
  } else {
    let err = new Error();
    err.status = 500;
    err.message = "Server is busy! Please try again later";
    throw err;
  }
};
userService.verifyAccess = async (accessToken) => {
  return accessToken;
};
userService.forgetPassword = async (email) => {
  let userObj = await model.forgetPassword(email);
  const jwtAccessToken = jwt.sign(
    {
      userid: userObj.userId,
    },
    process.env.TOKEN_SECRET,
    { expiresIn: "5m" }
  );
  await sendMailObj.sendResetMail(email.email, userObj.name, jwtAccessToken);
  return true;
};
userService.Reset = async (userObj) => {
  userObj.password = await bcrypt.hash(
    userObj.password,
    await bcrypt.genSalt(11)
  );
  return await model.Reset(userObj);
};
userService.getProfile = async (userid) => {
  return await model.getProfile(userid);
};
userService.validateUsername = async (username) => {
  if (username.trim().length >= 5) {
    return await model.validateUsername(username);
  } else return false;
};
userService.updateProfile = async (userid, obj) => {
  return await model.updateProfile(userid, obj);
};
userService.changePassword = async (userid, obj) => {
  const getUser = await model.LoginUserIdModel(userid);
  if (getUser && obj.password === obj.confirmpassword) {
    if (await bcrypt.compare(obj.currentpassword, getUser.password)) {
      let newPassword = await bcrypt.hash(
        obj.password,
        await bcrypt.genSalt(11)
      );
      let userObj = {};
      userObj.password = newPassword;
      userObj.userid = userid;
      return await model.Reset(userObj);
    } else return false;
  } else return false;
};

userService.sendContactMail = async (obj) => {
  await sendMailObj.sendContactMail(obj);
};

userService.verifyCaptcha = async (req) => {
  const secretKey = process.env.CAPTCHA_SECRET_KEY;
  const verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${req.body.captcha}`;
  const response = await axios.post(verifyURL);
  return response.data.success;
};

module.exports = userService;
