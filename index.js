var express = require("express");
var router = express.Router();
const mongoose = require("mongoose");
var path = require("path");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Models import
const User = require("./models/User");
const imgModel = require("./models/ImageSchema");
const Nft = require("./models/Nft");
const Admin = require("./models/Admin");
const { requireAuth } = require("./middleware/middleware");

const connectionUrl =
  "mongodb+srv://adminAccess:dfjPassword@cluster0.cm8cm.mongodb.net/user_Record?retryWrites=true&w=majority";

mongoose.connect(connectionUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const conn = mongoose.connection;

conn.once("open", () => {
  console.log("->DB CONNECTED");
});

//cookie age and signing
const maxAge = 60 * 60;
const createToken = function (id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: maxAge,
  });
};
// --------------------------------------------------- ---------------------------------------------------

router.get("/", (req, res) => {
  res.status(200).send("This is our NFT Node Backend!!");
});

router.get("/getImage/:filename", (req, res) => {
  imgModel.findOne({ name: req.params.filename }, (err, items) => {
    // console.log("ITEMS", items);
    if (err) {
      console.log(err);
      res.status(500).send("An error occurred", err);
    } else {
      res.send({ obj: items });
    }
  });
});

//routes

//create USER
router.post(
  "/createUser",
  //  upload.single("image"),
  async (req, res) => {
    console.log("/////////////////////----------->  ", req.body);

    User.findOne(
      { walletAddress: req.params.walletAddress },
      async (err, results) => {
        if (err) {
          console.log("err finding user -->", err);
          res.send("error");
        } else {
          // console.log(results);
          if (results != null) {
            res.send("Already Present!");
          } else {
            var obj = {
              name: req.body.originalName,
              img: { data: req.body.image, contentType: req.body.extension },
            };
            // console.log("Creating base64---->Obj", obj);

            try {
              const user = await User.create({
                realName: req.body.realName,
                userName: req.body.userName,
                email: req.body.email,
                image: req.body.originalName,
                walletAddress: req.body.walletAddress,
              });

              await imgModel.create(obj, (err, item) => {
                if (err) {
                  console.log(err);
                } else {
                  // item.save();
                  console.log("Image Uploaded");
                }
              });
              console.log("UserCreated", user);
              res.status(200).send("ok");
            } catch (e) {
              console.log("Errors (e)->", e);
              res.send("error");
            }
          }
        }
      }
    );
  }
);

// get All users
router.get("/getAllUsers", async (req, res) => {
  let data = await User.find();
  // console.log("All users---->", data);
  res.json({ message: "ok", data: data });
});

// get All users DPs
router.get("/getAllProfileImages", async (req, res) => {
  let data = await imgModel.find();
  // console.log("All users---->", data);
  res.json({ message: "ok", data: data });
});

///getUSER
router.get("/getUser/:walletAddress", async (req, res) => {
  // console.log("xxxxxxxxx", req.params);
  let data = await User.findOne({
    walletAddress: req.params.walletAddress,
  }).exec();
  // console.log("DATA >>>>>>>>>>>", data);

  if (data != null) {
    let imgData = await imgModel.findOne({ name: data.image }).exec();
    // console.log("image data/?????????//", imgData.img.data.toString("base64"));

    if (imgData != null) {
      // console.log("image data----->", imgData);
      res.send({
        obj: {
          img: imgData.img.data,
          result: data,
        },
      });
    } else {
      // console.log("no image data", imgData);
    }
  } else {
    // console.log("EMPTY <<<<<<<", data);
    res.send("empty");
  }
});

//update USER
router.post(
  "/updateUser",
  // upload.single("image"),
  async (req, res) => {
    // console.log("------------------>Update USER", req.body);

    User.findOneAndUpdate(
      { walletAddress: req.body.walletAddress },
      {
        $set: {
          realName: req.body.realName,
          userName: req.body.userName,
          email: req.body.email,
          image: req.body.originalName,
        },
      },
      {
        returnNewDocument: true,
      },
      async (err, results) => {
        if (err) {
          console.log("err finding user -->", err);
        } else {
          // console.log("Found a User---->", results);
          if (results != null) {
            console.log("Creating Logs------->");

            let iData = await imgModel
              .findOneAndUpdate(
                { name: results.image },
                {
                  $set: {
                    name: req.body.originalName,
                    img: {
                      data: req.body.image,
                      contentType: req.body.extension,
                    },
                  },
                }
              )
              .exec();
            if (!iData) {
              console.log(err);
            } else {
              // item.save();
              // console.log("Image  xxx----------------->", iData.img.data);
              res.send("ok");
            }
          } else {
            console.log("no records");
          }
        }
      }
    );
  }
);

router.post("/createNft", async (req, res) => {
  let x = req.body.encoded;
  console.log("Trimmed++++++++", x);
  // console.log("check nft duplicacy", req.body);

  Nft.findOne(
    { img: x },

    async (err, fetchResults) => {
      console.log("Exec---------->\n", fetchResults);

      if (fetchResults != null || "") {
        console.log("Duplicacy found NOT SAFE!!! to mint");
        res.send("duplicate");
      } else {
        var obj = {
          img: x,
          walletAddress: req.body.wAddress,
        };
        console.log("Creating");
        Nft.create(obj, (err, item) => {
          if (err) {
            console.log(err);
            res.send("errorCreating");
          } else {
            console.log("Image Uploaded");
            res.send("ok");
          }
        });
      }
    }
  );
});

//is duplicate nft---?
router.post("/IsDuplicateNFT", async (req, res) => {
  let x = req.body.encoded;
  Nft.findOne({ img: x }, async (err, fetchResults) => {
    if (fetchResults != null || "") {
      console.log("Duplicacy found NOT SAFE!!! to mint");
      res.send("duplicate");
    } else {
      console.log("this is new nft");
      res.send("NoDuplicate");
    }
  });
});
//login admin account
router.post("/getAdmin", async (req, res) => {
  console.log("GET Admin--->", req.body);
  try {
    let adminAuthed = await Admin.authenticate(
      req.body.email,
      req.body.password,
      req.body.walletAddress
    );
    // console.log(">>>>>>>>>>>>>.", adminAuthed);
    if (!adminAuthed) {
      res.send("err");
    } else {
      const token = createToken(adminAuthed._id);
      console.log("Token created-------->", token);
      res.cookie("jwtAdminLogin", token, {
        maxAge: 1000 * 60 * 60,
        secure: false,
      });
      res.status(200).json({
        message: "adminFound",
        results: {
          userName: adminAuthed.userName,
          email: adminAuthed.email,
          walletAddress: adminAuthed.walletAddress,
        },
      });
    }
  } catch (e) {
    console.log("Error while login static method", e);
    res.send("err");
  }
});

// Get all NFTs
router.get("/getAllNfts", requireAuth, async (req, res) => {
  let data = await Nft.find();
  // console.log("All users---->", data);
  res.json({ message: "ok", nfts: data });
});

// Get all NFTs
router.get("/getAllAdmins", requireAuth, async (req, res) => {
  let data = await Admin.find();
  // console.log("All users---->", data);
  res.json({ message: "ok", admins: data });
});

//create admin account (SignUp)
// router.post("/createAdmin", async (req, res) => {
//   console.log("Create Admin--->", req.body);

//   Admin.findOne({ email: req.body.email }, async (err, results) => {
//     console.log("RESULTS>", results);

//     if (err) {
//       console.log(err);
//       res.send("error");
//     } else {
//       if (results) {
//         console.log(" results for admin account with this email ", results);
//         res.send("error");
//       } else {
//         console.log(" creating new admin account with this email ");
//         try {
//           await Admin.create({
//             userName: req.body.userName,
//             email: req.body.email,
//             password: req.body.password,
//             walletAddress: req.body.walletAddress,
//           });
//           res.send("ok");
//         } catch (e) {
//           console.log("Error Admin create", e);
//           res.send("error");
//         }
//       }
//     }
//   });
// });
module.exports = router;
