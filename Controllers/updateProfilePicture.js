const { User } = require("../model/User");
const uploadFileOnCloudinary = require("../utils/cloudinary");

const updateProfilePicture = async (req, res) => {
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
};

module.exports = updateProfilePicture;