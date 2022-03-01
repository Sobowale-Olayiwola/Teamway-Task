const { NODE_ENV } = process.env;

const sinon = require('sinon');
const { expect } = require('chai');
const MockDate = require('mockdate');

const {
    CustomControllerError,
    CustomValidationError,
} = require('../../../src/utilities/customErrors');
const Controller = require('../../controller/index.test');
const UserService = require('../../../src/services/user/user');
const { createSchema, updateSchema, loginSchema } = require('../../../src/validators/user');

describe('Tests UserService', () => {
    let userService = null;
    let next = null;

    beforeEach(() => {
        global.UserController = { ...Controller };
        global.CustomControllerError = CustomControllerError;
        global.CustomValidationError = CustomValidationError;
        global.hashObject = sinon.spy((object) => 'yryrt3647648HFHJE&%^@%%@jdhfh');
        global.generateToken = sinon.spy((payload) => 'tdyfhyhfdh356784949i39fhjfhyr7hf');
        global.verifyDevelopmentEnvironment = NODE_ENV === 'development' ? true : false;
        next = sinon.spy((e) => e);
    });

    afterEach(() => {
        global.UserController = null;
        userService = null;
        next = null;
    });

    describe('UserService.createRecord', () => {
        it('throws an error when body is empty', async () => {
            userService = new UserService();
            await userService.createRecord({ request: { body: {} }, next });
            next.called;
        });

        it('Joi validator throws error for invalid data', async () => {
            const body = { id: 1 };

            const validationError = { error: { details: [{ message: 'validation error' }] } };
            sinon.stub(createSchema, 'validate').returns(validationError);

            userService = new UserService();
            await userService.createRecord({ request: { body }, next });
            next.called;
            createSchema.validate.restore();
        });

        it('handles Error from Controller', async () => {
            const body = { id: 2, any: 'String' };

            global.UserController = {
                ...UserController,
                createRecord: sinon.spy(() => ({ failed: true, error: 'Just a random error' })),
            };

            sinon.stub(createSchema, 'validate').returns({});

            userService = new UserService();
            await userService.createRecord({ request: { body }, next });
            next.called;
            createSchema.validate.restore();
        });

        it('create record for valid data', async () => {
            const body = { id: 1, any: 'String' };

            global.UserController = {
                ...UserController,
                createRecord: sinon.spy(() => ({ ...body, _id: '1sampleCompany2345' })),
            };

            sinon.stub(createSchema, 'validate').returns({});

            userService = new UserService();
            const success = await userService.createRecord({ request: { body }, next });
            expect(success).to.have.ownProperty('payload').to.not.be.null;
            createSchema.validate.restore();
        });
    });

    describe('UserService.startShift', () => {
        it('throws an error from Controller for failed response', async () => {
            global.UserController = {
                ...UserController,
                readRecords: sinon.spy(() => ({ failed: true })),
            };
            const body = { email: 'user@example.com', password: 'password' };
            userService = new UserService();
            await userService.startShift({
                request: { body },
                next,
            });
            next.called;
        });
        it('throws an error when user shift time has passed on the same day', async () => {
            MockDate.set(new Date('2022-03-01T14:24:24.094Z'));
            global.UserController = {
                ...UserController,
                readRecords: sinon.spy(() => [
                    {
                        _id: '621e113753a738d863207862',
                        id: 1,
                        isActive: true,
                        isDeleted: false,
                        firstName: 'Olayiwola',
                        lastName: 'Sobowale',
                        email: 'user@example.com',
                        password: '$2b$10$3jDVvyW5/u6B5dld2idTH.Bt.f3s4AjqiNNz0YrNfiRi80Tt8hclW',
                        timeStamp: 1646137655031,
                        createdOn: '2022-03-01T12:27:35.031Z',
                        updatedOn: '2022-03-01T15:05:57.312Z',
                        __v: 0,
                        shiftEndTime: 8,
                        shiftStartDate: '2022-03-01T14:24:24.094Z',
                        shiftStartTime: 0,
                    },
                ]),
            };
            const body = { email: 'user@example.com' };
            userService = new UserService();
            await userService.startShift({
                request: { body },
                next,
            });
            //expect(error.message).to.be.eq(`Shift for today held within 0-8 hours`);
            next.called;
            MockDate.reset();
        });
        it('throws an error when user shift time is still within possible range on the same day', async () => {
            MockDate.set(new Date('2022-03-01T15:05:57.303Z'));
            global.UserController = {
                ...UserController,
                readRecords: sinon.spy(() => [
                    {
                        _id: '621e113753a738d863207862',
                        id: 1,
                        isActive: true,
                        isDeleted: false,
                        firstName: 'Olayiwola',
                        lastName: 'Sobowale',
                        email: 'kelvin@gmail.com',
                        password: '$2b$10$3jDVvyW5/u6B5dld2idTH.Bt.f3s4AjqiNNz0YrNfiRi80Tt8hclW',
                        timeStamp: 1646137655031,
                        createdOn: '2022-03-01T12:27:35.031Z',
                        updatedOn: '2022-03-01T15:05:57.312Z',
                        __v: 0,
                        shiftEndTime: 24,
                        shiftStartDate: '2022-03-01T15:05:57.303Z',
                        shiftStartTime: 16,
                    },
                ]),
            };
            const body = { email: 'user@example.com' };
            userService = new UserService();
            await userService.startShift({
                request: { body },
                next,
            });
            next.called;
            MockDate.reset();
        });
        it('throws an error when time is midnight and user shift time is still within possible range on the same day', async () => {
            MockDate.set(new Date('2022-03-01T00:00:00.000Z'));
            global.UserController = {
                ...UserController,
                readRecords: sinon.spy(() => [
                    {
                        _id: '621e113753a738d863207862',
                        id: 1,
                        isActive: true,
                        isDeleted: false,
                        firstName: 'Olayiwola',
                        lastName: 'Sobowale',
                        email: 'user@example.com',
                        password: '$2b$10$3jDVvyW5/u6B5dld2idTH.Bt.f3s4AjqiNNz0YrNfiRi80Tt8hclW',
                        timeStamp: 1646137655031,
                        createdOn: '2022-03-01T12:27:35.031Z',
                        updatedOn: '2022-03-01T15:05:57.312Z',
                        __v: 0,
                        shiftEndTime: 24,
                        shiftStartDate: '2022-03-01T15:05:57.303Z',
                        shiftStartTime: 16,
                    },
                ]),
            };
            const body = { email: 'user@example.com' };
            userService = new UserService();
            await userService.startShift({
                request: { body },
                next,
            });
            next.called;
            MockDate.reset();
        });
        it('throws an error when shift time is not within specified range format when creating new shift', async () => {
            MockDate.set(new Date('2022-04-02T15:05:57.303Z'));
            global.UserController = {
                ...UserController,
                readRecords: sinon.spy(() => [
                    {
                        _id: '621e113753a738d863207862',
                        id: 1,
                        isActive: true,
                        isDeleted: false,
                        firstName: 'Olayiwola',
                        lastName: 'Sobowale',
                        email: 'kelvin@gmail.com',
                        password: '$2b$10$3jDVvyW5/u6B5dld2idTH.Bt.f3s4AjqiNNz0YrNfiRi80Tt8hclW',
                        timeStamp: 1646137655031,
                        createdOn: '2022-03-01T12:27:35.031Z',
                        updatedOn: '2022-03-01T15:05:57.312Z',
                        __v: 0,
                        shiftEndTime: 24,
                        shiftStartDate: '2022-03-01T15:05:57.303Z',
                        shiftStartTime: 16,
                    },
                ]),
            };
            const body = { shiftHours: '3-9' };
            userService = new UserService();
            await userService.startShift({
                request: { body },
                next,
            });
            next.called;
            MockDate.reset();
        });
        it('throws an error while creating shift due to error from controller', async () => {
            MockDate.set(new Date('2022-04-02T15:05:57.303Z'));
            global.UserController = {
                ...UserController,
                readRecords: sinon.spy(() => [
                    {
                        _id: '621e113753a738d863207862',
                        id: 1,
                        isActive: true,
                        isDeleted: false,
                        firstName: 'Olayiwola',
                        lastName: 'Sobowale',
                        email: 'kelvin@gmail.com',
                        password: '$2b$10$3jDVvyW5/u6B5dld2idTH.Bt.f3s4AjqiNNz0YrNfiRi80Tt8hclW',
                        timeStamp: 1646137655031,
                        createdOn: '2022-03-01T12:27:35.031Z',
                        updatedOn: '2022-03-01T15:05:57.312Z',
                        __v: 0,
                        shiftEndTime: 24,
                        shiftStartDate: '2022-03-01T15:05:57.303Z',
                        shiftStartTime: 16,
                    },
                ]),
                updateRecords: sinon.spy(() => ({ failed: true, error: 'Just a random error' })),
            };
            const body = { shiftHours: '0-8' };
            userService = new UserService();
            await userService.startShift({
                request: { body },
                next,
            });
            next.called;
            MockDate.reset();
        });

        it('correctly creates shift for a user', async () => {
            MockDate.set(new Date('2022-04-02T15:05:57.303Z'));
            global.UserController = {
                ...UserController,
                readRecords: sinon.spy(() => [
                    {
                        _id: '621e113753a738d863207862',
                        id: 1,
                        isActive: true,
                        isDeleted: false,
                        firstName: 'Olayiwola',
                        lastName: 'Sobowale',
                        email: 'kelvin@gmail.com',
                        password: '$2b$10$3jDVvyW5/u6B5dld2idTH.Bt.f3s4AjqiNNz0YrNfiRi80Tt8hclW',
                        timeStamp: 1646137655031,
                        createdOn: '2022-03-01T12:27:35.031Z',
                        updatedOn: '2022-03-01T15:05:57.312Z',
                        __v: 0,
                        shiftEndTime: 24,
                        shiftStartDate: '2022-03-01T15:05:57.303Z',
                        shiftStartTime: 16,
                    },
                ]),
                updateRecords: sinon.spy(() => ({
                    ok: 1,
                    acknowledged: true,
                    modifiedCount: 1,
                    nModified: 1,
                })),
            };
            const body = { shiftHours: '0-8' };
            userService = new UserService();
            await userService.startShift({
                request: { body },
                next,
            });
            next.called;
            MockDate.reset();
        });
        it('throws an controller error when creating shift for a user that does not have history of shift', async () => {
            MockDate.set(new Date('2022-04-02T15:05:57.303Z'));
            global.UserController = {
                ...UserController,
                readRecords: sinon.spy(() => [
                    {
                        _id: '621e113753a738d863207862',
                        id: 1,
                        isActive: true,
                        isDeleted: false,
                        firstName: 'Olayiwola',
                        lastName: 'Sobowale',
                        email: 'kelvin@gmail.com',
                        password: '$2b$10$3jDVvyW5/u6B5dld2idTH.Bt.f3s4AjqiNNz0YrNfiRi80Tt8hclW',
                        timeStamp: 1646137655031,
                        createdOn: '2022-03-01T12:27:35.031Z',
                        updatedOn: '2022-03-01T15:05:57.312Z',
                        __v: 0,
                        shiftEndTime: 24,
                        shiftStartDate: '',
                        shiftStartTime: 16,
                    },
                ]),
                updateRecords: sinon.spy(() => ({
                    failed: true,
                    error: 'Just a random error',
                })),
            };
            const body = { shiftHours: '16-24' };
            userService = new UserService();
            await userService.startShift({
                request: { body },
                next,
            });
            next.called;
            MockDate.reset();
        });
        it('correctly creates shift for a user that does not have history of shift', async () => {
            MockDate.set(new Date('2022-04-02T15:05:57.303Z'));
            global.UserController = {
                ...UserController,
                readRecords: sinon.spy(() => [
                    {
                        _id: '621e113753a738d863207862',
                        id: 1,
                        isActive: true,
                        isDeleted: false,
                        firstName: 'Olayiwola',
                        lastName: 'Sobowale',
                        email: 'kelvin@gmail.com',
                        password: '$2b$10$3jDVvyW5/u6B5dld2idTH.Bt.f3s4AjqiNNz0YrNfiRi80Tt8hclW',
                        timeStamp: 1646137655031,
                        createdOn: '2022-03-01T12:27:35.031Z',
                        updatedOn: '2022-03-01T15:05:57.312Z',
                        __v: 0,
                        shiftEndTime: 24,
                        shiftStartDate: '',
                        shiftStartTime: 16,
                    },
                ]),
                updateRecords: sinon.spy(() => ({
                    ok: 1,
                    acknowledged: true,
                    modifiedCount: 1,
                    nModified: 1,
                })),
            };
            const body = { shiftHours: '16-24' };
            userService = new UserService();
            await userService.startShift({
                request: { body },
                next,
            });
            next.called;
            MockDate.reset();
        });
    });

    describe('UserService.login', () => {
        it('throws an error when body options is empty', async () => {
            userService = new UserService();
            const validationError = { error: { details: [{ message: 'validation error' }] } };
            await userService.loginUser({ request: { body: {} }, next });
            sinon.stub(loginSchema, 'validate').returns(validationError);

            next.called;
            loginSchema.validate.restore();
        });

        it('throws an error from Controller for failed response', async () => {
            global.UserController = {
                ...UserController,
                readRecords: sinon.spy(() => ({ failed: true })),
            };
            const body = { email: 'user@example.com', password: 'password' };
            userService = new UserService();
            await userService.loginUser({
                request: { body },
                next,
            });
            next.called;
        });

        it('throws an error when user cannot be found', async () => {
            global.UserController = {
                ...UserController,
                readRecords: sinon.spy(() => []),
            };
            const body = { email: 'user@example.com', password: 'password' };
            userService = new UserService();
            await userService.loginUser({
                request: { body },
                next,
            });
            next.called;
        });

        it('throws an error for invalid email or password', async () => {
            global.verifyObject = sinon.spy((object) => false);
            global.UserController = {
                ...UserController,
                readRecords: sinon.spy(() => [
                    { isValued: true, isActive: true },
                    { isValued: true, isActive: true },
                ]),
            };
            const body = { email: 'user@example.com', password: 'password' };
            userService = new UserService();
            await userService.loginUser({
                request: { body },
                next,
            });
            next.called;
        });

        it('successfully logs a user', async () => {
            global.verifyObject = sinon.spy((object) => true);
            global.UserController = {
                ...UserController,
                readRecords: sinon.spy(() => [
                    {
                        id: 1,
                        firstName: 'Ola',
                        lastName: 'Sobowale',
                        email: 'sinclayi@gmail.com',
                    },
                ]),
            };
            const body = { email: 'user@example.com', password: 'password' };
            userService = new UserService();
            const result = await userService.loginUser({
                request: { body },
                next,
            });
            expect(result).to.have.ownProperty('payload').to.not.be.null;
            expect(result.payload).to.have.ownProperty('token').to.not.be.null;
        });
    });

    describe('UserService.readRecords', () => {
        it('handles Error from Controller', async () => {
            global.UserController = {
                ...UserController,
                readRecords: sinon.spy(() => ({ failed: true, error: 'Just a random error' })),
            };

            userService = new UserService();
            await userService.readRecords({ next });
            next.called;
        });

        it('get all records', async () => {
            global.UserController = {
                ...UserController,
                readRecords: sinon.spy(() => [
                    { isValued: true, isActive: true },
                    { isValued: true, isActive: true },
                ]),
            };

            userService = new UserService();
            const success = await userService.readRecords({ next });
            expect(success).to.have.ownProperty('payload').to.not.be.null;
        });
    });

    describe('UserService.readRecordById', () => {
        it('throws an error when id is not specified', async () => {
            userService = new UserService();
            await userService.readRecordById({ request: { params: {} }, next });
            next.called;
        });

        it('handles Error from Controller', async () => {
            const params = { id: 2 };

            global.UserController = {
                ...UserController,
                readRecords: sinon.spy(() => ({ failed: true, error: 'Just a random error' })),
            };

            userService = new UserService();
            await userService.readRecordById({ request: { params }, next });
            next.called;
        });

        it('get a record for valid id', async () => {
            const params = { id: 2 };

            global.UserController = {
                ...UserController,
                readRecords: sinon.spy(() => [{ ...params, is_active: true }]),
            };

            userService = new UserService();
            const success = await userService.readRecordById({ request: { params }, next });
            expect(success).to.have.ownProperty('payload').to.not.be.null;
        });
    });

    describe('UserService.readRecordsByFilter', () => {
        it('throws an error when query object is empty', async () => {
            userService = new UserService();
            await userService.readRecordsByFilter({ request: { query: {} }, next });
            next.called;
        });

        it('handles Error from Controller', async () => {
            const query = { id: 'Two Hundred and Seven' };

            global.UserController = {
                ...UserController,
                readRecords: sinon.spy(() => ({ failed: true, error: 'Just a random error' })),
            };

            userService = new UserService();
            await userService.readRecordsByFilter({ request: { query }, next });
            next.called;
        });

        it('get record for valid query', async () => {
            const query = { id: 'Two Hundred and Seven' };

            global.UserController = {
                ...UserController,
                readRecords: sinon.spy(() => [{ ...query, is_active: true }]),
            };

            userService = new UserService();
            const success = await userService.readRecordsByFilter({ request: { query }, next });
            expect(success).to.have.ownProperty('payload').to.not.be.null;
        });
    });

    describe('UserService.readRecordsByWildcard', () => {
        it('throws an error when no query/params', async () => {
            userService = new UserService();
            await userService.readRecordsByWildcard({ request: {}, next });
            next.called;
        });

        it('throws an error when no params.keys is a falsy value', async () => {
            const query = { id: 'Two Hundred and Seven' };
            const params = { key: null };
            userService = new UserService();
            await userService.readRecordsByWildcard({ request: { params, query }, next });
            next.called;
        });

        it('throws an error when params object is empty', async () => {
            userService = new UserService();
            await userService.readRecordsByWildcard({ request: { params: {}, query: {} }, next });
            next.called;
        });

        it('throws an error when query object is empty', async () => {
            const params = { keys: 'String, Same, Strata', keyword: 'Value' };

            userService = new UserService();
            await userService.readRecordsByWildcard({ request: { params, query: {} }, next });
            next.called;
        });

        it('handles Error from Controller', async () => {
            const params = { keys: 'String, Same, Strata', keyword: 'Value' };
            const query = { id: 'Two Hundred and Seven' };

            global.UserController = {
                ...UserController,
                readRecords: sinon.spy(() => ({ failed: true, error: 'Just a random error' })),
            };

            userService = new UserService();
            await userService.readRecordsByWildcard({ request: { query, params }, next });
            next.called;
        });

        it('get record for valid query', async () => {
            const params = { keys: 'String, Same, Strata', keyword: 'Value' };
            const query = { id: 'Two Hundred and Seven' };

            global.UserController = {
                ...UserController,
                readRecords: sinon.spy(() => [{ ...query, is_active: true }]),
            };

            userService = new UserService();
            const success = await userService.readRecordsByWildcard({
                request: { query, params },
                next,
            });
            expect(success).to.have.ownProperty('payload').to.not.be.null;
        });
    });

    describe('UserService.updateRecordById', () => {
        it('throws an error when param ID is not specified', async () => {
            userService = new UserService();
            await userService.updateRecordById({ request: { params: {} }, next });
            next.called;
        });

        it('throws an error when body is empty', async () => {
            userService = new UserService();
            await userService.updateRecordById({
                request: { params: { id: 87 }, body: {} },
                next,
            });
            next.called;
        });

        it('Joi validator throws error for invalid body schema', async () => {
            const body = { id: 1 };
            const params = { id: 87 };

            const validationError = { error: { details: [{ message: 'validation error' }] } };
            sinon.stub(updateSchema, 'validate').returns(validationError);

            userService = new UserService();
            await userService.updateRecordById({ request: { params, body }, next });
            next.called;
            updateSchema.validate.restore();
        });

        it('handles Error from Controller', async () => {
            const body = { any: 'String' };
            const params = { id: 3 };

            global.UserController = {
                ...UserController,
                updateRecords: sinon.spy(() => ({ failed: true, error: 'Just a random error' })),
            };

            sinon.stub(updateSchema, 'validate').returns({});

            userService = new UserService();
            await userService.updateRecordById({ request: { params, body }, next });
            next.called;
            updateSchema.validate.restore();
        });

        it('updates a record', async () => {
            const body = { any: 'String' };
            const params = { id: 3 };

            global.UserController = {
                ...UserController,
                updateRecords: sinon.spy(() => ({
                    ...body,
                    ...params,
                    _id: '1samplecompany2345',
                    is_active: true,
                    ok: 1,
                    nModified: 1,
                })),
            };

            sinon.stub(updateSchema, 'validate').returns({});

            userService = new UserService();
            const success = await userService.updateRecordById({
                request: { params, body },
                next,
            });
            expect(success).to.have.ownProperty('payload').to.not.be.null;
            updateSchema.validate.restore();
        });
    });

    describe('UserService.updateRecords', () => {
        it('throws an error when options/data does not exist', async () => {
            userService = new UserService();
            await userService.updateRecords({ request: { body: {} }, next });
            next.called;
        });

        it('throws an error when options is empty', async () => {
            const body = { options: {}, data: {} };
            userService = new UserService();
            await userService.updateRecords({ request: { body }, next });
            next.called;
        });

        it('throws an error when data is empty', async () => {
            const body = { options: { any: 'String' }, data: {} };
            userService = new UserService();
            await userService.updateRecords({ request: { body }, next });
            next.called;
        });

        it('handles Error from Controller', async () => {
            const body = { options: { any: 'String' }, data: { any: 'String' } };

            global.UserController = {
                ...UserController,
                updateRecords: sinon.spy(() => ({ failed: true, error: 'Just a random error' })),
            };

            userService = new UserService();
            await userService.updateRecords({ request: { body }, next });
            next.called;
        });

        it('updates records', async () => {
            const body = { options: { any: 'String' }, data: { any: 'String' } };

            global.UserController = {
                ...UserController,
                updateRecords: sinon.spy(() => ({
                    ...body,
                    id: 1,
                    _id: '1sampleCompany2345',
                    is_active: true,
                    ok: 1,
                    nModified: 1,
                })),
            };

            userService = new UserService();
            const success = await userService.updateRecords({ request: { body }, next });
            expect(success).to.have.ownProperty('payload').to.not.be.null;
        });
    });

    describe('UserService.deleteRecordById', () => {
        it('throws error when id is not specified', async () => {
            userService = new UserService();
            await userService.deleteRecordById({ request: { params: {} }, next });
            next.called;
        });

        it('handles Error from Controller', async () => {
            global.UserController = {
                ...UserController,
                deleteRecords: sinon.spy(() => ({ failed: true, error: 'Just a random error' })),
            };

            userService = new UserService();
            await userService.deleteRecordById({ request: { params: { id: 2 } }, next });
            next.called;
        });

        it('delete a record for valid a id', async () => {
            const params = { id: 2 };

            global.UserController = {
                ...UserController,
                deleteRecords: sinon.spy(() => ({
                    ok: 1,
                    acknowledged: true,
                    modifiedCount: 1,
                    nModified: 1,
                })),
            };

            userService = new UserService();
            const success = await userService.deleteRecordById({ request: { params }, next });
            expect(success).to.have.ownProperty('payload').to.not.be.null;
        });
    });

    describe('UserService.deleteRecords', () => {
        it('throws an error when body options is empty', async () => {
            userService = new UserService();
            await userService.deleteRecords({ request: { body: { options: {} } }, next });
            next.called;
        });

        it('handles Error from Controller', async () => {
            const body = { options: { any: 'String' } };
            global.UserController = {
                ...UserController,
                deleteRecords: sinon.spy(() => ({ failed: true, error: 'Just a random error' })),
            };

            userService = new UserService();
            await userService.deleteRecords({
                request: { body },
                next,
            });
            next.called;
        });

        it('deletes records', async () => {
            const body = { options: { any: 'String' } };
            global.UserController = {
                ...UserController,
                deleteRecords: sinon.spy(() => ({
                    ok: 1,
                    acknowledged: true,
                    modifiedCount: 4,
                    nModified: 4,
                })),
            };
            userService = new UserService();
            const success = await userService.deleteRecords({ request: { body }, next });
            expect(success).to.have.ownProperty('payload').to.not.be.null;
        });
    });
});
