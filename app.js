// one route can have multiple middlewares. we can wrap multiple middlewares in an array like:
// e.g. : app.use("hola", [MW1, MW2, MW3, MW4, MW5])

// when route's response is not sent in route handler then req is sent and no response is there so a loop will form.

// app.***(route) => middleware chain => route handler aka "the actual function that sends the response"

// 1. when there is no res, no next() connection with next middleware then the req will stuck in the condiition of sending request, but no response is back so it freezes.
// 2. but when no res is defined, but a next() connection with next middleware is done, then the flow will movew to next middleware and excute it.
// 3. when res and next() both are defined, then it will throw an error( Cannot set headers after they are sent to the client) beacause the res is sent and you're trying to send another response.though the response will print on the browser, error is there in console, therefore it is not a good practice.
// 4. when there is no res is sent, and we defined next() but there is no next middleware then it will throw an GET error(cannot GET /...) beacause express expects a next middleware path and the path is incomplete so that error will occur.
// 5. when the res is sent, and also a connection of next() is formed with none middleware then it will not cause an issue because the res is already sent.

const express = require('express');

const app = express();


// middleware importance
// when there is a common logic to implement on all roites
app.use("/atm", (req, res, next) => {
    const an = 123;
    const pw = 456;

    const check = ((an === 123) && (pw === 456))

    if (!check) {
        res.status(401).send("Account number or password is incorrect")

    } else {
        next()

    }
})

app.get("/atm/withdrawal", (req, res, next) => {
    console.log("Windraw");
    res.send("Withrawal")
    next();
})
app.get("/atm/inquiry", (req, res, next) => {
    console.log("balance inquiry");
    res.send("balance inquiry")
    next();
})
app.get("/atm/change", (req, res, next) => {
    console.log("PIN change");
    res.send("PIN Change")
    next();
})
app.get("/atm/tranfer", (req, res, next) => {
    console.log("Fund tranfer");
    res.send("Fund transfer")
    next();
})




// route with no resonse
app.get(/^\/users(data)?$/, (req, res) => {
    console.log("no route handler");
})



// req.query
// e.g. : localhost:3001/userdata123?lname=singapuri&mname=manojbhai
app.get(/^\/userdata\d{3}$/, (req, res) => {
    console.log(req.query);

    res.send({
        name: "rinkal",
        age: 17
    });

})

// req.params
// dynamic routes
// e.g. : localhost:3001/userdata123/singapuri
app.get("/userdata/:userID/:lname", (req, res) => {
    console.log(req.params);

    res.send({
        name: "rinkal",
        age: 17
    });


})




// multiple route handlers
app.use(
    "/hola",
    (req, res, next) => {
        console.log("first route");
        res.send({
            name:"rinkal",
            age:18
        })
        next()

    },
    (req, res, next) => {
        console.log("second route");
        res.send({
            name:"krina",
            age:23
        })
        next()
    },
    (req, res, next) => {
        console.log("third route");
        res.send({
            name: "pinki",
            age: 52
        })
        next()
    }

    // if i define next() in last route handler with no "response" attached then express expect a route handler for that next() when we send the request but there is not route handler next so the path will not be found by browser and it will end with error message "cannot GET /user" 

    // but if we define "response" in the last route handler and then connect to next() with none route handler then no error will generate
)




app.get(/^\/a$/, (req, res) => {
    res.send(["rinkal", "krina", "mahi"]);

})

app.delete("/userdata", (req, res) => {
    console.log(req.params);

    res.send({
        name: "rinkal",
        age: 17
    });

})
app.use(("/test/namaste"), (req, res) => {
    res.send("test2")
})
app.use(("/test"), (req, res) => {
    res.send("test")
})
app.use(("/test2"), (req, res) => {
    res.send("test2")
})

app.use(("/namaste"), (req, res) => {
    res.send("namaste")
})



// error handling
app.get(/.*kali$/, (req, res) => {
    throw new Error("hahedk")
    res.send(["rinkal", "krina", "mahi"]);

})

app.use(("/"), (err, req, res, next) => {
    if (err) {
        // console.log(err);
        res.status(500).send("something went wrong")

    }
})




app.listen(3001, () => {
    console.log("success");

})