import { Account } from '../models/Account';
import { ServerPlan } from '../models/ServerPlan';

import { calculateHoursLeft, calculateHourlyCosts } from './costCalculator';
import { PricingDetails } from './pricing';
import { plans } from '@jumper251/core-module';

export class BillingService {
    private account: Account;

    private minHours = 2;

    constructor(account: Account) {
        this.account = account;
    }

    async authorizePlan({ resources, pricingDetails, serverPlanId, provider }: AuthorizablePlan) {
        const serverPlans = await ServerPlan.findByCustomer(this.account.customer as string);
        const memory = this.memoryUsage(serverPlans, serverPlanId) + resources.memory;

        if (memory > this.account.limits.memory && provider !== 'custom') {
            throw new Error('Memory limit has been reached.')
        }

        if (serverPlans.length >= this.account.limits.servers && !serverPlanId) {
            throw new Error('Server limit has been reached.');
        }

        const { totalCosts } = calculateHourlyCosts(resources, pricingDetails);
        const newUsage = totalCosts + (await this.hourlyUsage(serverPlans));

        if (!this.canAfford(newUsage)) {
            throw new Error('Insufficient balance or invalid payment method.')
        }

    }

    canAfford(hourlyPrice: number, hours?: number) {
        const minHours = hours || this.minHours;

        if (this.account.hasPaymentMethod) {
            return true;
        }

        const remainingHours = calculateHoursLeft(hourlyPrice, this.account.balance);

        return remainingHours >= minHours;
    }

    async hourlyUsage(serverPlans: ServerPlan[]) {
        return serverPlans
            .map(serverPlan => serverPlan.hourlyCosts())
            .reduce((a, b) => a + b, 0.0);
    }

    memoryUsage(serverPlans: ServerPlan[], serverPlanId?: string) {
        return serverPlans
            .filter(serverPlan => serverPlan.provider !== 'custom' && !serverPlan._id.equals(serverPlanId))
            .map(serverPlan => serverPlan.resources.memory)
            .reduce((a, b) => a + b, 0.0);
    }

}

export interface AuthorizablePlan {
    resources: plans.Plan,
    pricingDetails: PricingDetails,
    serverPlanId?: string,
    provider?: string
}