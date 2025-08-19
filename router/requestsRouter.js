const express = require("express");
const requestsRouter = express.Router();

const userAuth = require("../middleware/auth");

const sendReqInterestedOrIgnore = require("../Controllers/sendReqInterestedOrIgnore");
const reviewReqAcceptOrReject = require("../Controllers/reviewReqAcceptOrReject");
const deleteReq = require("../Controllers/deleteReq");

//* POST /request/send/:requestStatus/:receiverID
// interested or ignored
requestsRouter.post("/request/send/:requestStatus/:receiverID", userAuth, sendReqInterestedOrIgnore);

//* POST /request/review/:requestStatus/:requestID
// accepted or rejected
requestsRouter.post("/request/review/:requestStatus/:senderID", userAuth, reviewReqAcceptOrReject);

//* DELETE /request/delete
requestsRouter.delete("/request/:status/:receiverID", userAuth, deleteReq);


module.exports = requestsRouter;
