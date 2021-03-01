import { Request, Response, NextFunction } from 'express'

import jwt from "jsonwebtoken";
import config from "../utils/config";
import { canAccess, TokenUser, Permission } from "../auth/authenticationManager";


declare global {
    namespace Express {
        interface Request {
            user?: TokenUser;
        }
    }
}

interface AuthOptions {
    checkIdentity?: boolean,
    identity?: string,
    access?: Permission
}

export default function authentication(req: Request, res: Response, next: NextFunction) {
    let token = req.header("Authorization");
    if (!token) return res.status(401).send({ error: "Invalid token" });

    try {
        token = token.replace("Bearer ", "");

        const user = jwt.verify(token, config.jwtPrivateKey!) as TokenUser;
        if (user.type === "refresh") return res.status(401).send({ error: "Invalid token" });

        req.user = user;

        next();
    } catch (ex) {
        res.status(401).send({ error: "Invalid token" });
    }
}

authentication.active = function (req: Request, res: Response, next: NextFunction) {
    if (!req.user!.active) {
        return res.status(403).send({ error: "Must be active", requiredActive: true });
    }

    next();
}

authentication.permission = function (options: AuthOptions = {}) {
    return async (req: Request, res: Response, next: NextFunction) => {
        let checkIdentity = options.checkIdentity;
        if (typeof checkIdentity === 'undefined') {
            checkIdentity = true;
        }

        const identity = options.identity || req.params.name;

        const identityFailed = (checkIdentity && identity !== req.user!.username) || !checkIdentity;
        const permissionDenied = (options.access && ! await canAccess(req.user!, options.access)) || !options.access;

        if (identityFailed && permissionDenied) {
            return res.status(403).send({ error: "Access forbidden" });
        }

        next();
    }
}

