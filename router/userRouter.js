const express = require("express");
const userRouter = express.Router();

const userAuth = require("../middleware/auth");

const receivedReq = require("../Controllers/receivedReq");
const sentReq = require("../Controllers/sentReq");
const connections = require("../Controllers/connections");

//* GET /user/receivedRequest
userRouter.get("/user/receivedRequests", userAuth, receivedReq);

//* GET /user/sentRequest
userRouter.get("/user/sentRequests", userAuth, sentReq);

//* GET /user/connections
userRouter.get("/user/connections", userAuth, connections);

module.exports = userRouter;