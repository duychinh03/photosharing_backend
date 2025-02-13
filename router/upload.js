var express = require("express");
var router = express.Router();
const { Photo } = require("../models/index");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "./public/images");
  },
  filename: function (req, file, cb) {
    return cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, and JPG, WEBP images are allowed!"), false);
    // return res.status(400).json({ status: 400, message: "Only JPEG, PNG, and JPG, WEBP images are allowed!" });
  }
};

const upload = multer({ storage, fileFilter });

router.post("/", upload.array("files", 10), async (req, res) => {
  try {
    const token = req.get("Authorization")?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ status: 401, message: "Unauthorized" });
    }

    const { JWT_SECRET } = process.env;
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ status: 400, message: "No files uploaded" });
    }

    const uploadedPhotos = await Promise.all(
      req.files.map(async (file) => {
        return await Photo.create({
          user_id: userId,
          img: file.filename,
          name: "",
          description: "",
          share_status: "public",
          love: [],
          created_at: new Date(),
        });
      })
    );

    return res.status(200).json({
      status: 200,
      message: "Upload Success",
      data: uploadedPhotos.map(photo => ({
        ...photo._doc,
        img_url: `${req.protocol}://${req.get("host")}/images/${photo.img}`,
      })),
    });
  } catch (error) {
    // console.error("Upload error:", error);
    return res.status(500).json({ status: 500, message: "Upload failed! Server Error!" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const photo = await Photo.findById(id);

    if (!photo) {
      return res.status(404).json({ status: 404, message: "Photo not found" });
    }

    const filePath = path.join(__dirname, "../public/images", photo.img);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Photo.deleteOne({ _id: id });

    return res.status(200).json({ status: 200, message: "Delete Success" });
  } catch (error) {
    console.error("Delete error:", error);
    return res.status(500).json({ status: 500, message: "Server Error!" });
  }
});

module.exports = router;

