const express = require('express');


const app = express();

app.use(("/test"), (req, res) => {
    res.send("test")
})

app.use(("/namaste"), (req, res) => {
    res.send("namaste")
})
app.use((req, res) => {
    res.send("hello world")
})

app.listen(3001, () => {
    console.log("success");
    
})