import express, { Request, Response } from 'express';

import { Customer } from '../models/Customer';
import { validate } from '../middleware/validate';
import config from '../utils/config';
import { authentication, ServiceRequest } from '@jumper251/core-module';

const router = express.Router();

router.post('/', [validate(Customer.checkValid)], async (req: Request, res: Response) => {
    try {
        const response = await new ServiceRequest(`${config.userServiceUrl}/users/${req.body.username}`)
            .withRetries(2)
            .withRetryWait(400)
            .withToken(req.header('Authorization')!)
            .exec();

        console.log(response.data);
    } catch (err) {
        return res.status(err.response.status).send(err.response.data);
    }
});

export { router as customerRouter };

