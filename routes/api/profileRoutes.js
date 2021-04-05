const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const request = require("request");
const { check, validationResult } = require("express-validator");

//MODELS
const User = require("../../models/UserModel");
const Profile = require("../../models/ProfileModel");
const Post = require("../../models/PostModel");

//=====================================================
// @desc      Get current user profile
// @route     GET /api/profile/me
// @access    Private
//=====================================================
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("user", ["name", "avatar"]);

    if (!profile) {
      return res.status(400).json({ msg: "There is no profile for this use" });
    }

    res.json(profile);
  } catch (err) {
    console.log(err);

    res.status(500).json({ msg: "Server Error" });
  }
});

//=====================================================

//=====================================================
// @desc      Create or update user profile
// @route     POST /api/profile/
// @access    Private
//=====================================================
router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is required").not().isEmpty(),
      check("skills", "Skills is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      company,
      website,
      location,
      bio,
      status,
      gitHubUsername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedIn,
    } = req.body;

    //Build profile object
    const profileFields = {};

    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (gitHubUsername) profileFields.gitHubUsername = gitHubUsername;
    if (skills) {
      profileFields.skills = skills.split(",").map((skill) => skill.trim());
    }

    //Build social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedIn) profileFields.social.linkedIn = linkedIn;
    if (instagram) profileFields.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );

        return res.json(profile);
      }

      profile = new Profile(profileFields);

      await profile.save();
      res.json(profile);
    } catch (err) {
      console.log(err.message);
      res.status(500).json({ msg: "Server Error" });
    }
  }
);
//=====================================================

//=====================================================
// @desc      Get all profiles
// @route     GET /api/profile/
// @access    Public
//=====================================================

router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    res.json(profiles);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

//=====================================================

//=====================================================
// @desc      Get profile bu user id
// @route     GET /api/profile/user/:user_id
// @access    Public
//=====================================================

router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["name", "avatar"]);
    if (!profile) return res.status(400).json({ msg: "Profile not found" });

    res.json(profile);
  } catch (err) {
    console.log(err.message);
    if (err.kind == "ObjectId") {
      return res.status(400).json({ msg: "Profile not found" });
    }
    res.status(500).json({ msg: "Server Error" });
  }
});

//=====================================================

//=====================================================
// @desc      Delete profile, user & posts
// @route     DELETE /api/profile/
// @access    Private
//=====================================================

router.delete("/", auth, async (req, res) => {
  try {
    //Remove user posts
    await Post.deleteMany({ user: req.user.id });

    //Remove profile
    await Profile.findOneAndRemove({ user: req.user.id });

    //Remove User
    await User.findOneAndRemove({ _id: req.user.id });

    res.json({ msg: "User deleted" });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

//=====================================================

//=====================================================
// @desc      Add profile experience
// @route     PUT /api/profile/experience
// @access    Private
//=====================================================

router.put(
  "/experience",
  [
    auth,
    [
      check("title", "Title is requiered").not().isEmpty(),
      check("company", "Company is requiered").not().isEmpty(),
      check("from", "From date is requiered").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    } = req.body;

    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.experience.unshift(newExp);

      await profile.save();

      res.json(profile);
    } catch (err) {
      console.log(err.message);
      res.status(500).json({ msg: "Server Error" });
    }
  }
);

//=====================================================

//=====================================================
// @desc      Delete experience from profile
// @route     DELETE /api/profile/experience/:exp_id
// @access    Private
//=====================================================

router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    //Get remove index
    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);

    profile.experience.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

//=====================================================

//=====================================================
// @desc      Add profile education
// @route     PUT /api/profile/education
// @access    Private
//=====================================================

router.put(
  "/education",
  [
    auth,
    [
      check("school", "School is requiered").not().isEmpty(),
      check("degree", "Degree is requiered").not().isEmpty(),
      check("from", "From date is requiered").not().isEmpty(),
      check("fieldOfStudy", "Field of Study is requiered").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      school,
      degree,
      fieldOfStudy,
      from,
      to,
      current,
      description,
    } = req.body;

    const newEdu = {
      school,
      degree,
      fieldOfStudy,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.education.unshift(newEdu);

      await profile.save();

      res.json(profile);
    } catch (err) {
      console.log(err.message);
      res.status(500).json({ msg: "Server Error" });
    }
  }
);

//=====================================================

//=====================================================
// @desc      Delete education from profile
// @route     DELETE /api/profile/education/:edu_id
// @access    Private
//=====================================================

router.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    //Get remove index
    const removeIndex = profile.education
      .map((item) => item.id)
      .indexOf(req.params.edu_id);

    profile.education.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

//=====================================================

//=====================================================
// @desc      Get  user repos from Github
// @route     GET /api/profile/github/:username
// @access    Public
//=====================================================

router.get("/github/:username", async (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${process.env.GITHUB_CLIENTID}&client_secret${process.env.GITHUB_SECRET}`,
      method: "GET",
      headers: { "user-agent": "node.js" },
    };

    request(options, (error, response, body) => {
      if (error) console.log(error);

      if (response.statusCode !== 200) {
        return res.status(404).json({ msg: "No Github profile found" });
      }

      res.json(JSON.parse(body));
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

//=====================================================

module.exports = router;
