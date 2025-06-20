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


/**  CORS error blocks cross origin requests meaning even port is diffrent, our frontend cannot connect with backend.
 * So, to allow cross origin request, cors middleware helps.
 * 
 * everything works fine But even with the cors, our token will not send to application cause cookie setup only allows to send token to secure sites(https)
 * thus we need to config the cors
 * config : origin defines the frontend site to add that site into whitelist so that backend trust the frontend and send cookies.
 * credentials true makes the backend feel secure about frontend port.
 * but not only backend setup will run everything smooth, we need to make changes in frontend too. the changes are : in axios request, we need to add "withcredentials : true" to access that cookie.
 **/

const cors = require("cors");
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

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