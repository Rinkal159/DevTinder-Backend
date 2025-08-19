const { ConnectionRequest } = require("../model/connectRequest");
const { User } = require("../model/User");

const reviewReqAcceptOrReject = async (req, res) => {
    try {
        const id = req.id;
        const { requestStatus, senderID } = req.params;

        // you
        const loggedInUser = req.user;

        // the one who sent request to you
        const requestSender = await User.findById(senderID);
        if (!requestSender) {
            throw new Error(`User not found`)
        }

        const requestProfile = await ConnectionRequest.findOne({ senderID: senderID, receiverID: id });

        // to now allow outsider status
        const allowedStatus = ["Accept", "Reject"];
        if (!allowedStatus.includes(requestStatus)) {
            throw new Error(`Request status : ${requestStatus} is invalid`)
        }

        // check whether you have already accepted or rejected the request and again you trying to do same
        if (requestProfile.requestStatus === requestStatus) {
            if (requestStatus === "Accept") {
                throw new Error(`${loggedInUser.firstName.toUpperCase()}, You have already successfully ACCEPTED connection request of ${requestSender.firstName.toUpperCase()}`)

            } else {
                throw new Error(`${loggedInUser.firstName.toUpperCase()}, You have already successfully REJECTED connection request of ${requestSender.firstName.toUpperCase()}`)
            }
        }

        await ConnectionRequest.updateOne({ _id: requestProfile._id }, { requestStatus: requestStatus }, { runValidators: true })

        res.json(requestSender);

    } catch (err) {
        res.status(400).json(err.message);
    }
};

module.exports = reviewReqAcceptOrReject;