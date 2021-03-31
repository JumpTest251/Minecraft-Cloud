import express, { Request, Response } from 'express';
import Joi from 'joi';
import { plans } from '@jumper251/core-module';

import { Account } from '../models/Account';
import { permissionCheck, validate } from '../middleware/validate';
import { accountExists } from '../middleware/models';
import { findByMemory } from '../billing/pricing';
import { BillingService } from '../billing/BillingService';

const router = express.Router();

router.get('/:id', [permissionCheck, accountExists], async (req: Request, res: Response) => {
    res.send(req.account);
});

router.post('/:id/authorize', [permissionCheck, validate(validateRequest), accountExists], async (req: Request, res: Response) => {
    const plan = findByMemory(req.body.resources.memory, req.body.provider);

    if (!plan) {
        return res.status(400).send({ error: 'Unable to find plan' });
    }

    const [pricingOption, pricingDetails] = plan;

    try {
        await new BillingService(req.account!).authorizePlan({
            resources: req.body.resources,
            pricingDetails,
            provider: req.body.provider,
            serverPlanId: req.body.serverId
        });

    } catch (err) {
        return res.status(400).send({ error: err.message });
    }

    res.send({ authorized: pricingOption });
});


function validateRequest(body: any) {
    return Joi.object({
        resources: Joi.object({
            memory: Joi.number().min(1).max(128).required(),
            backups: Joi.number().positive().max(20).required(),
            analyticsPlan: Joi.string().valid(...Object.values(plans.AnalyticsPlan)).required()
        }).required(),
        provider: Joi.string().valid('hetzner', 'custom', 'digitalocean').required(),
        serverId: Joi.string().max(100)
    }).validateAsync(body);
}

export { router as accountRouter };
