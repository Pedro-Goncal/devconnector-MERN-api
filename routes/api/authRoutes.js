const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

//MODELS
const User = require("../../models/UserModel");

//=====================================================
// @desc      Test route
// @route     GET /api/auth
// @access    Public
//=====================================================
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

//=====================================================

//=====================================================
// @desc      Authenticate User and get Token
// @route     POST /api/auth
// @access    Public
//=====================================================
router.post(
  "/",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is requiered").exists(),
  ],
  async (req, res) => {
    //Validate fields
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid email or password" }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid email or password" }] });
      }

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: "5 days" },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.log(err.message);
      res.status(500).json({ errors: err.message });
    }
  }
);

//=====================================================

module.exports = router;
