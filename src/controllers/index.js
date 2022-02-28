/**
 *
 * This is the controller module for the template
 * @module Controller
 */

const mongoose = require('mongoose');

/**
 *
 * A very generic Controller class.
 * This handles the integration of services to models and
 *  their communication with the database using mongoose.
 * @class
 * @param {string} modelName The name of the model as defined in mongoose
 */
class Controller {
    /**
     *
     * @constructor
     * @param {string} modelName The name of the model passed in upon class instantiation
     */
    constructor(modelName) {
        /**
         * This is the model that we are working with and is instantiated for mongoose
         */
        this.model = mongoose.model(modelName);
    }

    /**
     *
     * Local method to remove unwanted properties in a record.
     * @static
     * @private
     * @param {object} record the data to clean
     * @returns {object} a cleaned up format of the received record
     */
    static deleteRecordMetadata(record) {
        const { timeStamp, createdOn, updatedOn, __v, _id, ...recordCoreData } = record;
        return { ...recordCoreData };
    }

    /**
     *
     * Local method to stringify any data passed in.
     * @static
     * @private
     * @param {object} data the data to stringify
     * @returns {object} A JSON stringified format of the parameter
     */
    static jsonize(data) {
        return JSON.parse(JSON.stringify(data));
    }

    /**
     * @static
     * @private
     * @param {object} error the mongo error object
     * @returns {string}   modified error message based on error code
     */
    static mongoErrorMessage({ error }) {
        const { name, code, keyPattern } = error;
        if (name === 'MongoServerError' && code && code === 11000) {
            const keys = Object.keys(keyPattern).join(',');
            return `Entry already exist for ${keys} `;
        } else if (name === 'ValidationError') {
            if (error.errors[Object.keys(error.errors)[0]].properties) {
                const { type, path } = error.errors[Object.keys(error.errors)[0]].properties;
                return `Validation failed for field ${path} (${type}) `;
            }
            const { kind, value, path } = error.errors[Object.keys(error.errors)[0]];
            return `Validation failed for field ${path} (${value}) instead of ${kind} `;
        }
        return 'Validation failed';
    }

    /**
     * @typedef {Object} ControllerError
     * @property {boolean} failed - The boolean value showing error. This is always true.
     * @property {string} error - The error message passed in.
     */

    /**
     *
     * Local method to process all class errors.
     * @static
     * @private
     * @param {string} message input thrown from the built-in Error class
     * @returns {ControllerError} a JSON formatted instance of controller error
     */
    static processError(error) {
        const message = Controller.mongoErrorMessage({ error }) || error.message;
        const errorMessage = verifyDevelopmentEnvironment ? `Controller ${message}` : message;
        return Controller.jsonize({ failed: true, error: errorMessage });
    }

    /**
     *
     * This method creates a document using the mongoose create method that calls create on MongoDB.
     * This returns mongodb success/error object
     * @async
     * @method
     * @param {object} data
     * @returns {object|Promise<void>} Either an error object/successfully created document object
     */
    async createRecord(data) {
        try {
            const n = (await this.model.estimatedDocumentCount()) + 1;
            const recordToCreate = new this.model({ id: n, ...data });
            const createdRecord = await recordToCreate.save();

            return Controller.jsonize(createdRecord);
        } catch (e) {
            return Controller.processError(e);
        }
    }

    /**
     *
     * @typedef {Object} ReadRecordsParameter
     * @property {object} conditions the parameter the query filters by
     * @property {object|string} fieldsToReturn extra parameter that determines
     * the fields to return excluding others
     * @property {object|string} sortOptions specifies ascending or descending sort
     * ( values allowed are asc, desc, ascending descending, 1, and -1.)
     * @property {boolean} count Determines to either query to count or return documents
     * @property {number} skip Specifies the number of documents to skip.
     * @property {number} limit Specifies the maximum number of documents the query will return.
     */

    /**
     *
     * =====Depending on if parameter count is set to true=====
     *
     * This method uses mongoose to creates a countDocuments query.
     * It counts the number of documents that match filter.
     *
     * =====Depending on if parameter count defaults to false=====
     *
     * This method reads matching document using mongoose to creates a find query
     * It gets a list of documents that match filter.
     * This returns mongodb success array of objects or error object
     * @async
     * @method
     * @param {ReadRecordsParameter} {@link ReadRecordsParameter}
     * @returns {object|Promise<void>} Either an array of matching documents/error object
     */
    async readRecords({
        conditions,
        fieldsToReturn = '',
        sortOptions = '',
        count = false,
        skip = 0,
        limit = Number.MAX_SAFE_INTEGER,
    }) {
        try {
            let result = null;
            if (count) {
                result = await this.model
                    .countDocuments({ ...conditions })
                    .skip(skip)
                    .limit(limit)
                    .sort(sortOptions);
                return { count: result };
            }
            result = await this.model
                .find({ ...conditions }, fieldsToReturn)
                .skip(skip)
                .limit(limit)
                .sort(sortOptions);

            return Controller.jsonize([...result]);
        } catch (e) {
            return Controller.processError(e);
        }
    }

    /**
     * @typedef {Object} UpdateRecordParameter
     * @property {object} conditions The object that the documents to update will be filtered by.
     * @property {object} data The data passed in to update the matching documents.
     */

    /**
     *
     * This method create a filter for documents from a updateMany query.
     * This updates all documents that match filter with update.
     * @async
     * @method
     * @param {object<UpdateRecordParameter>} {@link UpdateRecordParameter}
     * @returns {object|Promise<void>} Either an array of matching documents/error object
     */
    async updateRecords({ conditions, data }) {
        try {
            const dataToSet = Controller.deleteRecordMetadata(data);
            const result = await this.model.updateMany(
                { ...conditions },
                {
                    ...dataToSet,
                    $currentDate: { updatedOn: true },
                }
            );

            return Controller.jsonize({ ...result, data });
        } catch (e) {
            return Controller.processError(e);
        }
    }

    /**
     *
     * Utilizes mongoose updateMany query method which updates
     * all documents that match filter with the update in mongodb.
     * This changes the isDeleted flag to true and the isActive
     *  flag to false in the matching documents instance.
     * @async
     * @method
     * @param {object} conditions destructured object parameter used to
     * filter the database to update matching documents
     * @returns {object|Promise<void>} Either instance of the mongodb update method response/error
     */
    async deleteRecords({ conditions }) {
        try {
            const result = await this.model.updateMany(
                { ...conditions },
                {
                    isActive: false,
                    isDeleted: true,
                    $currentDate: { updatedOn: true },
                }
            );

            return Controller.jsonize(result);
        } catch (e) {
            return Controller.processError(e);
        }
    }
}

module.exports = Controller;
