require("dotenv").config();
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const requireAuth = function (req, res, next) {
  const token = req.cookies.jwtAdminLogin;
  console.log("TOKENS ---->", token);
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
      if (err) {
        console.log("JWT token not match!", err);
        res.send("NOT_MATCH");
      } else {
        console.log("DECODED TOKEN =" + decodedToken, decodedToken.id);
        next();
      }
    });
  } else {
    console.log("NO JWT token ");
    res.send("NO_TOKEN");
  }
};

//check current admin
const checkAdmin = (req, res, next) => {
  console.log("CHECK Admin");
  const token = jwt.cookies.jwtAdminLogin;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
      if (err) {
        console.log("Invalid token" + err);
        res.locals.admin = null;
        next();
      } else {
        console.log("Admin token" + decodedToken);
        const admin = await Admin.findById(decodedToken.id);
        res.locals.admin = admin;
        next();
      }
    });
  } else {
    res.locals.admin = null;
    next();
  }
};

module.exports = { requireAuth, checkAdmin };
