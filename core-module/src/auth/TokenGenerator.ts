import jwt from 'jsonwebtoken';
import config from '../utils/config';
import { TokenUser, Role } from './authenticationManager';


class TokenGenerator {
    serviceToken?: string

    generateToken(payload: TokenUser) {
        return jwt.sign(payload, config.jwtPrivateKey!);
    }

    generateExpiringToken(payload: TokenUser, expires: string) {
        return jwt.sign(payload, config.jwtPrivateKey!, { expiresIn: expires });
    }

    verify(token: string) {
        return new Promise(resolve => {
            jwt.verify(token, config.jwtPrivateKey!, function (err, decoded) {
                if (err) resolve({ error: true });

                resolve(decoded);
            });
        })
    }

    generateServiceToken(cache: boolean) {
        if (!this.serviceToken || !cache) {
            const payload: TokenUser = {
                username: "ServiceAccount",
                active: true,
                roles: [Role.Service]
            }
            this.serviceToken = jwt.sign(payload, config.jwtPrivateKey!);
        }

        return this.serviceToken;
    }
}

const tokenGenerator = new TokenGenerator();

export default tokenGenerator;
