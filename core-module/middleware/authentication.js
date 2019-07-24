const jwt = require("jsonwebtoken");
const config = require("../utils/config");

module.exports = function(req, res, next) {
    let token = req.header("Authorization");
    if (!token) return res.status(401).send({error: "Invalid token"});

    try {
        token = token.replace("Bearer ", "");

        const user = jwt.verify(token, config.jwtPrivateKey);
        req.user = user;

        next();
    } catch (ex) {
        res.status(401).send({error: "Invalid token"});
    }
}