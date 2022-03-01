/**
 * This handles all the required Express router configuration for the application.
 * @module ROUTES:Config
 */

const router = require('express').Router();
const { handle404, handleError, setupRequest, processResponse } = require('../middlewares/http');

/** Models Route Handlers */
const userRouteHandler = require('./user');
const logsRouterHandler = require('./externalLogger');

/** Cross Origin Handling */
router.use(setupRequest);
router.use('/users', userRouteHandler);
router.use(processResponse);

/** Static Routes */
router.use('/image/:imageName', () => {});
/** Query Logs */
router.use('/external-logs', logsRouterHandler);

router.use(handle404);
router.use(handleError);

module.exports = router;
