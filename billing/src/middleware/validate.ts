import { Request, Response, NextFunction } from 'express'
import { ValidationResult } from 'joi'
import { authManager } from '@jumper251/core-module';

export const validate = (validator: (toValidate: any) => Promise<ValidationResult>) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await validator(req.body);

        } catch (error) {
            return res.status(400).send({ error: error.details[0].message })
        }

        next();
    }
}

export const permissionCheck = async (req: Request, res: Response, next: NextFunction) => {
    const access = await authManager.canAccess(req.user!, authManager.Permission.UserLooup, {
        actual: req.user!.userId,
        requested: req.params.id
    })

    if (!access) {
        return res.status(403).send({ error: 'Access denied' });
    }

    next();
}