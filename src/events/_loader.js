/**
 * This part of the codebase is for handling events loads.
 * @module EVENTS:Loader
 */

const { resolve } = require('path');

const glob = require('glob');

/**
 *
 * Recursively loads all event definition files in the events folder into the app.
 * @function
 */
function loadEventSystem() {
    const basePath = resolve(__dirname, '.');
    const files = glob.sync('*.js', { cwd: basePath });
    files.forEach((file) => {
        if (file.toLocaleLowerCase().includes('_config')) return;
        // eslint-disable-next-line
        require(resolve(basePath, file));
    });
}

module.exports = { loadEventSystem };
