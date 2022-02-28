/**
 * This handles all the required model configuration for the application.
 * @module MODELS:Config
 */

const { APP_DB_URI, NODE_ENV } = process.env;

const { resolve } = require('path');

const glob = require('glob');
const mongoose = require('mongoose');

const { Logger } = require('../utilities/logger');

/**
 *
 * Mongoose opens a connection to MongoDB using the APP_DB_URI environment variable.
 * @function
 */
function connectToDatabase() {
    try {
        mongoose.connect(
            APP_DB_URI,
            {
                autoIndex: true,
                useNewUrlParser: true,
                useUnifiedTopology: true,
            },
            (err, data) => {
                if (err) {
                    if (NODE_ENV !== 'development') {
                        Logger.error(`[Database Connection Error] ${err}`);
                    } else {
                        console.log('🔴 Database connection failed.');
                    }
                    return;
                }
                if (data) console.log('🟢 Database connection successful');
            }
        );
    } catch (e) {
        if (verifyDevelopmentEnvironment) {
            console.log(`DB Error: ${e.message}`);
        } else {
            Logger.error(`[DB Error: ] ${e.message}`);
        }
    }
}

/**
 *
 * Recursively loads all model definition files in the models folder into the app.
 * @function
 */
function loadModels() {
    const basePath = resolve(__dirname, '../models/');
    const files = glob.sync('*.js', { cwd: basePath });
    files.forEach((file) => {
        if (file.toLocaleLowerCase().includes('_config')) return;
        // eslint-disable-next-line
        require(resolve(basePath, file));
    });
}

module.exports = {
    connectToDatabase,
    loadModels,
};
