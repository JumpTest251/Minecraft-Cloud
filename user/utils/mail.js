const nodemailer = require("nodemailer");
const config = require("./config");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        type: "login",
        user: config.emailUser,
        pass: config.emailPassword
    }
});

module.exports = async function (to, subject, content) {
    try {

        await transporter.sendMail({
            from: '"Minecraftcloud.de" <info.minecraftcloud@gmail.com>',
            to,
            subject,
            html: content
        });

    } catch (ex) {
        console.log("Error sending E-Mail: " + ex);
    }
}