const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        require: true
    },
    lastName: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    passWord: {
        type: String,
        require: true
    },
    age: {
        type: Number,
        require: true,
        min: 0
    },
    gender: {
        type: String,
        require: true
    },
    occupation: {
        type: String,
        require: true
    },
    techInterests: {
        type: String,
        require: true
    },
    maritalStatus: {
        type: String,
        require: false
    }
})

module.exports = mongoose.model('User', userSchema)