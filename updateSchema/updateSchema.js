const {User} = require("../model/model");

async function updateMaritalField() {
    const users = await User.find({ maritalStatus: { $exists: true } });

    for (const user of users) {
        user.isMarried = user.maritalStatus;
        user.maritalStatus = undefined;
        await user.save()
    }
}

module.exports = updateMaritalField;