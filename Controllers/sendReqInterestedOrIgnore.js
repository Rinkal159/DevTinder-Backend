const { ConnectionRequest } = require("../model/connectRequest")
const { User } = require("../model/User");

const sendReqInterestedOrIgnore = async (req, res) => {
    try {
        const senderID = req.id;
        const { requestStatus, receiverID } = req.params;

        // sender profile
        const sender = req.user;

        // receiver profile //check if receiver exists
        const receiver = await User.findById(receiverID);
        if (!receiver) {
            throw new Error(`User not found`)
        }

        // to not allow sending request to himself/herself
        if (senderID === receiverID) {
            throw new Error(`${sender.firstName}, You cannot send request to YOU!`)
        }


        // check existing request of sender to same receiver. 
        const existingRequestOfSender = await ConnectionRequest.findOne({ senderID: senderID, receiverID: receiverID });

        if (existingRequestOfSender) {
            if (requestStatus === existingRequestOfSender.requestStatus) {
                if (requestStatus === "interested") {
                    throw new Error(`${sender.firstName.toUpperCase()}, You have already sent connection request to ${receiver.firstName.toUpperCase()}`)
                } else {
                    throw new Error(`${sender.firstName.toUpperCase()}, You have already Ignored connection request to ${receiver.firstName.toUpperCase()}`)
                }
            }
        }

        const requestData = new ConnectionRequest({
            senderID,
            receiverID,
            requestStatus
        })

        await requestData.save();

        res.json(receiver);

    } catch (err) {
        res.status(400).send(`Something went wrong! ${err}`)
    }
};

module.exports = sendReqInterestedOrIgnore;