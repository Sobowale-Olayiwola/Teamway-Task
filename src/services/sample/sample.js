/**
 *
 * This handles the business logic for the Sample Model
 * @module SERVICE:Sample
 */

const RootService = require('../_root');
const { buildQuery, buildWildcardOptions } = require('../../utilities/query');
const { createSchema, updateSchema } = require('../../validators/sample');

/**
 *
 * This is the integration of the Sample model routes
 *  with the Sample model controller bridging by holding core business logic.
 * @class
 */
class SampleService extends RootService {
    constructor() {
        super();
        this.sampleController = SampleController;
        this.serviceName = 'SampleService';
    }

    /**
     *
     * @typedef RequestFunctionParameter
     * @property {object} request Express Request parameter
     * @property {function} next Express NextFunction parameter
     */

    /**
     *
     * This method is an implementation to handle the
     *  business logic of Creating and saving new records into the database.
     * This should be used alongside a POST Request alone.
     * @async
     * @method
     * @param {RequestFunctionParameter} {@link RequestFunctionParameter}
     * @returns {object<processSingleRead|processedError>}
     */
    async createRecord({ request, next }) {
        try {
            const { body } = request;

            const { error } = createSchema.validate(body);
            if (error) throw new CustomValidationError(this.filterJOIValidation(error.message));

            const result = await this.sampleController.createRecord({ ...body });
            if (result && result.failed) throw new CustomControllerError(result.error);
            return this.processSingleRead(result);
        } catch (e) {
            const processedError = this.formatError({
                service: this.serviceName,
                error: e,
                functionName: 'createRecord',
            });

            return next(processedError);
        }
    }

    /**
     * This method is an implementation to handle the business logic
     *  of Reading existing records from the database without filter.
     * This should be used alongside a GET Request alone.
     * @async
     * @method
     * @param {RequestFunctionParameter} {@link RequestFunctionParameter}
     * @returns {object<processSingleRead|processedError>}
     */
    async readRecords({ next }) {
        try {
            const filter = { conditions: {} };
            const result = await this.sampleController.readRecords(filter);
            if (result && result.failed) throw new CustomControllerError(result.error);

            return this.processMultipleReadResults(result);
        } catch (e) {
            const processedError = this.formatError({
                service: this.serviceName,
                error: e,
                functionName: 'readRecordsByFilter',
            });

            return next(processedError);
        }
    }

    /**
     * This method is an implementation to handle the business logic
     * of Reading an existing records from the database by ID.
     * This should be used alongside a GET Request alone.
     * @async
     * @method
     * @param {RequestFunctionParameter} {@link RequestFunctionParameter}
     * @returns {object<processSingleRead|processedError>}
     */
    async readRecordById({ request, next }) {
        try {
            const { id } = request.params;
            if (!id) throw new CustomValidationError('Invalid ID supplied.');
            const filter = { conditions: { id, isActive: true } };
            const result = await this.sampleController.readRecords(filter);
            if (result && result.failed) throw new CustomControllerError(result.error);

            return this.processSingleRead(result[0]);
        } catch (e) {
            const processedError = this.formatError({
                service: this.serviceName,
                error: e,
                functionName: 'readRecordById',
            });

            return next(processedError);
        }
    }

    /**
     * This method is an implementation to handle the business logic
     * of Reading existing records from the database by a query filter.
     * This should be used alongside a GET Request alone.
     * @async
     * @method
     * @param {RequestFunctionParameter} {@link RequestFunctionParameter}
     * @returns {object<processSingleRead|processedError>}
     */
    async readRecordsByFilter({ request, next }) {
        try {
            const { query } = request;
            if (Object.keys(query).length === 0) {
                throw new CustomValidationError('Query is required to filter.');
            }

            const result = await this.handleDatabaseRead({
                Controller: this.sampleController,
                queryOptions: query,
            });
            if (result && result.failed) throw new CustomControllerError(result.error);

            return this.processMultipleReadResults(result);
        } catch (e) {
            const processedError = this.formatError({
                service: this.serviceName,
                error: e,
                functionName: 'readRecordsByFilter',
            });

            return next(processedError);
        }
    }

    /**
     * This method is an implementation to handle the business logic of
     * Reading existing records from the database by a wildcard query built using the Query utility.
     * This should be used alongside a GET Request alone.
     * @async
     * @method
     * @param {RequestFunctionParameter} {@link RequestFunctionParameter}
     * @returns {object<processSingleRead|processedError>}
     */
    async readRecordsByWildcard({ request, next }) {
        try {
            const { params, query } = request;
            if (Object.keys(params).length === 0) {
                throw new CustomValidationError('Keys are required to read');
            }
            if (Object.keys(query).length === 0) {
                throw new CustomValidationError('Keywords are required to read');
            }
            if (!params.keys || !params.keyword) {
                throw new CustomValidationError('Invalid key/keyword');
            }
            const wildcardConditions = buildWildcardOptions(params.keys, params.keyword);
            const result = await this.handleDatabaseRead({
                Controller: this.sampleController,
                queryOptions: query,
                extraOptions: wildcardConditions,
            });
            if (result && result.failed) throw new CustomControllerError(result.error);

            return this.processMultipleReadResults(result);
        } catch (e) {
            const processedError = this.formatError({
                service: this.serviceName,
                error: e,
                functionName: 'readRecordsByWildcard',
            });

            return next(processedError);
        }
    }
    /**
     * This method is an implementation to handle the business
     * logic of updating an existing records by ID.
     * This should be used alongside a PUT Request alone.
     * @async
     * @method
     * @param {RequestFunctionParameter} {@link RequestFunctionParameter}
     * @returns {object<processSingleRead|processedError>}
     */

    async updateRecordById({ request, next }) {
        try {
            const { params, body } = request;
            const { id } = params;

            if (!id) throw new CustomValidationError('Invalid ID supplied.');
            if (Object.keys(body).length === 0) {
                throw new CustomValidationError('Update requires a field.');
            }
            const { error } = updateSchema.validate(body);
            if (error) throw new CustomValidationError(this.filterJOIValidation(error.message));

            const result = await this.sampleController.updateRecords({
                conditions: { id, isActive: true, isDeleted: false },
                data: body,
            });
            if (result && result.failed) throw new CustomControllerError(result.error);

            return this.processUpdateResult({ result });
        } catch (e) {
            const processedError = this.formatError({
                service: this.serviceName,
                error: e,
                functionName: 'updateRecordById',
            });

            return next(processedError);
        }
    }

    /**
     * This method is an implementation to handle the business logic of
     * updating multiple existing records.
     * This should be used alongside a PUT Request alone.
     * @async
     * @method
     * @param {RequestFunctionParameter} {@link RequestFunctionParameter}
     * @returns {object<processSingleRead|processedError>}
     */
    async updateRecords({ request, next }) {
        try {
            const { options, data } = request.body;
            if (!options || !data) throw new CustomValidationError('Invalid options/data');
            if (Object.keys(options).length === 0) {
                throw new CustomValidationError('Options are required to update');
            }
            if (Object.keys(data).length === 0) {
                throw new CustomValidationError('Data is required to update');
            }

            const { seekConditions } = buildQuery(options);

            const result = await this.sampleController.updateRecords({
                conditions: { ...seekConditions },
                data: { ...data },
            });
            if (result && result.failed) throw new CustomControllerError(result.error);

            return this.processUpdateResult({ result });
        } catch (e) {
            const processedError = this.formatError({
                service: this.serviceName,
                error: e,
                functionName: 'updateRecords',
            });

            return next(processedError);
        }
    }

    /**
     * This method is an implementation to handle the business logic
     * of deleting an existing records by ID.
     * This should be used alongside a DELETE Request alone.
     * @async
     * @method
     * @param {RequestFunctionParameter} {@link RequestFunctionParameter}
     * @returns {object<processSingleRead|processedError>}
     */
    async deleteRecordById({ request, next }) {
        try {
            const { id } = request.params;
            if (!id) throw new CustomValidationError('Invalid ID supplied.');

            const result = await this.sampleController.deleteRecords({ conditions: { id } });
            if (result && result.failed) throw new CustomControllerError(result.error);

            return this.processDeleteResult(result);
        } catch (e) {
            const processedError = this.formatError({
                service: this.serviceName,
                error: e,
                functionName: 'deleteRecordById',
            });

            return next(processedError);
        }
    }

    /**
     * This method is an implementation to handle
     *  the business logic of deleting multiple existing records.
     * This should be used alongside a DELETE Request alone.
     * @async
     * @method
     * @param {RequestFunctionParameter} {@link RequestFunctionParameter}
     * @returns {object<processSingleRead|processedError>}
     */
    async deleteRecords({ request, next }) {
        try {
            const { options } = request.body;
            if (Object.keys(options).length === 0) {
                throw new CustomValidationError('Options are required');
            }
            const { seekConditions } = buildQuery(options);

            const result = await this.sampleController.deleteRecords({ ...seekConditions });
            if (result && result.failed) throw new CustomControllerError(result.error);

            return this.processDeleteResult({ ...result });
        } catch (e) {
            const processedError = this.formatError({
                service: this.serviceName,
                error: e,
                functionName: 'deleteRecords',
            });

            return next(processedError);
        }
    }
}

module.exports = SampleService;
