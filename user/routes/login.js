const express = require('express');
const router = express.Router();
const User = require('../models/User');
const twoFactorAuth = require('../utils/twoFactorAuth');
const { tokenGenerator } = require('@jumper251/core-module');
const { authentication } = require('@jumper251/core-module');


router.post("/", async (req, res) => {
    const { name, password } = req.body;

    const user = await User.findOne({ name: name });
    if (!user) return res.status(404).send({ error: "User not found" });

    if (await user.matchPassword(password)) {
        if (user.twofa && user.twofa.enabled) {
            twoFactorAuth.addPending(user);

            return res.send({ twoFactorRequired: true });
        }

        res.header("Authorization", "Bearer " + user.generateToken()).send({ refresh: user.generateRefreshToken() });
    } else {
        res.status(401).send({ error: "Bad credentials" });
    }

});


router.post("/2fa", async (req, res) => {
    const { name, otp } = req.body;

    const user = twoFactorAuth.find(name);
    if (!user) return res.status(400).send({ error: "No pending authentications found" });

    if (await twoFactorAuth.compareIdentity(otp, user.twofa.identity)) {
        twoFactorAuth.removePending(name);

        res.header("Authorization", "Bearer " + user.generateToken()).send({ refresh: user.generateRefreshToken() });
    } else {
        res.status(401).send({ error: "Invalid OTP" })
    }

});

router.post("/refresh", async (req, res) => {
    const { refreshToken, name } = req.body;

    const decoded = await tokenGenerator.verify(refreshToken);
    if (decoded.error) return res.status(401).send({ error: "Invalid token" });

    const user = await User.findOne({ name: decoded.username });
    if (!user || decoded.username !== name) return res.status(401).send({ error: "Invalid token" });

    res.header("Authorization", "Bearer " + user.generateToken()).send({ message: "Token refreshed" });
});

router.get("/createtoken", [authentication], async (req, res) => {
    const user = await User.findOne({ name: req.user.username });
    if (!user) return res.status(401).send({ error: "Invalid User" });

    res.send({ token: user.generateApiKey()})
})

module.exports = router;