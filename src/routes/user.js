/**
 * This handles the User routes declaration in the application
 * @module ROUTES:User
 */

const router = require('express').Router();

const { Logger } = require('../utilities/logger');
const UserService = require('../services/user/user');

const userService = new UserService();

try {
    router
        .post('/', async (request, response, next) => {
            request.payload = await userService.createRecord({ request, next });
            next();
        })
        .put('/start-shift', async (request, response, next) => {
            request.payload = await userService.startShift({ request, next });
            next();
        })
        .get('/', async (request, response, next) => {
            request.payload = await userService.readRecords({ request, next });
            next();
        })
        .get('/:id', async (request, response, next) => {
            request.payload = await userService.readRecordById({ request, next });
            next();
        })
        .get('/filter', async (request, response, next) => {
            request.payload = await userService.readRecordsByFilter({ request, next });
            next();
        })
        .get('/search/:keys/:keyword', async (request, response, next) => {
            request.payload = await userService.readRecordsByWildcard({ request, next });
            next();
        })
        .put('/', async (request, response, next) => {
            request.payload = await userService.updateRecords({ request, next });
            next();
        })
        .put('/:id', async (request, response, next) => {
            request.payload = await userService.updateRecordById({ request, next });
            next();
        })
        .delete('/', async (request, response, next) => {
            request.payload = await userService.deleteRecords({ request, next });
            next();
        })
        .delete('/:id', async (request, response, next) => {
            request.payload = await userService.deleteRecordById({ request, next });
            next();
        });
} catch (e) {
    const currentRoute = '[Route Error] /user';
    if (verifyDevelopmentEnvironment) {
        console.log(`${currentRoute}: ${e.message}`);
    } else {
        Logger.error(`${currentRoute}: ${e.message}`);
    }
} finally {
    module.exports = router;
}
