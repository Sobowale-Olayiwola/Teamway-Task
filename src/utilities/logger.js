/**
 * @module UTILITY:WinstonLoggerAndMorganRequestMiddleware
 */

const { NODE_ENV } = process.env;

const { createWriteStream, readFile } = require('fs');
const { resolve } = require('path');

const morgan = require('morgan');
const { createLogger, format, transports } = require('winston');

const readFiles = require('util').promisify(readFile);

class Loggers {
    constructor() {
        this.init();
    }

    init() {
        /** MORGAN */
        const devFormat =
            '[:date[web] :remote-addr :remote-user ] :method :url HTTP/:http-version | :status :response-time ms';
        const prodFormat =
            '[:date[web] :remote-addr :remote-user ] :method :url HTTP/:http-version :referrer - :user-agent | :status :response-time ms';
        const morganFormat = NODE_ENV === 'production' ? prodFormat : devFormat;

        // eslint-disable-next-line object-curly-newline
        const requestLogStream = createWriteStream(resolve(__dirname, '../../logs/request.log'), {
            flags: 'a',
            // eslint-disable-next-line object-curly-newline
        });

        this.morganRequestMiddleware = morgan(morganFormat, { stream: requestLogStream });

        /** WINSTON */
        const { colorize, combine, printf, timestamp } = format;

        const logTransports = {
            console: new transports.Console({ level: 'warn' }),
            combinedLog: new transports.File({ level: 'info', filename: 'logs/combined.log' }),
            errorLog: new transports.File({ level: 'error', filename: 'logs/error.log' }),
            exceptionLog: new transports.File({ filename: 'logs/exception.log' }),
        };

        const logFormat = printf(
            ({ level, message, timestamp }) => `[${timestamp} : ${level}] - ${message}]`
        );

        this.logger = createLogger({
            transports: [logTransports.console, logTransports.combinedLog, logTransports.errorLog],
            exceptionHandlers: [logTransports.exceptionLog],
            exitOnError: false,
            format: combine(colorize(), timestamp(), logFormat),
        });
    }

    /**
     *
     * @param {object} type, length, timeFilterRange , order, file
     * @returns {object|string}
     */
    async retrieveLogs({
        type = 'combined',
        length = 100,
        timeFilterRange = null,
        order = 'Head',
        file = 'text',
    }) {
        try {
            //validate inputs

            // read log file i.e error, request, combined etc
            const logs = await readFiles(resolve(__dirname, `../../logs/${type}.log`), {
                encoding: 'utf8',
            });

            // convert logs from string to array
            const convertedLogsToArray =
                type === 'exception' ? logs.split('\r\n') : logs.split('\n');

            //Remove the undefined in the array after split
            !convertedLogsToArray[convertedLogsToArray.length - 1] && convertedLogsToArray.pop();

            // clean logs from extras and convert to  array of  json
            let formatLogsToJson = convertedLogsToArray.map(Loggers.clean(type));

            //filter logs by timestamp
            if (timeFilterRange) {
                let [startDate, endDate] = timeFilterRange.split('*');

                startDate = startDate
                    ? Loggers.parseDate(startDate)
                    : Loggers.parseDate(new Date());

                endDate = endDate ? Loggers.parseDate(endDate) : Loggers.parseDate(new Date());

                formatLogsToJson = formatLogsToJson.filter((value) => {
                    const time = new Date(value.timestamp);

                    return time > startDate && time < endDate;
                });
            }

            //get range to display
            let range =
                order == 'Tail'
                    ? [formatLogsToJson.length - length, formatLogsToJson.length]
                    : [0, length];

            //get range of logs to return
            const selectedLogs = formatLogsToJson.splice(...range);

            // send json back to the client
            if (file === 'json') {
                return selectedLogs;
            }

            //send strings back to the client
            return selectedLogs.reduce(Loggers.formatString(type), ``);
        } catch (error) {
            return `Error ${error} in pulling logs.`;
        }
    }

    static formatString(type) {
        return (previous, current) => {
            //[Wed, 10 Nov 2021 08:08:49 GMT ::1 - ] GET /version?timeout=5s HTTP/1.1 | 404 2.553 ms
            if (type === 'request') {
                const { timestamp, ip, method, route, version, status, runtime } = current;
                return (
                    previous +
                    `[${timestamp} GMT ${ip}] ${method} ${route} ${version} | ${status} ${runtime}\n`
                );
            } else {
                const { timestamp, logLevel, message } = current;

                return previous + `[${timestamp} : ${logLevel}] - ${message}\n`;
            }
        };
    }

    static parseDate(date) {
        let newDate = new Date(date);
        newDate.setDate(newDate.getDate() + 1);
        return newDate;
    }

    static clean(type) {
        return (value) => {
            if (type == 'request') {
                const [firstPart, secondPart] = value.split(' | ');
                const [status, runtime] = secondPart.split(' ');
                let [stamp, request] = firstPart.split(']');
                let [timestamp, ip] = stamp.split('GMT');
                request = request.slice(1, -1);
                const [method, route, version] = request.split(' ');

                timestamp = timestamp.slice(1, -1);

                return {
                    method,
                    route,
                    version,
                    ip,
                    timestamp,
                    status,
                    runtime: `${runtime} ms`,
                };
            } else {
                const [stamp, message] = value.split(' - ');
                let [timestamp, logLevel] = stamp.split(' : ');
                timestamp = timestamp.slice(1, -1);
                logLevel = logLevel.slice(0, -1);
                return { timestamp, logLevel, message };
            }
        };
    }
}

const logs = new Loggers();

module.exports = {
    Logger: logs.logger,
    morganRequestMiddleware: logs.morganRequestMiddleware,
    retrieveLogs: logs.retrieveLogs,
};
