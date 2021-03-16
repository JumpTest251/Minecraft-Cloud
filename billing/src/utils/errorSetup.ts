import { sentry } from '@jumper251/core-module';
import { Router } from 'express'

export default function (app?: Router) {
    sentry.setupSentry({
        app,
        handleException: true,
        handleRejection: true,
        tracing: true,
        onlyProduction: true
    })
}
