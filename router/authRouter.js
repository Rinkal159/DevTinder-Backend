const express = require("express");
const authRouter = express.Router();

const { User } = require("../model/model");
const { ConnectionRequest } = require("../model/connectRequest")
const bcrypt = require("bcrypt");
const userAuth = require("../middleware/auth");
const cookieParser = require("cookie-parser")
const { encryptPassword } = require("../helper validation funcs/validations")

const { upload } = require("../middleware/multer")
const uploadFileOnCloudinary = require("../utils/cloudinary")

authRouter.use(express.json());
authRouter.use(cookieParser());

{
    // POST /signup

    authRouter.post("/signup", upload.single('img'), async (req, res) => {

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

            const { firstName, lastName, email, passWord, img, state, age, gender, occupation, techStacks, isMarried, goals } = req.body;

            // Encrypt the password
            const hashpw = await encryptPassword(passWord);

            const userData = new User({
                img: imageURL,
                firstName,
                lastName,
                email,
                passWord: hashpw,
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

            // TOKEN
            const token = await user.genJWT();

            // COOKIE
            res.cookie("token", token, {
                maxAge: 3600 * 1000, //3600= 1 hr in second, 3600*1000 =1 hr in miliseconds
                secure: true, //only send the cookies over HTTPS, not HTTP
                httponly: true, //JavaScript cannot access this cookie
                sameSite: "strict" //Only send cookies on same-site requests
            });

            
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
    // POST /login

    authRouter.post("/login", async (req, res, next) => {
        try {
            const { email, passWord } = req.body;

            const emailCheck = await User.findOne({ email: email });

            // calling email validation function
            if (!emailCheck) {
                throw new Error("Please check email and password.")
            }

            // calling password validation function
            const result = await emailCheck.verifyPassword(passWord);

            if (result) {

                // TOKEN
                const token = await emailCheck.genJWT();

                // COOKIE
                res.cookie("token", token, {
                    maxAge: 3600 * 1000, //3600= 1 hr in second, 3600*1000 =1 hr in miliseconds
                    secure: true, //only send the cookies over HTTPS, not HTTP
                    httponly: true, //JavaScript cannot access this cookie
                    sameSite: "strict" //Only send cookies on same-site requests
                });

                res.json({
                    data: emailCheck

                })


            } else {
                throw new Error(`Please check email and password.`)
            }

        } catch (err) {
            res.status(400).json({
                message: err.message
            })
        }
    })
}

{
    // POST //logout

    authRouter.post("/logout", userAuth, async (req, res) => {
        try {
            res
                .clearCookie("token", null, {
                    path: '/',
                    secure: true,
                    httpOnly: true,
                    sameSite: 'strict'
                })
                .json({
                    message: "You're successfully logged out!"
                })

        } catch (err) {
            res.status(400).send(`Something went wrong. ${err}`)
        }
    })
}

{
    // GET /user/feed

    authRouter.get("/user/feed", userAuth, async (req, res) => {
        try {
            // let page = parseInt(req.query.page) || 1;
            // let limit = parseInt(req.query.limit) || 10;
            // let skip = (page - 1) * 10;

            // if (limit > 10 || limit < 0) {
            //     limit = 10;
            // }

            const id = req.id;
            const user = req.user;

            // not included users in response
            const allUserData = await ConnectionRequest.find({
                $or: [
                    { senderID: id },
                    { $and: [{ receiverID: id }, { requestStatus: { $ne: "interested" } }] }
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
                    // .skip(skip)
                    // .limit(limit)


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