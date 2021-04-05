const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");

//MODELS
const Post = require("../../models/PostModel");
const User = require("../../models/UserModel");
const Profile = require("../../models/ProfileModel");

//=====================================================
// @desc      Create A post
// @route     POST /api/posts
// @access    Private
//=====================================================
router.post(
  "/",
  [auth, [check("text", "Text is requiered").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select("-password");

      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });

      const post = await newPost.save();

      res.json(post);
    } catch (err) {
      console.log(err.message);
      res.status(500).json({ msg: "Server Error" });
    }
  }
);

//=====================================================

//=====================================================
// @desc      Get all posts
// @route     GET /api/posts
// @access    Private
//=====================================================

router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

//=====================================================

//=====================================================
// @desc      Get post by id
// @route     GET /api/posts/:id
// @access    Private
//=====================================================

router.get("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    res.json(post);
  } catch (err) {
    console.log(err.message);
    if (error.kind == "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }

    res.status(500).json({ msg: "Server Error" });
  }
});

//=====================================================

//=====================================================
// @desc      Delete a posts
// @route     DELETE /api/posts/:id
// @access    Private
//=====================================================

router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    //Check user
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    await post.remove();

    res.json({ msg: "Post removed" });
  } catch (err) {
    console.log(err.message);
    if (error.kind == "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.status(500).json({ msg: "Server Error" });
  }
});

//=====================================================

//=====================================================
// @desc      Add Like to post
// @route     PUT /api/posts/like/:id
// @access    Private
//=====================================================

router.put("/like/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    //Check if post already been liked by user
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      return res.status(400).json({ msg: "Post already liked" });
    }

    post.likes.unshift({ user: req.user.id });

    await post.save();

    res.json(post.likes);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

//=====================================================

//=====================================================
// @desc      Remove like from post
// @route     PUT /api/posts/unlike/:id
// @access    Private
//=====================================================

router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    //Check if post already been liked by user
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    ) {
      return res.status(400).json({ msg: "Post has not yet been liked" });
    }

    //Get remove index
    const removeIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);

    post.likes.splice(removeIndex, 1);

    await post.save();

    res.json(post.likes);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

//=====================================================

//=====================================================
// @desc      Comment on a post
// @route     POST /api/posts/comment/:id
// @access    Private
//=====================================================
router.post(
  "/comment/:id",
  [auth, [check("text", "Text is requiered").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select("-password");
      const post = await Post.findById(req.params.id);

      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };

      post.comments.unshift(newComment);

      await post.save();

      res.json(post.comments);
    } catch (err) {
      console.log(err.message);
      res.status(500).json({ msg: "Server Error" });
    }
  }
);

//=====================================================

//=====================================================
// @desc      Delete comment
// @route     DELETE /api/posts/comment/:id/:comment_id
// @access    Private
//=====================================================

router.delete("/comment/:id/:comment_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    //Pull out comment
    const comment = post.comments.find(
      (comment) => comment.id === req.params.comment_id
    );

    //Make sure comment exists
    if (!comment) {
      return res.status(404).json({ msg: "Comment does not exist" });
    }

    //Check user
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    //Get remove index
    const removeIndex = post.comments
      .map((comment) => comment.user.toString())
      .indexOf(req.user.id);

    post.comments.splice(removeIndex, 1);

    await post.save();

    res.json(post.comments);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

//=====================================================

module.exports = router;
