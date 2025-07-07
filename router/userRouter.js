const express = require("express");
const userRouter = express.Router();

const { User } = require("../model/model");
const { ConnectionRequest } = require("../model/connectRequest")
const userAuth = require("../middleware/auth");
const cookieParser = require("cookie-parser");

userRouter.use(cookieParser())

{
    //GET /user/receivedRequest

    userRouter.get("/user/receivedRequests", userAuth, async (req, res) => {

        try {
            const id = req.id;
            const loggedInUser = req.user;

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
                .find({ senderID: id, requestStatus: "Interested" })
                .select('receiverID')

            let arr = [];

            yourRequests.forEach((req) => {
                arr.push(req.receiverID.toString());
            })

            const sentRequests = await User.find({ _id: { $in: arr } });

            res.json(sentRequests);


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
            res.status(400).send(`Something went wrong! ${err}`)
        }
    })
}



module.exports = userRouter;