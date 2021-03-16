import express, { Router } from 'express';
import { loggingMiddleware, errorMiddleware, corsMiddleware, sentry, authentication } from '@jumper251/core-module';
import { customerRouter } from './customers';

export function setupRoutes(app: Router) {
    app.use(express.json());

    app.use([sentry.requestHandler, sentry.tracingHandler]);

    app.use(loggingMiddleware);
    app.use(corsMiddleware);

    app.use([authentication, authentication.active])
    app.use('/customers', customerRouter);

    app.use(sentry.errorHandler);
    app.use(errorMiddleware);
}