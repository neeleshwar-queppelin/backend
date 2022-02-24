const mongoose = require("mongoose");

const nftSchema = new mongoose.Schema({
  name: String,
  description: String,
  owner: String,
  img: {
    type: String,
    required: [true, "Enter Image"],
  },
  walletAddress: {
    type: String,
    required: [true, "Enter Address"],
  },
});

const Nft = mongoose.model("nft", nftSchema);

module.exports = Nft;
