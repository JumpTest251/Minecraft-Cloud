import { PricingDetails } from './pricing';
import { plans } from '@jumper251/core-module';

export const calculateHourlyCosts = (resources: plans.Plan, pricingDetails: PricingDetails) => {
    // Calculate server costs
    const serverCosts = pricingDetails.price.hourly;

    // Calculate backup costs
    const backupCosts = calculateBackupCosts(resources, pricingDetails);

    // Calculate monitoring costs
    let analyticsPlanCosts = pricingDetails.monitoring?.[resources.analytics];
    if (!analyticsPlanCosts) {
        analyticsPlanCosts = 0;
    }


    const totalCosts = serverCosts + backupCosts + analyticsPlanCosts;

    const totalCostsPaused =
        (serverCosts * pricingDetails.price.pauseModifier) +
        backupCosts +
        analyticsPlanCosts;

    return { serverCosts, totalCosts, totalCostsPaused, analyticsPlanCosts };
}

export const calculateBackupCosts = ({ backups }: plans.Plan, pricingDetails: PricingDetails) => {
    const additionalBackups = backups - pricingDetails.backups.included;
    const backupModifier =
        additionalBackups > 0
            ? pricingDetails.backups.modifier * additionalBackups
            : 0;

    return backupModifier * pricingDetails.price.hourly;
}

export const calculateHoursLeft = (hourlyPrice: number, balance: number) => {
    return balance / hourlyPrice;
}
