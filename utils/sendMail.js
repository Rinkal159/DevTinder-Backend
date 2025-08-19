const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    secure: false, // true for 465, false for other ports
    auth: {
        user: "e12c0f0ee451fc",
        pass: "9889627732baba",
    },
});

const mailSender = async (email, firstNname) => {
    const info = await transporter.sendMail({
        from: '"DevTinder" <devtinder@devtinder.test>',
        to: email,
        subject: `Hello, ${firstNname}! Welcome to devtinder🧑🏻‍💻`,
        text: "init something epic!",
    })
}

module.exports = mailSender;