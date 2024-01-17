const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
var fetchuser = require("../middleware/fetchuser");
require('dotenv').config()

const JWT_SECRET = process.env.REACT_APP_SECRET;
//Route1: create a user using http://localhost:5000/api/auth/createuser
router.post(
  "/createuser",
  body("email", "Enter a valid Email").isEmail(),
  body("password", "Password must be atleast 5 characters").isLength({
    min: 5,
  }),
  async (req, res) => {
    let success = false;
    //if the validation error array is empty run the code
    const error = validationResult(req);
    if (error.isEmpty()) {
      try {
        let user = await User.findOne({ email: req.body.email });
        if (user) {
          return res
            .status(400)
            .json({success, error: "Sorry a user with this email already exists" });
        }else{
          const salt = await bcrypt.genSalt(10);
          const secPass = await bcrypt.hash(req.body.password, salt);
          //create a new user
          user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass,
          });
          const data = {
            user: {
              id: user._id,
            },
          };
          const token = jwt.sign(data, JWT_SECRET);
          success= true;
          res.json({success, token});
        }
      } catch (error) {
        console.error(error.message);
        res.status(500).send(error);
      }
    } //if the result array wasnt empty display the result
    else {
      res.send({ errors: result.array() });
    }
  }
);

//Route2: authenticate a user using http://localhost:5000/api/auth/login
router.post(
  "/login",
  body("email", "Enter a valid Email").isEmail(),
  body("password", "Password cannot be blank").exists(),
  async (req, res) => {
    let success = false;
    //if there is no validation error array run the code
    const error = validationResult(req);
    if (error.isEmpty()) {
      const { email, password } = req.body;
      try {
        let user = await User.findOne({ email });
        if (!user) {
          success = false
          return res
            .status(400)
            .json({ error: "Please try to login with correct credentials!" });
        } else {
          const passwordCompare = await bcrypt.compare(password, user.password);
          if (!passwordCompare) {
            success = false
            return res
              .status(400)
              .json({ error: "Please try to login with correct credentials!" });
          }
          const data = {
            user: {
              id: user._id,
            },
          };
          // console.log(data)
          const token = jwt.sign(data, JWT_SECRET);
          success = true;
          res.json({success, token });
        }
      } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
      }
    } else {
      res.send({ errors: result.array() });
    }
  }
);

//Route3: get user data using http://localhost:5000/api/auth/getuser
router.post("/getuser", fetchuser, async (req, res) => {
  try {
    const userId = req.user.id;
    // console.log(userId)
    const user = await User.findById(userId).select("-password");
    res.send(user)
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
