// var express = require("express");
// var router = express.Router();
// const { Comment } = require("../models/index");

// router.post("/", async (req, res) => {
//   const body = req.body;
//   const response = {};
//   try {
//     const comment = await Comment.create(body);
//     Object.assign(response, {
//       status: 200,
//       message: "Success",
//       data: comment,
//     });
//   } catch {
//     Object.assign(response, {
//       status: 500,
//       message: "Server Error",
//     });
//   }
//   return res.status(response.status).json(response);
// });

// router.get("/:id", async (req, res) => {
//   const { id } = req.params;
//   const response = {};
//   try {
//     const comments = await Comment.find({ photo_id: id });
//     Object.assign(response, {
//       status: 200,
//       message: "Success",
//       data: comments,
//     });
//   } catch {
//     Object.assign(response, {
//       status: 500,
//       message: "Server Error",
//     });
//   }
//   return res.status(response.status).json(response);
// });

// module.exports = router;
var express = require("express");
var router = express.Router();
const { Comment } = require("../models/index");

// 📌 API: Thêm bình luận hoặc trả lời bình luận
router.post("/", async (req, res) => {
  const { user_id, photo_id, parent_id, fullname, username, description } = req.body;
  const response = {};

  try {
    const comment = await Comment.create({
      user_id,
      photo_id,
      parent_id: parent_id || null, // Nếu không có parent_id thì đây là bình luận gốc
      fullname,
      username,
      description,
      time: new Date(),
      likes: []
    });

    Object.assign(response, {
      status: 200,
      message: "Success",
      data: comment,
    });
  } catch (error) {
    Object.assign(response, {
      status: 500,
      message: "Server Error",
      error: error.message
    });
  }

  return res.status(response.status).json(response);
});

// 📌 API: Lấy tất cả bình luận của một ảnh (bao gồm trả lời)
// router.get("/:photo_id", async (req, res) => {
//   const { photo_id } = req.params;
//   const response = {};

//   try {
//     // Lấy tất cả bình luận gốc (parent_id = null)
//     const comments = await Comment.find({ photo_id, parent_id: null }).sort({ time: -1 }).lean();

//     // Lấy tất cả trả lời của bình luận
//     const allReplies = await Comment.find({ photo_id, parent_id: { $ne: null } }).sort({ time: 1 }).lean();

//     // Nhóm các trả lời vào đúng bình luận cha
//     comments.forEach(comment => {
//       comment.replies = allReplies.filter(reply => reply.parent_id.toString() === comment._id.toString());
//     });

//     Object.assign(response, {
//       status: 200,
//       message: "Success",
//       data: comments,
//     });
//   } catch (error) {
//     Object.assign(response, {
//       status: 500,
//       message: "Server Error",
//       error: error.message
//     });
//   }

//   return res.status(response.status).json(response);
// });

router.get("/:photo_id", async (req, res) => {
  try {
    const { photo_id } = req.params;

    // Lấy tất cả bình luận liên quan đến ảnh
    const allComments = await Comment.find({ photo_id }).sort({ time: 1 }).lean();

    // Hàm đệ quy để nhóm bình luận theo cha - con
    const buildCommentTree = (parentId = null) => {
      return allComments
        .filter(comment => String(comment.parent_id) === String(parentId))
        .map(comment => ({
          ...comment,
          replies: buildCommentTree(comment._id) // Gọi đệ quy để tìm reply của comment này
        }));
    };

    const commentTree = buildCommentTree(null); // Bắt đầu từ bình luận gốc
    res.json({ status: 200, message: "Success", data: commentTree });
  } catch (error) {
    res.status(500).json({ status: 500, message: "Server Error", error: error.message });
  }
});


// 📌 API: Like hoặc Unlike bình luận
router.post("/like/:id", async (req, res) => {
  const { user_id } = req.body;
  const response = {};

  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ status: 404, message: "Comment not found" });
    }

    // Kiểm tra nếu user đã like thì unlike, chưa like thì thêm vào
    const index = comment.likes.indexOf(user_id);
    if (index === -1) {
      comment.likes.push(user_id);
    } else {
      comment.likes.splice(index, 1);
    }

    await comment.save();

    Object.assign(response, {
      status: 200,
      message: "Success",
      data: comment,
    });
  } catch (error) {
    Object.assign(response, {
      status: 500,
      message: "Server Error",
      error: error.message
    });
  }

  return res.status(response.status).json(response);
});

// 📌 API: Xóa bình luận + Trả lời liên quan
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const response = {};

  try {
    // Xóa bình luận gốc và tất cả các reply liên quan
    await Comment.deleteMany({ $or: [{ _id: id }, { parent_id: id }] });

    Object.assign(response, {
      status: 200,
      message: "Comment and replies deleted successfully",
    });
  } catch (error) {
    Object.assign(response, {
      status: 500,
      message: "Server Error",
      error: error.message
    });
  }

  return res.status(response.status).json(response);
});

module.exports = router;
