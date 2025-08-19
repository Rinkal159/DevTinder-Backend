const { User } = require("../model/User");
const { ConnectionRequest } = require("../model/connectRequest")

const deleteReq = async (req, res) => {
    try {
        const id = req.id;
        const { receiverID, status } = req.params;

        const receiver = await User.findById(receiverID);
        if (!receiver) {
            throw new Error("User not found");
        }

        await ConnectionRequest.updateOne({ senderID: id, receiverID: receiverID }, { requestStatus: status });

        res.json(receiver);
    }
    catch (err) {
        res.status(400).json(err.message);
    }
};

module.exports = deleteReq;