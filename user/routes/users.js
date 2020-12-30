const express = require('express');
const router = express.Router();
const User = require('../models/User');

const { authentication, authManager } = require('@jumper251/core-module');

router.get("/:name", authentication, async (req, res) => {
    const paramName = req.params.name;
    const username = req.user.username;

    if (!req.user.roles.includes(authManager.roles.service)) {
        const requestUser = await User.findOne({ name: username });

        if (username !== paramName && ! await authManager.canAccess(requestUser, authManager.accessPoints.userLookup)) {
            return res.status(403).send({ error: "Access forbidden" });
        }
    }

    const user = await User.findOne({ name: paramName }).select("-password -__v");
    if (!user) return res.status(404).send({ error: "User not found" });

    res.send(user);

});

router.post("/", async (req, res) => {
    const { error } = User.validate(req.body);
    if (error) return res.status(400).send({ error: error.details[0].message });

    const dbUser = await User.findOne().or([{ name: req.body.name }, { email: req.body.email }]).select("email name");
    if (dbUser) return res.status(400).send({ error: "User already exists", cause: dbUser.name === req.body.name ? req.body.name : req.body.email });

    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    });

    await user.encryptPassword();
    await user.save();

    res.status(201).header("Authorization", "Bearer " + user.generateToken()).send({ refresh: user.generateRefreshToken() });
});

router.put("/:name", [authentication, authentication.permission()], async (req, res) => {
    const { error } = User.validateUpdate(req.body);
    if (error) return res.status(400).send({ error: error.details[0].message });

    const dbUser = await User.findOne({ name: req.params.name });
    if (!dbUser) return res.status(404).send({ error: "User not found" });

    try {
        await dbUser.updateData(req.body);
    } catch (ex) {
        return res.status(400).send({ error: ex });
    }

    res.send({ message: "User updated" });
});

module.exports = router;