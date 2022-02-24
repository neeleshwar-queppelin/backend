const mongoose = require("mongoose");
const { isEmail } = require("validator");
const bcrypt = require("bcrypt");

const adminSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: [true, "Enter unique UserName"],
  },
  email: {
    type: String,
    required: [true, "Enter email!"],
    unique: true,
    lowercase: true,
    validate: [isEmail, "Enter a valid email"],
  },
  // image: {
  //   type: String,
  // },
  isAdmin: {
    type: Boolean,
  },
  walletAddress: {
    type: String,
    required: [true, "Enter Address"],
  },
  password: {
    type: String,
    required: [true, "Enter password"],
    minlength: 8,
    maxlength: 16,
  },
});

adminSchema.pre("save", async function (next) {
  const saltRounds = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, saltRounds);
  next();
});

//Static method for authenticate
adminSchema.statics.authenticate = async function (
  email,
  password,
  walletAddress
) {
  console.log("--------------------->STATIC METHOD CALL");
  var adminGot;
  await this.findOne({
    email: email,
    walletAddress: walletAddress,
  }).then((results) => {
    // console.log("Static method ,RES--", results);
    adminGot = results;
    console.log("Static method RESultsFound--", results, adminGot);
  });
  if (adminGot) {
    const auth = await bcrypt.compare(password, adminGot.password);
    if (auth) {
      console.log("auth in static", auth);
      return adminGot;
    } else {
      console.log("Error 1 in static");
      // throw Error("Invalid password");
    }
  } else {
    console.log("Error 2 in static");
    // throw Error("Invalid email");
  }
};

const Admin = mongoose.model("admin", adminSchema);

module.exports = Admin;
