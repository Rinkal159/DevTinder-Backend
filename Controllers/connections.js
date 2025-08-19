const { User } = require("../model/User");
const { ConnectionRequest } = require("../model/connectRequest")

const connections = async (req, res) => {
    try {
        const id = req.id;

        // find accepted request profile either you sent the request and receiver accepted or you received the request and accepted and made connection
        const yourRequests = await ConnectionRequest.find({
            $or: [
                { receiverID: id },
                { senderID: id }
            ],
            requestStatus: "Accept"
        }).select('senderID receiverID')

        let connectionsIDS = [];

        yourRequests.forEach((req) => {
            if (req.senderID.toString() === id.toString()) {
                connectionsIDS.push(req.receiverID)
            } else {
                connectionsIDS.push(req.senderID)
            }

        })

        const connections = await User.find({ _id: { $in: connectionsIDS } })

        res.json(connections);

    } catch (err) {
        res.status(400).json(err.message);
    }
};

module.exports = connections;