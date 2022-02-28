/**
 *
 * This is the entry-point for all Nodejs Events in the application
 * @module EVENTS:Config
 */

const EventEmitter = require('events');

const { Logger } = require('../utilities/logger');

/**
 *
 * This class extends the NodeJS event emitter class and allows
 *  for using custom events in the application.
 * @class
 */
class AppEvent extends EventEmitter {}

const appEvent = new AppEvent();

appEvent.on('error', (error) => {
    Logger.error(`[AppEvent Error] ${error}`);
});

appEvent.on('sampleEventName', (param) => {
    console.log(param);
});

module.exports = appEvent;
