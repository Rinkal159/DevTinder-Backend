const express = require("express");
const connect = require("./config/database")
const updateMaritalField = require("./updateSchema/updateSchema.js")

const dotenv = require("dotenv")
dotenv.config(); // loads .env file into process.env

const app = express();

const path = require("path");
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));


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
        app.listen(process.env.PORT, () => {
            console.log("server success");

        })
    })
    .catch((err) => console.log(err))