const mongoose = require('mongoose');

async function connect() {
    await mongoose.connect("mongodb+srv://rinkal159:dhHRFf2YR1XCizbq@newkiddo.9rtpo7p.mongodb.net/devTinder");
}

module.exports = connect;

