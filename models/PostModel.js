const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectID,
    ref: "user",
  },
  text: { type: String, required: true },
  name: { type: String },
  avatar: { type: String },
  likes: [
    {
      user: { type: mongoose.Schema.Types.ObjectID, ref: "user" },
    },
  ],
  comments: [
    {
      user: { type: mongoose.Schema.Types.ObjectID, ref: "user" },
      text: { type: String, required: true },
      name: { type: String },
      avatar: { type: String },
      date: { type: Date, default: Date.now },
    },
  ],
  date: { type: Date, default: Date.now },
});

const Post = mongoose.model("post", postSchema);

module.exports = Post;
