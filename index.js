/**
 * This serves as the template root file and application entry-point.
 * It declares the required items into the global scope and
 * runs necessary aspects of the codebase as required.
 * @module Index
 */

const { APP_PORT, APP_NAME } = process.env;

const expressMongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const hpp = require('hpp');

/** Non-global Utilities */
const { connectToDatabase, loadModels } = require('./src/models/_config');
const { morganRequestMiddleware, Logger } = require('./src/utilities/logger');
const { loadEventSystem } = require('./src/events/_loader');

const app = express();
connectToDatabase();
loadEventSystem();
loadModels();

/** Global Utilities */
require('./src/utilities/globals');

/** Middleware Applications */
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.json({ limit: '10mb' }));
app.use(morganRequestMiddleware);
app.use(expressMongoSanitize());
app.use(compression());
app.use(helmet());
app.use(cors());
app.use(hpp());

/** Route Middleware */
app.use('/', require('./src/routes/_config'));

/** Starting Server */
app.listen(APP_PORT, () => {
    if (verifyDevelopmentEnvironment) {
        console.log(`🔥 Development Server is running at http://localhost:${APP_PORT}`);
    } else {
        const successMessage = `😃 ${APP_NAME} is LIVE on port ${APP_PORT}`;
        console.log(successMessage);
        Logger.info(successMessage);
    }
});
