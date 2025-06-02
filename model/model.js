const mongoose = require("mongoose");
const validator = require("validator")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// schema validations:
/**?
 * -> "type": type of the field
 * -> "required" : mandatory or not
 * -> "unique" : gives unique identity, meaning no same data again
 * -> "default" : set default values, if not entered value, then that value will push to database
 * -> "lowercase", "uppercase", "trim" : for string type fields
 * -> "minLength", "maxLength" : minimum or maximum length of the string field
 * -> "min", "max" : minimum or maximum validation for number and date field
 * 
 * -> type, require, unique, default, min, max, minLength, maxLength, lowercase, uppercase, trim, match
 */


/**
 * -> some predefined vaidations allow array values where first value is the value of that validation and second value is message that will show when the field value is not validate.
 * -> required, min, max, minLength, maxLength, match, unique can have array access.
 */

// Timestamps is the second parameter that allows you to be aware of when the field is created and when it is updated.

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, "First name is required"],
        minLength: [4, "Name must not be less than 4 characters"],
        maxLength: [50, "Name must not be greater than 50 characters"]
    },
    lastName: {
        type: String,
        required: [true, "Last name is required"],
        minLength: [4, "Name must not be less than 4 characters"],
        maxLength: [50, "Name must not be greater than 50 characters"]
    },
    email: {

        // unique gives power to not accept two same email ids, if one is registred, then that one cannot register again.
        // without trim() mongo will assume two same email ids are different, just because one has trailing spaces and one has not.
        // therefore , whenever you define unique, define trim too with strings.

        type: String,
        required: [true, "Email is required"],
        unique: [true, `this email is already registered`],
        sparse:true,
        lowercase: true,
        trim: true,
        match: [/.+\@.+\..+/, `{VALUE} is invalid`]
        // validate(value) {
        //     if(!validator.isEmail(value)) {
        //         throw new Error(`Email id is invalid : ${value}`)
        //     }
        // }
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

        // custom validation
        // validate(value) {
        //     if (!["male", "female", "others"].includes(value)) {
        //         throw new Error("User data is invalid")
        //     }
        // }
    },
    occupation: {
        type: String,
        required: [true, "Occupation is required"]
    },
    techInterests: {
        type: [String],
        required: [true, "Tech Interest is required. e.g. Programming languages, Hackathons"]
    },
    isMarried: {
        type: Boolean,
        required: false
    }
}, { timestamps: true })


userSchema.index({ firstName: 1, lastName: 1 });


userSchema.methods.genJWT = async function () {
    const id = this._id;
    const token = await jwt.sign({ _id: id }, "SECRET@VERYsecret123", { expiresIn: "1h" })

    return token;
}

userSchema.methods.verifyPassword = async function (userPassword) {
    const pw = this.passWord;
    const passwordCheck = await bcrypt.compare(userPassword, pw);

    return passwordCheck;
}

const User = mongoose.model('User', userSchema);
module.exports = { User };