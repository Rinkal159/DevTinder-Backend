const { User } = require("../model/User");


const deleteProfile = async (req, res) => {
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
}
module.exports = deleteProfile;