const mongoose = require("mongoose");
const { isEmail } = require("validator");

const userSchema = new mongoose.Schema({
  realName: {
    type: String,
    required: [true, "Enter name"],
  },
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
  image: {
    type: String,
  },
  walletAddress: {
    type: String,
    required: [true, "Enter Address"],
  },
});

//Static method for authenitcate
userSchema.statics.authenitcate = async function (walletAddress) {
  const user = await this.findOne({ userName }, (err, results) => {
    if (err) console.log("RES--ERRORS", err);
    console.log("RES--", results);
  });
  if (user) {
    return user;
  } else {
    throw Error("Invalid Address");
  }
};

const User = mongoose.model("user", userSchema);

module.exports = User;
