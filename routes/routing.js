const express = require("express");
const authObj = require("../middleware/auth");
const service = require("../services/user");
const routes = express.Router();
const fetch = require("isomorphic-fetch");
const sendMailObj = require("../middleware/sendMail");
require("dotenv").config();

routes.post("/login", async (req, res, next) => {
  try {
    let { accessToken, jwtRefreshToken } = await service.LoginService(req.body);
    res.status(200);
    res.json({ accessToken, jwtRefreshToken });
  } catch (error) {
    next(error);
  }
});

routes.post("/register", async (req, res, next) => {
  try {
    let authToken = await service.RegisterService(req.body);
    res.status(200);
    res.json({ authToken });
  } catch (error) {
    next(error);
  }
});

routes.post("/verifyotp", authObj.authOtp, async (req, res, next) => {
  try {
    if (req.status) {
      const { accessToken, jwtRefreshToken } = await service.VerifyOtp(
        req.userid
      );
      return res.json({ accessToken, jwtRefreshToken }).status(200);
    } else {
      return res.json({ sessionId: false }).status(400);
    }
  } catch (error) {
    next(error);
  }
});
routes.post("/verifyaccess", authObj.auth, async (req, res) => {
  try {
    if (req.access) {
      res
        .json({ accessToken: req.accessToken, userid: req.userid })
        .status(200);
    } else {
      res.json({ accessToken: false }).status(400);
    }
  } catch (error) {
    next(error);
  }
});
routes.post("/forgetpassword", async (req, res, next) => {
  try {
    let status = await service.forgetPassword(req.body);
    res.json({ status }).status(200);
  } catch (error) {
    next(error);
  }
});
routes.post("/reset", authObj.verifyJwt, async (req, res, next) => {
  try {
    if (req.body.status) {
      if (req.body.password) await service.Reset(req.body);
      res.json({ status: true }).status(200);
    } else {
      return res.json({ status: false }).status(400);
    }
  } catch (error) {
    next(error);
  }
});
routes.post("/contact", async (req, res, next) => {
  try {
    if (!req.body.captcha) return res.json({ success: false }).status(400);
    const secretKey = process.env.CAPTCHA_SECRET_KEY;
    const verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${req.body.captcha}`;
    fetch(verifyURL, {
      method: "post",
    })
      .then((response) => response.json())
      .then((google_response) => {
        if (google_response.success == true) {
          sendMailObj.sendContactMail(req.body);
          return res.json({ success: true }).status(200);
        } else {
          return res.json({ success: false }).status(400);
        }
      })
      .catch((error) => {
        next(error);
      });
  } catch (error) {
    next(error);
  }
});
routes.get("/", async (req, res, next) => {
  try {
    res.json("Ping Successful").status(200);
  } catch (error) {
    next(error);
  }
});

module.exports = routes;
