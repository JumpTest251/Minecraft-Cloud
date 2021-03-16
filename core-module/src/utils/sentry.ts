import * as Sentry from '@sentry/node';
import { ExtractedNodeRequestData } from '@sentry/types/dist/misc';
import * as Tracing from "@sentry/tracing";

import { ErrorRequestHandler, Router } from 'express';

import config from './config';

export interface ErrorConfig {
    app?: Router,
    tracing?: boolean,
    handleException?: boolean,
    handleRejection?: boolean,
    onlyProduction?: boolean,
    customFilter?: (context: ExtractedNodeRequestData) => number
}

export function setupSentry(ec: ErrorConfig) {
    const integrations = [];
    if (ec.tracing) integrations.push(new Sentry.Integrations.Http({ tracing: true }));

    if (ec.app) {
        new Tracing.Integrations.Express({
            app: ec.app,
        });
    }

    if (ec.handleException) integrations.push(new Sentry.Integrations.OnUncaughtException());
    if (ec.handleRejection) integrations.push(new Sentry.Integrations.OnUnhandledRejection());


    Sentry.init({
        dsn: config.sentryDSN,
        integrations,
        tracesSampler(context) {
            if (context.request?.method === 'OPTIONS') return false;

            if (ec.customFilter && context.request) return ec.customFilter(context.request);

            return 1;
        },
        enabled: !ec.onlyProduction || (ec.onlyProduction && process.env.NODE_ENV === 'production')
    });
}

export const reportError = Sentry.captureException;

export const requestHandler = Sentry.Handlers.requestHandler();

export const errorHandler: ErrorRequestHandler = Sentry.Handlers.errorHandler();

export const tracingHandler = Sentry.Handlers.tracingHandler();