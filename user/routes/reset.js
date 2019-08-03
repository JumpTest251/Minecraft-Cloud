const express = require('express');
const router = express.Router();
const UserToken = require('../models/UserToken');
const User = require('../models/User');
const mail = require("../utils/mail");
const config = require("../utils/config");


router.post("/", async (req, res) => {
    const email = req.body.email;

    const token = await UserToken.generateToken({ email: email });
    if (token) {
        await mail(email, "Passwort zurücksetzen", "<b>Anfrage auf Passwort wiederherstellung</b>" +
            "<br />" +
            "<p>Es wurde versucht das Passwort für diese E-Mail Adresse zurückzusetzen.</p>" +
            "<p>Der folgende Link kann innerhalb von 10 Minuten verwendet werden, um ein neues Passwort anzufordern</p>" +
            "<a href='" + config.publicApi + "/reset/" + token.token + "'>Passwort zurücksetzen</a>")
    }

    res.send({ message: "Email sent" })
});

router.post("/:token", async (req, res) => {
    const { error } = User.validateUpdate(req.body);
    if (error) return res.status(400).send({ error: error.details[0].message });

    const dbToken = await UserToken.findOne({ token: req.params.token });
    if (!dbToken) return res.status(404).send({ error: "Invalid Token" });

    const user = await User.findOne({ name: dbToken.user });

    await user.updateData({
        password: req.body.password,
        twofa: {
            enabled: false
        }
    });
    await UserToken.findOneAndRemove({ token: req.params.token });

    res.send({ message: "User updated" });
});

module.exports = router;
