/**
 * This handles the Sample routes declaration in the application
 * @module ROUTES:Sample
 */

const router = require('express').Router();

const { Logger } = require('../utilities/logger');
const SampleService = require('../services/sample/sample');

const sampleService = new SampleService();

try {
    router
        .post('/', async (request, response, next) => {
            request.payload = await sampleService.createRecord({ request, next });
            next();
        })
        .get('/', async (request, response, next) => {
            request.payload = await sampleService.readRecords({ request, next });
            next();
        })
        .get('/:id', async (request, response, next) => {
            request.payload = await sampleService.readRecordById({ request, next });
            next();
        })
        .get('/filter', async (request, response, next) => {
            request.payload = await sampleService.readRecordsByFilter({ request, next });
            next();
        })
        .get('/search/:keys/:keyword', async (request, response, next) => {
            request.payload = await sampleService.readRecordsByWildcard({ request, next });
            next();
        })
        .put('/', async (request, response, next) => {
            request.payload = await sampleService.updateRecords({ request, next });
            next();
        })
        .put('/:id', async (request, response, next) => {
            request.payload = await sampleService.updateRecordById({ request, next });
            next();
        })
        .delete('/', async (request, response, next) => {
            request.payload = await sampleService.deleteRecords({ request, next });
            next();
        })
        .delete('/:id', async (request, response, next) => {
            request.payload = await sampleService.deleteRecordById({ request, next });
            next();
        });
} catch (e) {
    const currentRoute = '[Route Error] /sample';
    if (verifyDevelopmentEnvironment) {
        console.log(`${currentRoute}: ${e.message}`);
    } else {
        Logger.error(`${currentRoute}: ${e.message}`);
    }
} finally {
    module.exports = router;
}
