const dbModel = require("../utilities/dbConnection");
const moment = require("moment");
let userModel = {};

userModel.LoginModel = async (userObj) => {
  const model = await dbModel.getUserConnection();
  const verifyEmail = await model.findOne({ email: userObj.email });
  if (verifyEmail) {
    return verifyEmail;
  } else {
    let err = new Error();
    err.status = 404;
    err.message = "You are not registered";
    throw err;
  }
};
userModel.LoginUserIdModel = async (userid) => {
  const model = await dbModel.getUserConnection();
  const verifyEmail = await model.findOne({ userid });
  if (verifyEmail) {
    return verifyEmail;
  } else {
    return false;
  }
};
userModel.LoginStatusUpdate = async (refreshToken, userid) => {
  const model = await dbModel.getUserConnection();
  const verifyUserid = await model.findOne({ userid });
  if (verifyUserid) {
    const updateStatus = await model.updateOne(
      { userid: userid, isVerified: true },
      { $set: { refreshToken: refreshToken, isLoggedIn: true } }
    );
    if (updateStatus.nModified) {
      return true;
    } else {
      let err = new Error();
      err.status = 403;
      err.message = "Your email is not verified!";
      throw err;
    }
  } else {
    let err = new Error();
    err.status = 500;
    err.message = "Server is busy!Please try again later";
    throw err;
  }
};
userModel.RegisterUser = async (userObj) => {
  const model = await dbModel.getUserConnection();
  const checkUser = await model.findOne({ email: userObj.email });
  if (checkUser == null) {
    let insertuser = await model.create(userObj);
    if (insertuser) return true;
    else {
      let err = new Error();
      err.status = 500;
      err.message = "Server is busy! Please try again later";
      throw err;
    }
  } else {
    if (checkUser.isVerified == false) {
      await model.deleteOne({ email: userObj.email });
      let insertuser = await model.create(userObj);
      if (insertuser) return true;
    } else {
      let err = new Error();
      err.status = 400;
      err.message = "Email already exists!!!";
      throw err;
    }
  }
};
userModel.VerifyOtp = async (userid, jwtRefreshToken) => {
  const model = await dbModel.getUserConnection();
  const updateStatus = await model.updateOne(
    { userid: userid },
    {
      $set: {
        isVerified: true,
        isLoggedIn: true,
        refreshToken: jwtRefreshToken,
        otp: "",
        secret: "",
        lastUpdateOn: moment()
          .utcOffset("+05:30")
          .format("MMMM Do YYYY, h:mm:ss a"),
      },
    }
  );
  if (updateStatus.nModified) {
    return await model.findOne({ userid: userid });
  } else {
    let err = new Error();
    err.status = 500;
    err.message = "Server is busy!Please try again later";
    throw err;
  }
};
userModel.forgetPassword = async (userObj) => {
  const model = await dbModel.getUserConnection();
  const checkUser = await model.findOne({ email: userObj.email });
  if (checkUser == null) {
    let err = new Error();
    err.status = 404;
    err.message = "Please enter the registered email!";
    throw err;
  } else {
    let obj = {};
    obj.name = checkUser.name;
    obj.userId = checkUser.userid;
    return obj;
  }
};
userModel.Reset = async (obj) => {
  const model = await dbModel.getUserConnection();
  const updateStatus = await model.updateOne(
    { userid: obj.userid },
    {
      $set: {
        password: obj.password,
        lastUpdateOn: moment()
          .utcOffset("+05:30")
          .format("MMMM Do YYYY, h:mm:ss a"),
      },
    }
  );
  if (updateStatus.nModified) {
    return true;
  } else {
    let err = new Error();
    err.status = 500;
    err.message = "Server is busy!Please try again later";
    throw err;
  }
};
userModel.getProfile = async (userid) => {
  let model = await dbModel.getUserConnection();
  return await model.findOne(
    { userid: userid },
    { name: 1, gender: 1, username: 1, dob: 1, image: 1, _id: 0 }
  );
};
userModel.validateUsername = async (username) => {
  let model = await dbModel.getUserConnection();
  let usernamePresent = await model.findOne({ username: username });
  return usernamePresent ? false : true;
};
userModel.updateProfile = async (userid, obj) => {
  let model = await dbModel.getUserConnection();
  const updateProfile = await model.updateOne(
    { userid: userid, isVerified: true },
    {
      $set: {
        name: obj.name,
        gender: obj.gender,
        username: obj.username,
        dob: obj.dob,
        image: obj.image,
      },
    }
  );
  if (updateProfile.nModified) {
    return await model.findOne(
      { userid: userid },
      { name: 1, gender: 1, username: 1, dob: 1, image: 1, _id: 0 }
    );
  } else {
    let err = new Error();
    err.status = 500;
    err.message = "Server is busy!Please try again later";
    throw err;
  }
};

module.exports = userModel;
