const express = require("express");
const authRouter = express.Router();

const { User } = require("../model/model");
const { ConnectionRequest } = require("../model/connectRequest")
const userAuth = require("../middleware/auth");
const cookieParser = require("cookie-parser")

const { upload } = require("../middleware/multer")
const uploadFileOnCloudinary = require("../utils/cloudinary")

authRouter.use(express.json());
authRouter.use(cookieParser());

{
    authRouter.post("/existence", async(req, res) => {
        try {
            const email = req.body;
            
            const user = await User.findOne({ email : email.email })
            
            res.json(user);

        } catch (err) {
            res.status(400).json({
                success : 'failed',
                message : err.message
            })
        }

    })
}

{
    // POST /signup

    authRouter.post("/createProfile", upload.single('img'), async (req, res) => {

        try {
            

            if (!req.file) {
                res.status(400).json({
                    message: "No image uploaded"
                })
            }

            // coming from multer
            const localPath = req.file.path;

            // going to cloudinary
            const imageURL = await uploadFileOnCloudinary(localPath);

            if (!imageURL) {
                res.status(400).json({
                    message: "Image upload failed"
                })
            }

            const { firstName, lastName, email, img, state, age, gender, occupation, techStacks, isMarried, goals } = req.body;

            console.log(firstName);
            

            if (!Array.isArray(techStacks) && techStacks.length === 0) {
                throw new Error(`Tech Stack is required.`)
            }
            if (!Array.isArray(goals) && goals.length === 0) {
                throw new Error(`Goal is required.`)
            }


            const userData = new User({
                img: imageURL,
                firstName,
                lastName,
                email,
                state,
                age,
                gender,
                occupation,
                techStacks,
                isMarried,
                goals
            });


            await userData.save();

            const user = await User.findOne({ email: email });


            res.status(200).json({
                data: user
            })

        } catch (err) {

            res.status(400).json({
                message: err.message
            })
        }

    })
}


{
    // GET /user/feed

    authRouter.get("/user/feed", userAuth, async (req, res) => {
        try {

            const id = req.id;
            const user = req.user;

            // not included users in response
            const allUserData = await ConnectionRequest.find({
                $or: [
                    { senderID: id },
                    { receiverID: id }
                ]
            }).select("senderID receiverID");


            let arr = [];
            allUserData.forEach((user) => {
                arr.push(user.senderID);
                arr.push(user.receiverID);
            })

            // get the feed
            const expectedUsers = await
                User.find({ $and: [{ _id: { $nin: arr } }, { _id: { $ne: id } }] })
                    .select("img firstName lastName state age gender occupation techStacks goals")


            res.json({
                data: expectedUsers
            })

        }


        catch (err) {
            res.status(400).json({
                message: err.message
            })
        }
    })
}

module.exports = authRouter;