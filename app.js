// mongoose model is like a class where we create instances from it or it is a collection and we create documents from it.

// first, we connect to the database in config folder.
// second, we connect the database to the server. first database should be connected and second the server. means the connect function will exucute in app where ".then" first indicates that the database is successfully connected and then the listen part of the server will execute.
// third, we create mongoose schemas in model folder, then create model and export it.

// _id and __v are automatically created by mongoDB.
// An ObjectId is a 12-byte identifier => 12 bytes = 24 hex characters
// __v stand for version. Each time you update the document, __v increments. initial value is 0.

const express = require("express");
const connect = require("./config/database")

const app = express();

const User = require("./model/model.js")

// express.json() : express.json() is a middleware function built into Express.js that parses incoming JSON payloads and puts the parsed data into req.body.
// It parses the collected data using JSON.parse().
app.use(express.json())

app.post("/signUp", async (req, res) => {

    // Here The flow : we POST the data to API, API PUSH the data to database, meaning database GET the data from end user.
    // The expected flow for dynamic working: API POST the data to server. server GET the data from end user, then PUSH that data to database.

    // Static PUSH to database
    // const userData = new User({
    //     firstName: "krina",
    //     lastName: "sigapuri",
    //     email: "krina@gmail.com",
    //     passWord: "123456",
    // });



    // Here we sent the data from body of the req in JSON format. Server cannot read JSON data so we need middleware. express.json() is a middleware that powers server to read the data from the end user as that data is converted into object by express.json().
    // without express.json(), undefined will be printed on console.
    console.log(req.body.age);

    // Dynamic PUSH to database
    const userData = new User(req.body);

    
    try {
        await userData.save();
        // await req.body.save()  //incorrect way to PUSH the dynamic data into database
        res.send("userData successfully sent!")
    } catch (err) {
        res.status(400).send(`something went wrong! ERROR : ${err}`)
    }

})


connect()
    .then(() => {
        console.log("database success");
        app.listen(3002, () => {
            console.log("server success");

        })
    })
    .catch((err) => console.log(err))
