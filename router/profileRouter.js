const express = require("express");
const profileRouter = express.Router();

const userAuth = require("../middleware/auth");

const { upload } = require("../middleware/multer");

const viewProfile = require("../Controllers/viewProfile");
const deleteProfile = require("../Controllers/deleteProfile");
const updateProfile = require("../Controllers/updateProfile");
const updateProfilePicture = require("../Controllers/updateProfilePicture");

//* GET /profile/view
profileRouter.get("/profile/view", userAuth, viewProfile);

//* DELETE /profile/delete
profileRouter.delete("/profile/delete", userAuth, deleteProfile);

//* POST /profile/update
profileRouter.post("/profile/update", userAuth, updateProfile);

//* POST /profile/update/picture
profileRouter.post("/profile/update/picture", userAuth, upload.single('img'), updateProfilePicture);

module.exports = profileRouter;

