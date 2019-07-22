const jwt = require("jsonwebtoken");
const config = require("../utils/config");

function auth(req, res, next) {
    let token = req.header("Authorization");
    if (!token) return res.status(401).send({error: "Invalid token"});
    token = token.replace("Bearer ", "");

    try {
        const user = jwt.verify(token, config.jwtPrivateKey);
        req.user = user;

        next();
    } catch (ex) {
        res.status(401).send({error: "Invalid token"});
    }
}

module.exports = auth;