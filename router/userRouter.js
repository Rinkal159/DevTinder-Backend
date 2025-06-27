const express = require("express");
const userRouter = express.Router();

const { User } = require("../model/model");
const { ConnectionRequest } = require("../model/connectRequest")
const userAuth = require("../middleware/auth");
const cookieParser = require("cookie-parser");
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

userRouter.use(cookieParser())

const populateFilter = "firstName lastName";


{
    //GET /user/receivedRequest

    userRouter.get("/user/receivedRequests", userAuth, async (req, res) => {

        try {
            const id = req.id;
            const loggedInUser = req.user;

            // get all requests you received
            const yourRequests = await ConnectionRequest
                .find({ receiverID: id, requestStatus: "interested" })
                .populate("senderID", populateFilter)

                console.log(yourRequests);
                

            let usersWhoSentRequests = [];
            let interestedRequestsProfile = [];

            yourRequests.forEach((req) => {
                usersWhoSentRequests.push(req.senderID);
                interestedRequestsProfile.push(req._id);
            })

            const numberOfUsers = usersWhoSentRequests.length;

            // check zero received requests
            if (numberOfUsers === 0) {
                return res.json({
                    message: `${loggedInUser.firstName}, You have received connection requests from ${numberOfUsers} dev`
                })
            }

            res.json({
                messgae: `${loggedInUser.firstName}, You have received connection requests from ${numberOfUsers} dev`,
                interestedDev: usersWhoSentRequests,
                interestedDevRequestProfile: interestedRequestsProfile
            });


        } catch (err) {
            res.status(400).send(`Something went wrong! ${err}`)
        }
    })
}

{
    //GET /user/sentRequest

    userRouter.get("/user/sentRequests", userAuth, async (req, res) => {

        try {
            const id = req.id;
            const loggedInUser = req.user;

            // get all requests you sent
            const yourRequests = await ConnectionRequest
                .find({ senderID: id, requestStatus: "interested" })
                .populate("receiverID", populateFilter)

            let usersWhoReceivedRequests = [];
            let interestedRequestsProfile = [];


            yourRequests.forEach((req) => {
                usersWhoReceivedRequests.push(req.receiverID)
                interestedRequestsProfile.push(req._id);

            })

            const numberOfUsers = usersWhoReceivedRequests.length;

            // check zero sent requests
            if (numberOfUsers === 0) {
                return res.json({
                    message: `${loggedInUser.firstName}, You have sent connection requests to ${numberOfUsers} dev`
                })
            }

            res.json({
                messgae: `${loggedInUser.firstName}, You have sent connection requests to ${numberOfUsers} dev`,
                interestedDev: usersWhoReceivedRequests,
                interestedDevRequestProfile: interestedRequestsProfile
            });


        } catch (err) {
            res.status(400).send(`Something went wrong! ${err}`)
        }
    })
}

{
    // GET /user/connections

    userRouter.get("/user/connections", userAuth, async (req, res) => {
        try {
            const id = req.id;
            const loggedInUser = req.user;

            // find accepted request profile either you sent the request and receiver accepted or you received the request and accepted and made connection
            const yourRequests = await ConnectionRequest.find({
                $or: [
                    { receiverID: id },
                    { senderID: id }
                ],
                requestStatus: "accepted"
            })
                .populate("senderID", populateFilter)
                .populate("receiverID", populateFilter)

            let connections = [];

            yourRequests.forEach((req) => {
                if (req.senderID._id.toString() === id) {
                    connections.push(req.receiverID)
                } else {
                    connections.push(req.senderID)
                }

            })

            // check zero connections
            if (connections.length == 0) {
                return res.json({
                    message: `${loggedInUser.firstName}, You don't have any connection yet! Send connection requests, make connections!!`
                })
            }

            res.json({
                messgae: `${loggedInUser.firstName}, Your conenctions are successfully fetched!`,
                connections: connections
            });


        } catch (err) {
            res.status(400).send(`Something went wrong! ${err}`)
        }
    })
}



module.exports = userRouter;