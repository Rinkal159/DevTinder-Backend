const express = require("express");
const requestsRouter = express.Router();

const { ConnectionRequest } = require("../model/connectRequest")
const { User } = require("../model/model")
const userAuth = require("../authentication/auth")
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


            // not allow outsider status
            const allowedStatus = ["interested", "ignored"];
            if (!allowedStatus.includes(requestStatus)) {
                throw new Error(`Request status : ${requestStatus} is invalid`)
            }


            // check existing request of sender to same receiver. 
            const existingRequestOfSender = await ConnectionRequest.findOne({ senderID: senderID, receiverID: receiverID });

            if (existingRequestOfSender) {
                console.log(`existing request status : ${existingRequestOfSender.requestStatus}`);
                console.log(`current request status : ${requestStatus}`);

                const requestProfile = await ConnectionRequest.findOne({ senderID, receiverID });

                if (requestStatus === existingRequestOfSender.requestStatus) {
                    if (requestStatus === "interested") {
                        throw new Error(`${sender.firstName.toUpperCase()}, You have already sent connection request to ${receiver.firstName.toUpperCase()}`)
                    } else {
                        throw new Error(`${sender.firstName.toUpperCase()}, You have already Ignored connection request to ${receiver.firstName.toUpperCase()}`)
                    }

                }
                else {

                    if (requestStatus === "ignored") {
                        await ConnectionRequest.updateOne({ _id: requestProfile.id }, { requestStatus: requestStatus })

                        return res.json({
                            message: `${sender.firstName.toUpperCase()}, you have successfully changed the request status from ${existingRequestOfSender.requestStatus.toUpperCase()} to ${requestStatus.toUpperCase()}`

                        })
                    } else {
                        return res.json({
                            message: `${sender.firstName.toUpperCase()}, you cannot change the request status from ${existingRequestOfSender.requestStatus.toUpperCase()} to ${requestStatus.toUpperCase()}`

                        })

                    }
                }
            }


            // check existing request of receiver to sender who is trying to send request to that receiver
            const ExistingRequestOfReceiverTosender = await ConnectionRequest.find({ senderID: receiverID, receiverID: senderID })

            if (ExistingRequestOfReceiverTosender.length > 0) {
                throw new Error(`${sender.firstName.toUpperCase()}, You have already received connection request from ${receiver.firstName.toUpperCase()}`)
            }


            const requestData = new ConnectionRequest({
                senderID,
                receiverID,
                requestStatus
            })

            await requestData.save();

            if (requestStatus === "interested") {
                res.json({ message: `${sender.firstName.toUpperCase()}, You have successfully SENT Connection request to ${receiver.firstName.toUpperCase()} !` })

            } else {
                res.json({ message: `${sender.firstName.toUpperCase()}, You have successfully IGNORED Connection request to ${receiver.firstName.toUpperCase()} !` })
            }

        } catch (err) {
            res.status(400).send(`Something went wrong! ${err}`)
        }
    })
}

{
    // POST /request/review/:requestStatus/:requestID
    // accepted or rejected

    requestsRouter.post("/request/review/:requestStatus/:requestID", userAuth, async (req, res) => {
        try {
            const loggedInUserID = req.id;
            const { requestStatus, requestID } = req.params;

            const loggedInUser = req.user;

            const requestProfile = await ConnectionRequest.findOne({ _id: requestID, requestStatus: "interested" });

            // to check the existance of request id and if it exists, check whether the requets is meant to send for loggedInUser.
            if (!requestProfile) {
                throw new Error(`Request not found`)

            } else if (requestProfile.receiverID.toString() !== loggedInUserID) {
                throw new Error(`This request is not for you!`)
            }

            const RequestSenderID = requestProfile.senderID;
            const requestSender = await User.findById(RequestSenderID);

            // to now allow outsider status
            const allowedStatus = ["accepted", "rejected"];
            if (!allowedStatus.includes(requestStatus)) {
                throw new Error(`Request status : ${requestStatus} is invalid`)
            }

            // check whether you have already accepted or rejected the request and again you trying to do same
            if (requestProfile.requestStatus === requestStatus) {
                if (requestStatus === "accepted") {
                    throw new Error(`${loggedInUser.firstName.toUpperCase()}, You have already successfully ACCEPTED connection request of ${requestSender.firstName.toUpperCase()}`)

                } else {
                    throw new Error(`${loggedInUser.firstName.toUpperCase()}, You have already successfully REJECTED connection request of ${requestSender.firstName.toUpperCase()}`)
                }
            }

            await ConnectionRequest.updateOne({ _id: requestID }, { requestStatus: requestStatus }, { runValidators: true })



            //Response
            if (requestStatus === "accepted") {

                res.json({
                    message: `${loggedInUser.firstName.toUpperCase()}, You have successfully ACCEPTED connection request of ${requestSender.firstName.toUpperCase()}`
                })
            }
            else {

                res.json({
                    message: `${loggedInUser.firstName.toUpperCase()}, You have successfully REJECTED connection request of ${requestSender.firstName.toUpperCase()}`
                })
            }



        } catch (err) {
            res.status(400).send(`Something went wrong! ${err}`)
        }
    })


}

{
    // DELETE /request/delete

    requestsRouter.delete("/request/delete/:requestID", userAuth, async (req, res) => {
        try {
            const id = req.id;
            const user = req.user;
            const requestID = req.params.requestID;

            const deletedID = await ConnectionRequest.findOne(
                {
                    $and:
                        [{ $and: [{ _id: requestID }, { senderID: id }] }, { requestStatus: "interested" }]
                })
                .populate("receiverID", "firstName lastName")

            if (!deletedID) {
                throw new Error("Request not found")
            }

            await ConnectionRequest.deleteOne({ _id: deletedID });

            res.json({
                message: `${user.firstName}, You have successfully DELETED your connection request`,
                deletedDevProfile: deletedID.receiverID
            })
        }
        catch (err) {
            res.status(400).send(`Something went wrong! ${err}`)
        }
    })

}

module.exports = requestsRouter;
