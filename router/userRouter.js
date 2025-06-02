const express = require("express");
const userRouter = express.Router();

const { User } = require("../model/model");
const { ConnectionRequest } = require("../model/connectRequest")
const userAuth = require("../authentication/auth");
const cookieParser = require("cookie-parser");
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

userRouter.use(cookieParser())

const populateFilter = "firstName lastName";

{
    // GET /user/feed

    userRouter.get("/user/feed", userAuth, async (req, res) => {
        try {
            let page = parseInt(req.query.page) || 1;
            let limit = parseInt(req.query.limit) || 10;
            let skip = (page - 1) * 10;

            if (limit > 10 || limit < 0) {
                limit = 10;
            }

            const id = req.id;
            const user = req.user;
            const allUserData = await ConnectionRequest.find({
                $or: [
                    { senderID: id },
                    { $and: [{ receiverID: id }, { requestStatus: { $ne: "interested" } }] }
                ]
            }).select("senderID receiverID");


            let arr = [];
            allUserData.forEach((user) => {
                arr.push(user.senderID);
                arr.push(user.receiverID);
            })


            const expectedUsers = await
                User.find({ $and: [{ _id: { $nin: arr } }, { _id: { $ne: id } }] })
                    .select("firstName lastName age gender techInterests")
                    .skip(skip)
                    .limit(limit)


            res.json({
                message: `${user.firstName}, Your feed : `,
                Users: expectedUsers
            })

        }


        catch (err) {
            res.status(400).send(`Something went wrong! ${err}`)
        }
    })
}

{
    //GET /user/receivedRequest

    userRouter.get("/user/receivedRequests", userAuth, async (req, res) => {

        try {
            const id = req.id;
            const loggedInUser = req.user;

            const yourRequests = await ConnectionRequest
                .find({ receiverID: id, requestStatus: "interested" })
                .populate("senderID", populateFilter)


            let usersWhoSentRequests = [];
            let interestedRequestsProfile = [];

            yourRequests.forEach((req) => {
                usersWhoSentRequests.push(req.senderID);
                interestedRequestsProfile.push(req._id);
            })

            const numberOfUsers = usersWhoSentRequests.length;

            // check zero received requests
            if(numberOfUsers===0) {
                return res.json({
                    message : `${loggedInUser.firstName}, You have received connection requests from ${numberOfUsers} dev`
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
            if(numberOfUsers===0) {
                return res.json({
                    message : `${loggedInUser.firstName}, You have sent connection requests to ${numberOfUsers} dev`
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
            if(connections.length==0){
                return res.json({
                    message : `${loggedInUser.firstName}, You don't have any connection yet! Send connection requests, make connections!!`
                })
            }

            res.json({
                messgae: `${loggedInUser.firstName}, Your conenctions are successfully fetched!`,
                connections: connections
            });


            // let arr = [];

            // yourRequests.forEach((req) => {
            //     if (req.senderID.toString() === id) {
            //         arr.push(req.receiverID)
            //     } else {
            //         arr.push(req.senderID);

            //     }

            // })

            // if (arr.length <= 0) {
            //     return res.status(400).json({
            //         message: `${loggedInUser.firstName}, Your connection slot is empty! Send connection requests, make connections!!`
            //     })
            // }

            // const usersWhoSentRequests = await User.find({ _id: { $in: arr } });

            // const extractedNames = [];
            // usersWhoSentRequests.forEach((name) => {
            //     extractedNames.push(`${name.firstName} ${name.lastName}`)
            // })

            // res.json({
            //     messgae: `${loggedInUser.firstName}, Your conenctions are successfully fetched!`,
            //     connections: extractedNames
            // });

        } catch (err) {
            res.status(400).send(`Something went wrong! ${err}`)
        }
    })
}



module.exports = userRouter;