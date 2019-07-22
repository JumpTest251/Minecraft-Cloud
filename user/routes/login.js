const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post("/", async (req, res) => {
    const {name, password} = req.body;

    const user = await User.findOne({name: name});
    if(!user) return res.status(404).send({error: "User not found"});

    if (await user.matchPassword(password)) {
        res.header("Authorization", "Bearer " + user.generateToken()).send({message: "Login successfull"});
    } else {
        res.status(401).send({error: "Bad credentials"});
    }

});

module.exports = router;