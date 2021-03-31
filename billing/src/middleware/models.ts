import { Customer } from '../models/Customer';
import { Account } from '../models/Account';

import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';


declare global {
    namespace Express {
        interface Request {
            customer?: Customer;
            account?: Account;
        }
    }
}

export const customerExists = async (req: Request, res: Response, next: NextFunction) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
        return res.status(400).send({ error: "Invalid ID" })

    const customer = await Customer.findById(req.params.id);
    if (!customer) {
        return res.status(404).send({ error: "Customer not found" });
    }

    req.customer = customer;
    next();
}

export const accountExists = async (req: Request, res: Response, next: NextFunction) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
        return res.status(400).send({ error: "Invalid ID" })

    const account = await Account.findOne({ customer: req.params.id });
    if (!account) {
        return res.status(404).send({ error: "Account not found" });
    }

    req.account = account;
    next();
}
