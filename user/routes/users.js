const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require("../middleware/authentication");
const authManager = require("../utils/authenticationManager");

router.get("/:name", auth, async (req, res) => {
    const paramName = req.params.name;
    const username = req.user.username;
    const requestUser = await User.findOne({name: username});

    if (username !== paramName && ! await authManager.canAccess(requestUser, "userLookup")) {
        return res.status(403).send({error: "Access forbidden"});
    }

    const user = await User.findOne({name: paramName}).select("-password -__v");
    if(!user) return res.status(404).send({error: "User not found"});

    res.send(user);
    
});

router.post("/", async (req, res) => {
    const {error} = User.validate(req.body);
    if (error) return res.status(400).send({error: error.details[0].message});
    
    const dbUser = await User.findOne().or([{ name : req.body.name }, { email: req.body.email }]).select("email");
    if (dbUser) return res.status(400).send({error: "User already exists"});

    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    });

    await user.encryptPassword();
    await user.save();

    res.status(201).header("Authorization", "Bearer " + user.generateToken()).send({message: "User created"});
});

router.put("/:name", auth, async (req, res) => {
    const {error} = User.validatePassword(req.body);
    if (error) return res.status(400).send({error: error.details[0].message});

    const username = req.user.username;
    if (username !== req.params.name) return res.status(403).send({error: "Access forbidden"});

    const dbUser = await User.findOne({name: req.params.name});
    if(!dbUser) return res.status(404).send({error: "User not found"});

    dbUser.password = req.body.password;

    await dbUser.encryptPassword();
    await dbUser.save();

    res.send({message: "User updated"});
});

module.exports = router;