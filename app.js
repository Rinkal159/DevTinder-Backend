// mongoose model is like a class where we create instances from it or it is a collection and we create documents from it.

// first, we connect to the database in config folder.
// second, we connect the database to the server. first database should be connected and second the server. means the connect function will exucute in app where ".then" first indicates that the database is successfully connected and then the listen part of the server will execute.
// third, we create mongoose schemas in model folder, then create model and export it.

// _id and __v are automatically created by mongoDB.
// An ObjectId is a 12-byte identifier => 12 bytes = 24 hex characters
// __v stand for version. Each time you update the document, __v increments. initial value is 0.

const express = require("express");
const connect = require("./config/database")
const updateMaritalField = require("./updateSchema/updateSchema.js")

const app = express();
app.use(express.json());

const authRouter = require("./router/authRouter.js")
const profileRouter = require("./router/profileRouter.js")
const requestsRouter = require("./router/requestsRouter.js")
const userRouter = require("./router/userRouter.js")

{
    // route handlers
    app.use("/", authRouter);
    app.use("/", profileRouter);
    app.use("/", requestsRouter);
    app.use("/", userRouter);
}


{
    // To update the schema
    updateMaritalField()

}

connect()
    .then(() => {
        console.log("database success");
        app.listen(3002, () => {
            console.log("server success");

        })
    })
    .catch((err) => console.log(err))