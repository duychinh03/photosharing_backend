var express = require("express");
var router = express.Router();
const { Replycomment } = require("../models/index");

router.post("/", async (req, res) => {
  const body = req.body;
  const response = {};
  try {
    const reply = await Replycomment.create(body);
    Object.assign(response, {
      status: 200,
      message: "Success",
      data: reply,
    });
  } catch {
    Object.assign(response, {
      status: 500,
      message: "Server Error",
    });
  }
  return res.status(response.status).json(response);
});

router.get("/", async (req, res) => {
  const response = {};
  try {
    const replys = await Replycomment.find();
    Object.assign(response, {
      status: 200,
      message: "Success",
      data: replys,
    });
  } catch {
    Object.assign(response, {
      status: 500,
      message: "Server Error",
    });
  }
  return res.status(response.status).json(response);
});

module.exports = router;
