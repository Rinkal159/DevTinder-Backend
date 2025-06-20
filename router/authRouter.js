const express = require("express");
const authRouter = express.Router();

const { User } = require("../model/model");
const bcrypt = require("bcrypt");
const userAuth = require("../authentication/auth");
const cookieParser = require("cookie-parser")
const { encryptPassword, valodationToNotAllowInvalidFields } = require("../helper validation funcs/validations")

// express.json() : express.json() is a middleware function built into Express.js that parses incoming JSON payloads and puts the parsed data into req.body.
// for POST
// It parses the collected data using JSON.parse().
authRouter.use(express.json());


authRouter.use(cookieParser());



{
    // POST /signup

    authRouter.post("/signup", async (req, res, next) => {

        // Here The flow : we POST the data to API, API PUSH the data to database, meaning database GET the data from end user.
        // The expected flow for dynamic working: API POST the data to server. server GET the data from end user, then PUSH that data to database.

        // Static PUSH to database
        // const userData = new User({
        //     firstName: "krina",
        //     lastName: "sigapuri",
        //     email: "krina@gmail.com",
        //     passWord: "123456",
        // });



        // Here we sent the data from body of the req in JSON format. Server cannot read JSON data so we need middleware. express.json() is a middleware that powers server to read the data from the end user as that data is converted into object by express.json() and then PUSH the data to middleware.
        // without express.json(), undefined will be printed on console.



        // Dynamic PUSH to database

        try {

            // POST


            // ---------------------------------
            // the logic here is To not allow the data to insert into database that is not the part of the schema

            const allowedFieldsForInsertion = ["userID", "firstName", "lastName", "email", "passWord", "age", "gender", "state", "occupation", "techInterests", "isMarried"]
            const invalidKeysToInsert = valodationToNotAllowInvalidFields(allowedFieldsForInsertion, req);

            if (invalidKeysToInsert.length > 0) {
                throw new Error(`cannot update fields : ${invalidKeysToInsert}`)
            }


            // ---------------------------------



            // Encrypt the password
            // HASH : A hash is a fixed-length string of characters generated from any input (like a password), using a one-way function. You can’t “unhash” it. It's same for 2 or more same passwords.
            // SALT : A salt is a random string added to the password before hashing. It’s different for every password.
            // Rainbow table attack : A rainbow table is a precomputed list of common passwords and their hash values. Hackers use it to reverse-engineer passwords from their hashes.

            const { firstName, lastName, email, passWord, state, age, gender, occupation, techInterests, isMarried } = req.body;

            const hashpw = await encryptPassword(passWord);

            // to handle huge length of tech ineterests
            if (techInterests.length > 20) {
                throw new Error(`Overloaded interests! They must not exceed 20`)
            } 



            const userData = new User({
                firstName,
                lastName,
                email,
                passWord: hashpw,
                state,
                age,
                gender,
                occupation,
                techInterests,
                isMarried
            });


            await userData.save();

            const user = await User.findOne({ email: email });
            // await req.body.save()  //incorrect way to PUSH the dynamic data into database
            res.json({
                message: `${user.firstName}, You have successfully signed up!`,
                data: user

            })

        } catch (err) {
            res.status(400).json({
                message : err.message
            })
        }

        next()

    })
}

{
    // POST /login

    authRouter.post("/login", async (req, res, next) => {
        try {
            const { email, passWord } = req.body;

            const emailCheck = await User.findOne({ email: email });

            // calling email validation function
            if (!emailCheck) {
                throw new Error("invalid credentials")
            }

            // calling password validation function
            const result = await emailCheck.verifyPassword(passWord);

            if (result) {

                // TOKEN
                const token = await emailCheck.genJWT();

                // COOKIE
                res.cookie("token", token, {
                    maxAge: 3600 * 1000, //3600= 1 hr in second, 3600*1000 =1 hr in miliseconds
                    secure: true, //only send the cookies over HTTPS, not HTTP
                    httponly: true, //JavaScript cannot access this cookie
                    sameSite: "strict" //Only send cookies on same-site requests
                });

                res.json({
                    message: `${emailCheck.firstName}, You have successfully logged in!`,
                    data: emailCheck

                })


            } else {
                throw new Error(`invalid credentials`)
            }

        } catch (err) {
            res.status(400).send(`Something went wrong : ${err}`)
        }
    })
}

{
    // POST //logout

    authRouter.post("/logout", userAuth, async (req, res) => {
        try {
            res
                .cookie("token", null, {
                    maxAge: 0,
                    secure: true,
                    httpOnly: true,
                    sameSite: 'strict'
                })
                .send("You're successfully logged out!")

        } catch (err) {
            res.status(400).send(`Something wnt wrong. ${err}`)
        }
    })
}

module.exports = authRouter;