const { User } = require("../model/User");
const { ConnectionRequest } = require("../model/connectRequest")

const sentReq = async (req, res) => {
    try {
        const id = req.id;

        // get all requests you sent
        const yourRequests = await ConnectionRequest
            .find({ senderID: id, requestStatus: "Interested" })
            .select('receiverID')

        let arr = [];

        yourRequests.forEach((req) => {
            arr.push(req.receiverID.toString());
        })

        const sentRequests = await User.find({ _id: { $in: arr } });

        res.json(sentRequests);

    } catch (err) {
        res.status(400).json(err.message);
    }
};

module.exports = sentReq;