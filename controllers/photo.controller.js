const { Photo, User } = require("../models/index");
//https://n54969-2102.csb.app/photos?userId=66359ec0efa3ce66748f5fbd
module.exports = {
  getPhotoByUserId: async (req, res) => {
    const response = {};
    const { userId } = req.query;
    try {
      await Photo.find({ user_id: userId })
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

  getPhotoById: async (req, res) => {
    const { id } = req.params;
    try {
      const photo = await Photo.findById(id);
      if (!photo) {
        return res.status(404).json({
          status: 404,
          message: "Not Found Photo",
        });
      }
      const user = await User.findById(photo.user_id);
      const data = photo.toObject();
      data.fullname = user ? user.fullname : null;
      data.username = user ? user.username : null;
      
      return res.status(200).json({
        status: 200,
        message: "Success",
        data,
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: "Server Error",
      });
    }
  },

  updatePhotoById: async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    try {
      const photo = await Photo.findByIdAndUpdate(id, updateData, { new: true });
      if (!photo) {
        return res.status(404).json({
          status: 404,
          message: "Photo not found",
        });
      }
      const user = await User.findById(photo.user_id);
      const data = photo.toObject();
      data.fullname = user ? user.fullname : null;
      data.username = user ? user.username : null;
      return res.status(200).json({
        status: 200,
        message: "Photo updated successfully",
        data,
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: "Server error",
        error: error.message,
      });
    }
  },

  deletePhotoById: async (req, res) => {
    const { id } = req.params;
    try {
      const photo = await Photo.findByIdAndDelete(id);
      if (!photo) {
        return res.status(404).json({
          status: 404,
          message: "Photo not found",
        });
      }
      return res.status(200).json({
        status: 200,
        message: "Photo deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: "Server error",
        error: error.message,
      });
    }
  },

  changeShareStatus: async (req, res) => {
    const { id } = req.params;
    const { share_status } = req.body;
    try {
      const photo = await Photo.findByIdAndUpdate(id, { share_status }, { new: true });
      if (!photo) {
        return res.status(404).json({
          status: 404,
          message: "Photo not found",
        });
      }
      return res.status(200).json({
        status: 200,
        message: "Share status updated successfully",
        data: photo,
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: "Server error",
        error: error.message,
      });
    }
  },

  updateLovePhotoById: async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body; 
    try {
      const photo = await Photo.findById(id);
      if (!photo) {
        return res.status(404).json({
          status: 404,
          message: "Photo not found",
        });
      }
      if (photo.love.includes(userId)) {
        photo.love = photo.love.filter(loveId => loveId !== userId);
      } else {
        photo.love.push(userId);
      }
      await photo.save();
      return res.status(200).json({
        status: 200,
        message: "Love updated successfully",
        data: photo.toObject(),
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
