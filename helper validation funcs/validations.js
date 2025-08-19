const { User } = require("../model/model");
const { ConnectionRequest } = require("../model/connectRequest")

const bcrypt = require("bcrypt");

const encryptPassword = async (password) => {
    const hashpw = await bcrypt.hash(password, 10);

    return hashpw;
}

const valodationToNotAllowInvalidFields = (allowedFieldsForUpdation, req) => {
    const data = req.body;
    const keyOfData = Object.keys(data);

    const invalidKeys = keyOfData.filter((key) => !allowedFieldsForUpdation.includes(key));

    return invalidKeys;
}

module.exports = { valodationToNotAllowInvalidFields };
