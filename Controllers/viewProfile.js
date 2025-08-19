const viewProfile = async (req, res) => {
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
}

module.exports = viewProfile;