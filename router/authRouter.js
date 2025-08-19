const express = require("express");
const authRouter = express.Router();

const userAuth = require("../middleware/auth");

const { upload } = require("../middleware/multer")

const signup = require("../Controllers/signup");
const existence = require("../Controllers/existence");
const feed = require("../Controllers/feed");

//* POST /existence
authRouter.post("/existence", existence);

//* POST /signup
authRouter.post("/createProfile", upload.single('img'), signup);

//* GET /user/feed
authRouter.get("/user/feed", userAuth, feed)

module.exports = authRouter;