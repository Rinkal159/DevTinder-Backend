const { User } = require("../model/User");
const { ConnectionRequest } = require("../model/connectRequest");

const feed = async (req, res) => {
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
}

module.exports = feed;
