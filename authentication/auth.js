const jwt = require('jsonwebtoken');
const {User} = require("../model/model")

async function userAuth(req, res, next) {
    try {
        const cookie = req.cookies;
        const { token } = cookie;

        if (!token) {
            throw new Error("Your session is expired. Please log in.");
        }

        const decodedData = await jwt.verify(token, "SECRET@VERYsecret123");
        
        const id = decodedData._id;

        if (!id) {
            throw new Error("User not found")
        }

        req.id = id;

        const user = await User.findById(id);
        req.user = user;

        next();

    } catch (err) {
        res.status(400).send(`Something went wrong! ${err.message}`)
    }

}

module.exports = userAuth;