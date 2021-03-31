import { ServerPlan } from '../models/ServerPlan';
import { Account } from '../models/Account';
import mongoose from 'mongoose';
import { AnalyticsPlan, Plan } from '@jumper251/core-module/build/types/plans';
import { BillingService } from '../billing/BillingService';
import { PricingDetails, PricingOption } from '../billing/pricing';
import { createAccount, createServerPlan, pricingDetails3, pricingDetails2, pricingDetails1 } from './testHelper';


const addServers = async (amount: number, memory = 2) => {
    const memoryPerServer = memory / amount;
    const serverPlans = [];
    for (let i = 0; i < amount; i++) {
        const plan = await createServerPlan(memoryPerServer);
        serverPlans.push(plan);
    }

    return serverPlans;
}

describe('Calculate usages', () => {
    it('calculates total hourly price', async () => {
        const serverPlans = await addServers(5);
        const { account, billing } = await createAccount();

        const totalPrice = await billing.hourlyUsage(serverPlans);
        const totalPrice2 = await billing.hourlyUsage([]);

        expect(totalPrice).toEqual(0.05);
        expect(totalPrice2).toEqual(0);
    })

    it('calculates total memory', async () => {
        const serverPlans = await addServers(5, 5);
        const { account, billing } = await createAccount();

        expect(billing.memoryUsage(serverPlans)).toEqual(5);
        expect(billing.memoryUsage([])).toEqual(0);
    })

    it('can afford a server', async () => {
        const { account, billing } = await createAccount(0.1);

        expect(billing.canAfford(0.01, 3)).toEqual(true);
        expect(billing.canAfford(0.01, 10)).toEqual(true);
        expect(billing.canAfford(0.01, 11)).toEqual(false);
    })
});

describe('Authorize Plans', () => {
    it('authorizes a new plan', async () => {
        const serverPlans = await addServers(2);
        const { account, billing } = await createAccount(0.06, { memory: 32, servers: 5 });

        const newPlan = {
            resources: serverPlans[0].resources,
            pricingDetails: pricingDetails1
        }

        const newPlan2 = {
            resources: { ...newPlan.resources, memory: 32 },
            pricingDetails: pricingDetails1
        }

        const newPlan3 = {
            resources: newPlan.resources,
            pricingDetails: pricingDetails2
        }

        const newPlan4 = {
            resources: newPlan.resources,
            pricingDetails: pricingDetails3
        }
        const newPlan5 = {
            resources: newPlan2.resources,
            pricingDetails: pricingDetails3,
            provider: 'custom'
        }

        await expect(billing.authorizePlan(newPlan)).resolves.not.toBeDefined();
        await expect(billing.authorizePlan(newPlan2)).rejects.toThrow('Memory limit');
        await expect(billing.authorizePlan(newPlan3)).rejects.toThrow('Insufficient');

        await createServerPlan(32, { provider: 'custom', pricingDetails: pricingDetails3 });
        await expect(billing.authorizePlan(newPlan4)).resolves.not.toBeDefined();
        await expect(billing.authorizePlan(newPlan5)).resolves.not.toBeDefined();

        await createServerPlan(2, { templateType: 'dynamic' });
        await expect(billing.authorizePlan(newPlan)).resolves.not.toBeDefined();

        await createServerPlan(2);
        await expect(billing.authorizePlan(newPlan)).rejects.toThrow('Server limit');

    });

    it('authorizes a server unpause', async () => {
        await addServers(2);
        const plan = await createServerPlan(2, { status: 'paused' });
        const { account, billing } = await createAccount(0.064);

        const updatePlan = {
            resources: plan.resources,
            pricingDetails: plan.pricingDetails!,
            serverPlanId: plan._id
        }

        await expect(billing.authorizePlan(updatePlan)).resolves.not.toBeDefined();
    })


    it('authorizes a server upgrade', async () => {
        await addServers(2);
        const plan = await createServerPlan(24);
        const { account, billing } = await createAccount(0.08);

        const updatePlan = {
            resources: { ...plan.resources, memory: 30 },
            pricingDetails: plan.pricingDetails!,
            serverPlanId: plan._id
        }

        const updatePlan2 = {
            resources: { ...plan.resources, memory: 31 },
            pricingDetails: plan.pricingDetails!,
            serverPlanId: plan._id
        }


        await expect(billing.authorizePlan(updatePlan)).resolves.not.toBeDefined();
        await expect(billing.authorizePlan(updatePlan2)).rejects.toThrow('Memory limit');
    })
});