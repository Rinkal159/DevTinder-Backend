const mongoose = require("mongoose");

const connectRequestSchema = new mongoose.Schema({
    senderID: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: [true, "Sender's ID is required"]
    },
    receiverID: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: [true, "Receiver's ID is required"]
    },
    requestStatus: {
        type: String,
        required: [true, "Request status is required"],
        enum: {
            values: ['Ignore', 'Interested', 'Accept', 'Reject', 'Delete'],
            message: `Incorrect requast status : {VALUE}`
        }
    }
}, { timestamps: true });


connectRequestSchema.index({ senderID: 1, receiverID: 1 });

const ConnectionRequest = mongoose.model('ConnectionRequest', connectRequestSchema);
module.exports = { ConnectionRequest };