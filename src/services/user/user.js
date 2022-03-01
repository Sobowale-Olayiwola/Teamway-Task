/**
 *
 * This handles the business logic for the User Model
 * @module SERVICE:User
 */

const RootService = require('../_root');
const { buildQuery, buildWildcardOptions } = require('../../utilities/query');
const { createSchema, updateSchema, loginSchema, shiftSchema } = require('../../validators/user');

/**
 *
 * This is the integration of the User model routes
 *  with the User model controller bridging by holding core business logic.
 * @class
 */
class UserService extends RootService {
    constructor() {
        super();
        this.userController = UserController;
        this.serviceName = 'UserService';
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
            body.password = await hashObject(body.password);
            const result = await this.userController.createRecord({ ...body });
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

    async loginUser({ request, next }) {
        try {
            const { body } = request;
            const { error } = loginSchema.validate(body);
            if (error) throw new CustomValidationError(this.filterJOIValidation(error.message));

            const user = await this.userController.readRecords({
                conditions: { email: body.email, isActive: true },
            });
            if (user && user.failed) throw new CustomControllerError(user.error);
            if (Array.isArray(user) && !user.length) throw new Error('User does not exist.');

            const correctPassword = await verifyObject({
                sentObject: body.password,
                accurateObject: user[0].password,
            });
            if (!correctPassword) throw new Error('Incorrect Email or Password combination.');
            const payload = {
                userId: user[0].id,
            };
            const token = await generateToken({ payload });
            user[0]['token'] = token;
            return this.processSingleRead(user[0]);
        } catch (e) {
            let processedError = this.formatError({
                service: this.serviceName,
                error: e,
                functionName: 'loginUser',
            });

            return next(processedError);
        }
    }
    getShiftHoursAndDate(body) {
        const { error } = shiftSchema.validate(body);
        if (error) throw new CustomValidationError(this.filterJOIValidation(error.message));
        const { shiftHours } = body;
        let range = shiftHours.split('-');
        const shiftStartTime = range[0];
        const shiftEndTime = range[1];
        const shiftStartDate = new Date();
        return {
            shiftEndTime,
            shiftStartTime,
            shiftStartDate,
        };
    }
    /**
     * This method is an implementation to handle the business logic
     *  of creating shift period for a particular user.
     * This should be used alongside a PUT Request alone.
     * @async
     * @method
     * @param {RequestFunctionParameter} {@link RequestFunctionParameter}
     * @returns {object<processSingleRead|processedError>}
     */
    async startShift({ request, next }) {
        try {
            const filter = { conditions: { id: request.userId } };
            const user = await this.userController.readRecords(filter);
            if (user && user.failed) throw new CustomControllerError(user.error);
            if (user[0].shiftStartDate) {
                const shiftStartDate = new Date(`${user[0].shiftStartDate}`);
                const today = new Date();
                if (
                    shiftStartDate.getDate() === today.getDate() &&
                    today.getHours() !== 0 &&
                    user[0].shiftEndTime < today.getHours()
                ) {
                    throw new Error(
                        `Shift for today held within ${user[0].shiftStartTime}-${user[0].shiftEndTime} hours`
                    );
                } else if (
                    shiftStartDate.getDate() === today.getDate() &&
                    today.getHours() !== 0 &&
                    user[0].shiftEndTime > today.getHours()
                ) {
                    throw new Error(
                        `Shift for today is within ${user[0].shiftStartTime}-${user[0].shiftEndTime} hours`
                    );
                } else if (
                    shiftStartDate.getDate() === today.getDate() &&
                    today.getHours() === 0 &&
                    user[0].shiftEndTime > today.getHours()
                ) {
                    throw new Error(
                        `Shift for today is within ${user[0].shiftStartTime}-${user[0].shiftEndTime} hours`
                    );
                } else {
                    const { shiftEndTime, shiftStartTime, shiftStartDate } =
                        this.getShiftHoursAndDate(request.body);
                    const result = await this.userController.updateRecords({
                        conditions: { id: request.userId, isActive: true, isDeleted: false },
                        data: { shiftEndTime, shiftStartTime, shiftStartDate },
                    });
                    if (result && result.failed) throw new CustomControllerError(result.error);

                    return this.processUpdateResult({ result });
                }
            } else {
                const { shiftEndTime, shiftStartTime, shiftStartDate } = this.getShiftHoursAndDate(
                    request.body
                );
                const result = await this.userController.updateRecords({
                    conditions: { id: request.userId },
                    data: { shiftEndTime, shiftStartTime, shiftStartDate },
                });
                if (result && result.failed) throw new CustomControllerError(result.error);

                return this.processUpdateResult({ result });
            }
        } catch (e) {
            const processedError = this.formatError({
                service: this.serviceName,
                error: e,
                functionName: 'startShift',
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
            const filter = { conditions: { isActive: true, isDeleted: false } };
            const result = await this.userController.readRecords(filter);
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
            const filter = { conditions: { id, isActive: true, isDeleted: false } };
            const result = await this.userController.readRecords(filter);
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
                Controller: this.userController,
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
                Controller: this.userController,
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
            body.password ? hashObject(body.password) : body;
            const result = await this.userController.updateRecords({
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

            const result = await this.userController.updateRecords({
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

            const result = await this.userController.deleteRecords({ conditions: { id } });
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

            const result = await this.userController.deleteRecords({ ...seekConditions });
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

module.exports = UserService;
