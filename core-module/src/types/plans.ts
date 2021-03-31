export enum AnalyticsPlan {
    STANDARD = 'standard',
    ADVANCED = 'advanced',
    NONE = 'none'
}

export interface Plan {
    memory: number,
    backups: number,
    analytics: AnalyticsPlan
}