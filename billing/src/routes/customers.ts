import express, { Request, Response } from 'express';

import { Customer, CustomerAttrs } from '../models/Customer';
import { Account } from '../models/Account';
import { validate, permissionCheck } from '../middleware/validate';
import { customerExists } from '../middleware/models';
import config from '../utils/config';
import { ServiceRequest } from '@jumper251/core-module';

const router = express.Router();


router.post('/', [validate(Customer.checkValid)], async (req: Request, res: Response) => {
    const username = req.body.username || req.user!.username

    try {
        const { data: { _id, email } } = await new ServiceRequest(`${config.userServiceUrl}/users/${username}`)
            .withRetries(2)
            .withRetryWait(400)
            .withToken(req.header('Authorization')!)
            .exec();

        const exists = await Customer.exists({ _id });
        if (exists) {
            return res.status(400).send({ error: "Customer already exists" });
        }

        const customer = new Customer({
            _id,
            email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            address: req.body.address
        })
        if (req.body.phone) customer.phone = req.body.phone;

        await customer.save();

        await Account.createForCustomer(customer._id);

        res.status(201).send(customer);
    } catch (err) {
        return res.status(err.response.status).send(err.response.data);
    }
});

router.get('/:id', [permissionCheck, customerExists], async (req: Request, res: Response) => {
    res.send(req.customer);
});

router.put('/:id', [permissionCheck, validate(Customer.checkValid), customerExists], async (req: Request, res: Response) => {
    const customerUpdate: Partial<CustomerAttrs> = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        address: req.body.address
    }

    if (req.body.phone) customerUpdate.phone = req.body.phone;

    await Customer.updateOne({ _id: req.params.id }, customerUpdate);

    res.send({ message: 'Customer updated' });
});



export { router as customerRouter };

