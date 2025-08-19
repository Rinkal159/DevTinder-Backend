const { User } = require("../model/User");

const existence = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email: email })

        res.json(user);

    } catch (err) {
        res.status(400).json({
            success: 'failed',
            message: err.message
        })
    }
}

module.exports = existence;