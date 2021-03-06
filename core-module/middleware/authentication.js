const jwt = require("jsonwebtoken");
const config = require("../utils/config");
const authManager = require("../utils/authenticationManager");

function authentication(req, res, next) {
    let token = req.header("Authorization");
    if (!token) return res.status(401).send({ error: "Invalid token" });

    try {
        token = token.replace("Bearer ", "");

        const user = jwt.verify(token, config.jwtPrivateKey);
        if (user.type === "refresh") return res.status(401).send({ error: "Invalid token" });

        req.user = user;

        next();
    } catch (ex) {
        res.status(401).send({ error: "Invalid token" });
    }
}

authentication.active = function (req, res, next) {
    if (!req.user.active) {
        return res.status(403).send({ error: "Must be active", requiredActive: true });
    }

    next();
}

authentication.permission = function (options = {}) {
    return async (req, res, next) => {
        let checkIdentity = options.checkIdentity;
        if (typeof checkIdentity === 'undefined') {
            checkIdentity = true;
        }

        const identity = options.identity || req.params.name;

        const identityFailed = (checkIdentity && identity !== req.user.username) || !checkIdentity;
        const permissionDenied = (options.access && ! await authManager.canAccess(req.user, options.access)) || !options.access;

        if (identityFailed && permissionDenied) {
            return res.status(403).send({ error: "Access forbidden" });
        }

        next();
    }
}

module.exports = authentication;