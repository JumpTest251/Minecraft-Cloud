import { Request, Response, NextFunction } from 'express'
import { ValidationResult } from 'joi'

export const validate = (validator: (toValidate: any) => Promise<ValidationResult>) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const { error } = await validator(req.body);

        if (error) {
            return res.status(400).send({ error: error.details[0].message })
        }

        next();
    }
}