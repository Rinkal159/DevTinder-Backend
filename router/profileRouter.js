const express = require("express");
const profileRouter = express.Router();

const { User } = require("../model/model");
const userAuth = require("../middleware/auth");
const cookieParser = require("cookie-parser");
const { valodationToNotAllowInvalidFields } = require("../helper validation funcs/validations")
const { upload } = require("../middleware/multer")
const uploadFileOnCloudinary = require("../utils/cloudinary")

profileRouter.use(cookieParser())

{
    // GET /profile.view

    profileRouter.get("/profile/view", userAuth, async (req, res) => {

        try {
            const userData = req.user;

            if (!userData) {
                throw new Error("user not fount")
            }

            res.json(userData);

        } catch (err) {
            res.status(400).json({
                message: err.message
            })

        }
    })
}

{
    // DELETE /profile/delete

    profileRouter.delete("/profile/delete", userAuth, async (req, res) => {
        try {
            const id = req.id;
            await User.findByIdAndDelete(id);
            res.json({
                message: "Profile deleted successfully!",
                data: null
            });

        } catch (err) {
            res.status(400).send(`something went wrong. ${err}`)
        }
    })
}

{
    // POST /profile/update

    profileRouter.post("/profile/update", userAuth, async (req, res) => {

        try {
            const id = req.id;

            const { firstName, lastName, occupation, state, techStacks, goals } = req.body;

            const allowedFieldsForUpdation = ["firstName", "lastName", "occupation", "state", "techStacks", "goals"]

            const invalidKeysToUpdate = valodationToNotAllowInvalidFields(allowedFieldsForUpdation, req);
            if (invalidKeysToUpdate.length > 0) {
                throw new Error(`cannot update fields : ${invalidKeysToUpdate}`)
            }

            // updation
            await User.updateOne({ _id: id }, {
                firstName,
                lastName,
                occupation,
                state,
                techStacks,
                goals

            }, { runValidators: true });
            const updatedUser = await User.findById(id);

            res.json(updatedUser)

        } catch (err) {
            res.status(400).json({
                status: "failed",
                message: err.message
            })
        }

    })

}


{
    //POST /profile/update/picture

    profileRouter.post("/profile/update/picture", userAuth, upload.single('img'), async (req, res) => {
        try {
            const id = req.id;

            if (!req.file) {
                res.status(400).json({
                    status: "failed",
                    message: "No image uploaded"
                })
            }

            const localIMGPath = req.file.path;

            const imgURL = await uploadFileOnCloudinary(localIMGPath);

            if (!imgURL) {
                res.status(400).json({
                    status: "failed",
                    message: "Image upload failed!"
                })
            }

            await User.findByIdAndUpdate({ _id: id }, { img: imgURL });
            const updatedUser = await User.findById(id)


            res.json(updatedUser);

        } catch (err) {
            res.status(400).json({
                status: "failed",
                message: err.message
            })
        }
    })
}


module.exports = profileRouter;

