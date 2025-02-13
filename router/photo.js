var express = require("express");
var router = express.Router();
const photoController = require("../controllers/photo.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/", authMiddleware, photoController.getPhotoByUserId);
router.patch("/:id", authMiddleware, photoController.updatePhotoById);
router.patch("/share_status/:id", authMiddleware, photoController.changeShareStatus);
router.patch("/love/:id", authMiddleware, photoController.updateLovePhotoById);
router.delete("/:id", authMiddleware, photoController.deletePhotoById);
router.get("/:id", authMiddleware, photoController.getPhotoById);

module.exports = router;
