require("dotenv").config();
const mongoose = require("mongoose");
const url = process.env.URL_MONGODB;
mongoose.connect(url);
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  fullname: String,
  address: String,
  dob: Date,
  phone: String,
  description: String,
  follow: Array,
  occupation: String,
});
const User = mongoose.model("users", userSchema);
const photoSchema = new mongoose.Schema({
  user_id: String,
  img: String,
  name: String,
  description: String,
  share_status: String,
  love: Array,
  created_at: Date,
});

const Photo = mongoose.model("photos", photoSchema);

const blackListSchema = new mongoose.Schema({
  token: String,
  expired: Date,
});
const Blacklist = mongoose.model("blackList", blackListSchema);

// const commentSchema = new mongoose.Schema({
//   user_id: String,
//   photo_id: String,
//   fullname: String,
//   username: String,
//   description: String,
//   time: Date,
// });


// const commentSchema = new mongoose.Schema({
//   user_id: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true }, // Người bình luận
//   photo_id: { type: mongoose.Schema.Types.ObjectId, ref: "photos", required: true }, // Ảnh được bình luận
//   parent_id: { type: mongoose.Schema.Types.ObjectId, ref: "comments", default: null }, // Bình luận cha (nếu có)
//   fullname: { type: String, required: true }, // Tên đầy đủ của người bình luận
//   username: { type: String, required: true }, // Username của người bình luận
//   description: { type: String, required: true }, // Nội dung bình luận
//   time: { type: Date, default: Date.now }, // Thời gian bình luận
//   likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }] // Danh sách người đã like
// });

const commentSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  photo_id: { type: mongoose.Schema.Types.ObjectId, ref: "photos", required: true },
  parent_id: { type: mongoose.Schema.Types.ObjectId, ref: "comments", default: null }, // Trả lời bình luận nào
  fullname: { type: String, required: true },
  username: { type: String, required: true },
  description: { type: String, required: true },
  time: { type: Date, default: Date.now },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }]
});

const Comment = mongoose.model("comments", commentSchema);

const replyCommentSchema = new mongoose.Schema({
  user_id: String,
  username: String,
  description: String,
  time: Date,
  reply_to: String,
});

const Replycomment = mongoose.model("replyComment", replyCommentSchema);

module.exports = { User, Photo, Blacklist, Comment, Replycomment };
