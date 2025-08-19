const { User } = require("../model/User");

const uploadFileOnCloudinary = require("../utils/cloudinary")
const mailSender = require("../utils/sendMail");

const signup = async (req, res) => {
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

        await mailSender(email, firstName);

        const user = await User.findOne({ email: email });

        res.status(200).json({
            data: user
        })

    } catch (err) {

        res.status(400).json({
            message: err.message
        })
    }
}

module.exports = signup;