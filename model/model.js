const mongoose = require("mongoose");
const validator = require("validator")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");


const userSchema = new mongoose.Schema({
    img: {
        type: String,
        required: [true, "Profile Picture is required"]
    },

    firstName: {
        type: String,
        required: [true, "First name is required"],
        minLength: [4, "First Name must not be less than 4 characters"],
        maxLength: [50, "First Name must not be greater than 50 characters"]
    },

    lastName: {
        type: String,
        required: [true, "Last name is required"],
        minLength: [4, "Last Name must not be less than 4 characters"],
        maxLength: [50, "Last Name must not be greater than 50 characters"]
    },

    email: {
        type: String,
        required: [true, "Email is required"],
        unique: [true, `this email is already registered`],
        sparse: true,
        lowercase: true,
        trim: true,
        match: [/.+\@.+\..+/, `{VALUE} is invalid`]
    },

    passWord: {
        type: String,
        required: [true, "Password is required"],
        validate(value) {
            if (!validator.isStrongPassword(value)) {
                throw new Error(`Password is weak : ${value} | Please make sure it has at least : 8 characters, 1 lowercase letter, 1 uppercase letter, 1 number and 1 symbol (like !, @, #, etc.)`)
            }
        }
    },

    state: {
        type: String,
        required: [true, "State is required"]
    },

    age: {
        type: Number,
        required: [true, "Age is required"],
        min: [0, "age must be greater than or equals to 0"]
    },

    gender: {
        type: String,
        required: [true, "Gender is required"],
        enum: {
            values: ['male', 'female', 'others'],
            message: `{VALUE} is invalid`
        }
    },

    occupation: {
        type: String,
        required: [true, "Occupation is required"]
    },

    techStacks: {
        type: [String],
        validate: {
            validator: function (arr) {
                return Array.isArray(arr) && arr.length > 0
            },
            message: "At least one techStacks is required"
        },
        required: [true, "Tech Stack is required. e.g. Programming languages, Hackathons"]
    },
    goals: {
        type: [String],
        validate: {
            validator: function (arr) {
                return Array.isArray(arr) && arr.length > 0
            },
            message: "At least one Goal is required"
        },
        required: [true, "Goal is required. e.g. Networoking, Tech talks"]
    }

}, { timestamps: true })


userSchema.index({ firstName: 1, lastName: 1 });

// generate JWT token as id which will hide is the part of userschema.
userSchema.methods.genJWT = async function () {
    const id = this._id;
    const token = await jwt.sign({ _id: id }, process.env.JWT_SECRETKEY, { expiresIn: "1h" })

    return token;
}

// verify password as we compare password which is the part of userschema
userSchema.methods.verifyPassword = async function (userPassword) {
    const pw = this.passWord;
    const passwordCheck = await bcrypt.compare(userPassword, pw);

    return passwordCheck;
}

const User = mongoose.model('User', userSchema);
module.exports = { User };