/**
 * This handles all the configuration for the application logs and external logging feature.
 * @module ROUTES:ExternalLogger
 */

const router = require('express').Router();

const { Logger, retrieveLogs } = require('../utilities/logger');

try {
    router.get('/', async (request, response) => {
        response.send(await retrieveLogs(request.query));
    });
} catch (e) {
    const currentRoute = '[Route Error] /logs';
    if (verifyDevelopmentEnvironment) {
        console.log(`${currentRoute}: ${e.message}`);
    } else {
        Logger.error(`${currentRoute}: ${e.message}`);
    }
} finally {
    module.exports = router;
}
