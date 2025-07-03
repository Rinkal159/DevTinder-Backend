const express = require("express");
const requestsRouter = express.Router();

const { ConnectionRequest } = require("../model/connectRequest")
const { User } = require("../model/model")
const userAuth = require("../middleware/auth")
const cookieParser = require("cookie-parser");

requestsRouter.use(cookieParser())

{
    // POST /request/send/:requestStatus/:receiverID
    // interested or ignored

    requestsRouter.post("/request/send/:requestStatus/:receiverID", userAuth, async (req, res) => {
        try {

            const senderID = req.id;
            const receiverID = req.params.receiverID;
            const requestStatus = req.params.requestStatus;



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
            res.json(receiver)



        } catch (err) {
            res.status(400).send(`Something went wrong! ${err}`)
        }
    })
}

{
    // POST /request/review/:requestStatus/:requestID
    // accepted or rejected

    requestsRouter.post("/request/review/:requestStatus/:senderID", userAuth, async (req, res) => {
        try {
            const id = req.id;
            const { requestStatus, senderID } = req.params;

            const loggedInUser = req.user;

            const requestSender = await User.findById(senderID);

            const requestProfile = await ConnectionRequest.findOne({ senderID: senderID, receiverID: id })

            // to check the existance of request id and if it exists, check whether the requets is meant to send for loggedInUser.
            if (!requestSender) {
                throw new Error(`User not found`)

            }

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



            //Response

            res.json(requestSender)



        } catch (err) {
            res.status(400).send(`Something went wrong! ${err}`)
        }
    })


}

{
    // DELETE /request/delete

    requestsRouter.delete("/request/:status/:receiverID", userAuth, async (req, res) => {
        try {
            const id = req.id;
            const receiverID = req.params.receiverID;
            const status = req.params.status;

            const receiver = await User.findById(receiverID);
            if (!receiver) {
                res.status(401).json({
                    success: 'failed',
                    message: "user not found!"
                })
            }


            await ConnectionRequest.updateOne({ senderID: id, receiverID: receiverID }, { requestStatus: status });

            res.json(receiver)
        }
        catch (err) {
            res.status(400).send(`Something went wrong! ${err}`)
        }
    })

}

module.exports = requestsRouter;
