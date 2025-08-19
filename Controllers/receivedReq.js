const { User } = require("../model/User");
const { ConnectionRequest } = require("../model/connectRequest")

const receivedReq = async (req, res) => {
    try {
        const id = req.id;

        // get all requests you received
        const yourRequests = await ConnectionRequest
            .find({ receiverID: id, requestStatus: "Interested" })
            .select('senderID')

        let arr = [];

        yourRequests.forEach((req) => {
            arr.push(req.senderID.toString());
        })

        const receivedRequests = await User.find({ _id: { $in: arr } });

        res.json(receivedRequests);

    } catch (err) {
        res.status(400).json(err.message);
    }
};

module.exports = receivedReq;