const { User } = require("../models/index");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const bcrypt = require("bcrypt");
const saltRounds = 10;
module.exports = {
  getUser: async (req, res) => {
    const response = {};
    try {
      await User.find().select("-password")
        .then((res) => {
          Object.assign(response, {
            status: 200,
            message: "Success",
            data: res,
          });
        })
        .catch((e) => {
          Object.assign(response, {
            status: 404,
            message: "Not Found",
          });
        });
    } catch {
      Object.assign(response, {
        status: 500,
        message: "Server Error",
      });
    }
    return res.status(response.status).json(response);
  },

  getUserById: async (req, res) => {
    const response = {};
    const { id } = req.params;
    try {
      await User.findOne({ _id: id }).select("-password")
        .then((res) => {
          Object.assign(response, {
            status: 200,
            messagge: "Succees",
            data: res,
          });
        })
        .catch((e) => {
          Object.assign(response, {
            status: 404,
            messagge: "Not Found",
          });
        });
    } catch {
      Object.assign(response, {
        status: 500,
        messagge: "Server Error",
      });
    }
    return res.status(response.status).json(response);
  },

  changePassword: async (req, res) => {
    const response = {};
    const { username } = req.params;
    const { password } = req.body;
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "Username not exist!",
      });
    }
    try {
      const salt = bcrypt.genSaltSync(saltRounds);
      const hash = bcrypt.hashSync(password, salt);
      const user = await User.updateOne(
        { username: username },
        { password: hash },
      );
      Object.assign(response, {
        status: 200,
        message: "Succees",
        data: user,
      });
    } catch {
      Object.assign(response, {
        status: 500,
        message: "Server Error",
      });
    }
    return res.status(response.status).json(response);
  },

  updateUser: async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.dob) {
      let parsedDob = new Date(updateData.dob);
  
      if (isNaN(parsedDob.getTime()) && updateData.dob.includes('/')) {
        const parts = updateData.dob.split('/');
        if (parts.length === 3) {
          const formattedDob = `${parts[2]}-${parts[1]}-${parts[0]}`;
          parsedDob = new Date(formattedDob);
        }
      }

      if (isNaN(parsedDob.getTime()) && updateData.dob.includes('-')) {
        const parts = updateData.dob.split('-');
        if (parts.length === 3) {
          const formattedDob = `${parts[2]}-${parts[1]}-${parts[0]}`;
          parsedDob = new Date(formattedDob);
        }
      }
  
      if (isNaN(parsedDob.getTime())) {
        return res.status(400).json({
          status: 400,
          message: "Invalid date format for dob",
        });
      }
      updateData.dob = parsedDob;
    }
  
    try {
      const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });
      if (!updatedUser) {
        return res.status(404).json({
          status: 404,
          message: "User not found",
        });
      }
      return res.status(200).json({
        status: 200,
        message: "User updated successfully",
        data: updatedUser.toObject(),
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: "Server error",
        error: error.message,
      });
    }
  },

  handleFollow: async (req, res) => {
    const currentUserId = req.user && req.user._id;
    const { followId } = req.body;
  
    try {
      const user = await User.findById(currentUserId);
      if (!user) {
        return res.status(404).json({
          status: 404,
          message: "User not found",
        });
      }
  
      let message = "";
      if (user.follow.includes(followId)) {
        user.follow = user.follow.filter(id => id !== followId);
        message = "Unfollowed successfully";
      } else {
        user.follow.push(followId);
        message = "Followed successfully";
      }
      
      await user.save();
      return res.status(200).json({
        status: 200,
        message,
        data: user.toObject(),
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: "Server error",
        error: error.message,
      });
    }
  },
};
