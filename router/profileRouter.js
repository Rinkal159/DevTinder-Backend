const express = require("express");
const profileRouter = express.Router();

const { User } = require("../model/model");
const userAuth = require("../middleware/auth");
const cookieParser = require("cookie-parser");
const { encryptPassword, valodationToNotAllowInvalidFields, checkDuplicationDuringUpdation } = require("../helper validation funcs/validations")

profileRouter.use(cookieParser())

{
    // GET /profile.view

    profileRouter.get("/profile/view", userAuth, async (req, res) => {

        try {
            const userData = req.user;

            if (!userData) {
                throw new Error("user not fount")
            }

            res.json(userData);

        } catch (err) {
            res.status(400).json({
                message: err.message
            })

        }
    })
}

{
    // DELETE /profile/delete

    profileRouter.delete("/profile/delete", userAuth, async (req, res) => {
        try {
            const id = req.id;
            await User.findByIdAndDelete(id);
            res.send("Deleted user seccessfully")

        } catch (err) {
            res.status(400).send(`something went wrong. ${err}`)
        }
    })
}

{
    // PATCH /profile/update

    profileRouter.patch("/profile/update", userAuth, async (req, res) => {
        try {
            const id = req.id;

            // the logic here is To not allow the data to update in database that is not the part of the schema or the data from age, email and password
            const allowedFieldsForUpdation = ["img", "firstName", "lastName", "gender", "state", "occupation", "techStacks", "goals"]

            const invalidKeysToUpdate = valodationToNotAllowInvalidFields(allowedFieldsForUpdation, req);
            if (invalidKeysToUpdate.length > 0) {
                throw new Error(`cannot update fields : ${invalidKeysToUpdate}`)
            }


            // check duplication
            const duplicatedFields = await checkDuplicationDuringUpdation(req);
            if (duplicatedFields.length > 0) {
                throw new Error(`Cannot change these fields as they are same as before : ${duplicatedFields}`)
            }


            // updation
            await User.updateOne({ _id: id }, req.body, { runValidators: true });
            const updatedUser = await User.findById(id);

            res.json({
                message: `${updatedUser.firstName}, Your profile has been updated successfully!`,
                updated_fields: Object.keys(req.body),
                updated_profile: updatedUser
            })

        } catch (err) {
            res.status(400).send(`something went wrong! ${err}`)
        }
    })

}

{
    // PATCH /profile/password/update

    profileRouter.patch("/profile/password/update", userAuth, async (req, res) => {
        try {

            const id = req.id;
            const user = req.user;

            const { currentPassword, newPassword, confirmPassword } = req.body;

            // not allow outsider fields
            const allowedFieldsForUpdation = ["currentPassword", "newPassword", "confirmPassword"]
            const invalidKeysToUpdate = await valodationToNotAllowInvalidFields(allowedFieldsForUpdation, req);

            if (invalidKeysToUpdate.length > 0) {
                throw new Error(`cannot update fields : ${invalidKeysToUpdate}`)
            }


            // verify the current password by bcrypt.compare
            const checkPassword = await user.verifyPassword(currentPassword);

            if (!checkPassword) {
                throw new Error("Invalid current password");
            }

            // ensuring new password and confirm password are same
            if (newPassword !== confirmPassword) {
                throw new Error("New password and confirm password do not match.")
            }


            // encrypting the new password by bcrypt.hash
            const newpw = await encryptPassword(newPassword);


            // updating in database
            await User.updateOne({ _id: id }, { passWord: newpw }, { runValidators: true });
            res.json({
                message: "password changed successfully!"
            })


        } catch (err) {
            res.status(400).send(`Something went wrong. ${err}`)
        }
    })
}

module.exports = profileRouter;

