import { ServerPlan } from '../models/ServerPlan';
import { Account } from '../models/Account';
import mongoose from 'mongoose';
import { PricingDetails, PricingOption } from '../billing/pricing';
import { BillingService } from '../billing/BillingService';
import { AnalyticsPlan } from '@jumper251/core-module/build/types/plans';

const customerId = new mongoose.Types.ObjectId().toHexString();

const pricingDetails1: PricingDetails = {
    cpu: 1,
    backups: {
        included: 1,
        modifier: 0.1
    },
    displayName: 'test1',
    memory: 1,
    storage: 1,
    traffic: 1,
    price: {
        hourly: 0.01,
        monthly: 7,
        pauseModifier: 0.2
    }
}

const pricingDetails2: PricingDetails = {
    ...pricingDetails1,
    price: {
        hourly: 0.011,
        monthly: 16,
        pauseModifier: 0.2
    }
}

const pricingDetails3: PricingDetails = {
    ...pricingDetails1,
    price: {
        hourly: 0.0,
        monthly: 16,
        pauseModifier: 0.2
    }
}



const createAccount = async (balance = 0, limits?: { servers: number, memory: number }) => {
    const account = new Account({
        customer: customerId,
        balance
    });

    if (limits) account.limits = limits;
    await account.save();

    return { account, billing: new BillingService(account) }
}

const createServerPlan = (memory: number, additional?: Partial<ServerPlan>) => {
    const serverPlan = new ServerPlan({
        provider: 'hetzner',
        customer: customerId,
        templateType: 'static',
        status: 'active',
        pricingPlan: PricingOption.Custom,
        pricingDetails: pricingDetails1,
        resources: {
            analytics: AnalyticsPlan.STANDARD,
            backups: 1,
            memory
        },
        ...additional
    })

    return serverPlan.save();
}

export { pricingDetails1, pricingDetails2, pricingDetails3, customerId, createAccount, createServerPlan };