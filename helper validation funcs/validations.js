const { User } = require("../model/model");
const { ConnectionRequest } = require("../model/connectRequest")

const valodationToNotAllowInvalidFields = (allowedFieldsForUpdation, req) => {
    const data = req.body;
    const keyOfData = Object.keys(data);

    const invalidKeys = keyOfData.filter((key) => !allowedFieldsForUpdation.includes(key));

    return invalidKeys;
}

module.exports = { valodationToNotAllowInvalidFields };
