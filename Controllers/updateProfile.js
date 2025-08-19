const { User } = require("../model/User");
const { valodationToNotAllowInvalidFields } = require("../helper validation funcs/validations")

const updateProfile = async (req, res) => {
    try {
        const id = req.id;

        const { firstName, lastName, occupation, state, techStacks, goals } = req.body;

        const allowedFieldsForUpdation = ["firstName", "lastName", "occupation", "state", "techStacks", "goals"]

        const invalidKeysToUpdate = valodationToNotAllowInvalidFields(allowedFieldsForUpdation, req);
        if (invalidKeysToUpdate.length > 0) {
            throw new Error(`cannot update fields : ${invalidKeysToUpdate}`)
        }

        // updation
        await User.updateOne({ _id: id }, {
            firstName,
            lastName,
            occupation,
            state,
            techStacks,
            goals

        }, { runValidators: true });

        const updatedUser = await User.findById(id);

        res.json(updatedUser)

    } catch (err) {
        res.status(400).json({
            status: "failed",
            message: err.message
        })
    }
};

module.exports = updateProfile;