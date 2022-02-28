const { NODE_ENV } = process.env;

const sinon = require('sinon');
const { expect } = require('chai');

const {
    CustomControllerError,
    CustomValidationError,
} = require('../../../src/utilities/customErrors');
const Controller = require('../../controller/index.test');
const SampleService = require('../../../src/services/sample/sample');
const { createSchema, updateSchema } = require('../../../src/validators/sample');

describe('Tests SampleService', () => {
    let sampleService = null;
    let next = null;

    beforeEach(() => {
        global.SampleController = { ...Controller };
        global.CustomControllerError = CustomControllerError;
        global.CustomValidationError = CustomValidationError;
        global.verifyDevelopmentEnvironment = NODE_ENV === 'development' ? true : false;
        next = sinon.spy((e) => e);
    });

    afterEach(() => {
        global.SampleController = null;
        sampleService = null;
        next = null;
    });

    describe('SampleService.createRecord', () => {
        it('throws an error when body is empty', async () => {
            sampleService = new SampleService();
            await sampleService.createRecord({ request: { body: {} }, next });
            next.called;
        });

        it('Joi validator throws error for invalid data', async () => {
            const body = { id: 1 };

            const validationError = { error: { details: [{ message: 'validation error' }] } };
            sinon.stub(createSchema, 'validate').returns(validationError);

            sampleService = new SampleService();
            await sampleService.createRecord({ request: { body }, next });
            next.called;
            createSchema.validate.restore();
        });

        it('handles Error from Controller', async () => {
            const body = { id: 2, any: 'String' };

            global.SampleController = {
                ...SampleController,
                createRecord: sinon.spy(() => ({ failed: true, error: 'Just a random error' })),
            };

            sinon.stub(createSchema, 'validate').returns({});

            sampleService = new SampleService();
            await sampleService.createRecord({ request: { body }, next });
            next.called;
            createSchema.validate.restore();
        });

        it('create record for valid data', async () => {
            const body = { id: 1, any: 'String' };

            global.SampleController = {
                ...SampleController,
                createRecord: sinon.spy(() => ({ ...body, _id: '1sampleCompany2345' })),
            };

            sinon.stub(createSchema, 'validate').returns({});

            sampleService = new SampleService();
            const success = await sampleService.createRecord({ request: { body }, next });
            expect(success).to.have.ownProperty('payload').to.not.be.null;
            createSchema.validate.restore();
        });
    });

    describe('SampleService.readRecords', () => {
        it('handles Error from Controller', async () => {
            global.SampleController = {
                ...SampleController,
                readRecords: sinon.spy(() => ({ failed: true, error: 'Just a random error' })),
            };

            sampleService = new SampleService();
            await sampleService.readRecords({ next });
            next.called;
        });

        it('get all records', async () => {
            global.SampleController = {
                ...SampleController,
                readRecords: sinon.spy(() => [
                    { isValued: true, isActive: true },
                    { isValued: true, isActive: true },
                ]),
            };

            sampleService = new SampleService();
            const success = await sampleService.readRecords({ next });
            expect(success).to.have.ownProperty('payload').to.not.be.null;
        });
    });

    describe('SampleService.readRecordById', () => {
        it('throws an error when id is not specified', async () => {
            sampleService = new SampleService();
            await sampleService.readRecordById({ request: { params: {} }, next });
            next.called;
        });

        it('handles Error from Controller', async () => {
            const params = { id: 2 };

            global.SampleController = {
                ...SampleController,
                readRecords: sinon.spy(() => ({ failed: true, error: 'Just a random error' })),
            };

            sampleService = new SampleService();
            await sampleService.readRecordById({ request: { params }, next });
            next.called;
        });

        it('get a record for valid id', async () => {
            const params = { id: 2 };

            global.SampleController = {
                ...SampleController,
                readRecords: sinon.spy(() => [{ ...params, is_active: true }]),
            };

            sampleService = new SampleService();
            const success = await sampleService.readRecordById({ request: { params }, next });
            expect(success).to.have.ownProperty('payload').to.not.be.null;
        });
    });

    describe('SampleService.readRecordsByFilter', () => {
        it('throws an error when query object is empty', async () => {
            sampleService = new SampleService();
            await sampleService.readRecordsByFilter({ request: { query: {} }, next });
            next.called;
        });

        it('handles Error from Controller', async () => {
            const query = { id: 'Two Hundred and Seven' };

            global.SampleController = {
                ...SampleController,
                readRecords: sinon.spy(() => ({ failed: true, error: 'Just a random error' })),
            };

            sampleService = new SampleService();
            await sampleService.readRecordsByFilter({ request: { query }, next });
            next.called;
        });

        it('get record for valid query', async () => {
            const query = { id: 'Two Hundred and Seven' };

            global.SampleController = {
                ...SampleController,
                readRecords: sinon.spy(() => [{ ...query, is_active: true }]),
            };

            sampleService = new SampleService();
            const success = await sampleService.readRecordsByFilter({ request: { query }, next });
            expect(success).to.have.ownProperty('payload').to.not.be.null;
        });
    });

    describe('SampleService.readRecordsByWildcard', () => {
        it('throws an error when no query/params', async () => {
            sampleService = new SampleService();
            await sampleService.readRecordsByWildcard({ request: {}, next });
            next.called;
        });

        it('throws an error when params object is empty', async () => {
            sampleService = new SampleService();
            await sampleService.readRecordsByWildcard({ request: { params: {}, query: {} }, next });
            next.called;
        });

        it('throws an error when query object is empty', async () => {
            const params = { keys: 'String, Same, Strata', keyword: 'Value' };

            sampleService = new SampleService();
            await sampleService.readRecordsByWildcard({ request: { params, query: {} }, next });
            next.called;
        });

        it('handles Error from Controller', async () => {
            const params = { keys: 'String, Same, Strata', keyword: 'Value' };
            const query = { id: 'Two Hundred and Seven' };

            global.SampleController = {
                ...SampleController,
                readRecords: sinon.spy(() => ({ failed: true, error: 'Just a random error' })),
            };

            sampleService = new SampleService();
            await sampleService.readRecordsByWildcard({ request: { query, params }, next });
            next.called;
        });

        it('get record for valid query', async () => {
            const params = { keys: 'String, Same, Strata', keyword: 'Value' };
            const query = { id: 'Two Hundred and Seven' };

            global.SampleController = {
                ...SampleController,
                readRecords: sinon.spy(() => [{ ...query, is_active: true }]),
            };

            sampleService = new SampleService();
            const success = await sampleService.readRecordsByWildcard({
                request: { query, params },
                next,
            });
            expect(success).to.have.ownProperty('payload').to.not.be.null;
        });
    });

    describe('SampleService.updateRecordById', () => {
        it('throws an error when param ID is not specified', async () => {
            sampleService = new SampleService();
            await sampleService.updateRecordById({ request: { params: {} }, next });
            next.called;
        });

        it('throws an error when body is empty', async () => {
            sampleService = new SampleService();
            await sampleService.updateRecordById({
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

            sampleService = new SampleService();
            await sampleService.updateRecordById({ request: { params, body }, next });
            next.called;
            updateSchema.validate.restore();
        });

        it('handles Error from Controller', async () => {
            const body = { any: 'String' };
            const params = { id: 3 };

            global.SampleController = {
                ...SampleController,
                updateRecords: sinon.spy(() => ({ failed: true, error: 'Just a random error' })),
            };

            sinon.stub(updateSchema, 'validate').returns({});

            sampleService = new SampleService();
            await sampleService.updateRecordById({ request: { params, body }, next });
            next.called;
            updateSchema.validate.restore();
        });

        it('updates a record', async () => {
            const body = { any: 'String' };
            const params = { id: 3 };

            global.SampleController = {
                ...SampleController,
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

            sampleService = new SampleService();
            const success = await sampleService.updateRecordById({
                request: { params, body },
                next,
            });
            expect(success).to.have.ownProperty('payload').to.not.be.null;
            updateSchema.validate.restore();
        });
    });

    describe('SampleService.updateRecords', () => {
        it('throws an error when options/data does not exist', async () => {
            sampleService = new SampleService();
            await sampleService.updateRecords({ request: { body: {} }, next });
            next.called;
        });

        it('throws an error when options is empty', async () => {
            const body = { options: {}, data: {} };
            sampleService = new SampleService();
            await sampleService.updateRecords({ request: { body }, next });
            next.called;
        });

        it('throws an error when data is empty', async () => {
            const body = { options: { any: 'String' }, data: {} };
            sampleService = new SampleService();
            await sampleService.updateRecords({ request: { body }, next });
            next.called;
        });

        it('handles Error from Controller', async () => {
            const body = { options: { any: 'String' }, data: { any: 'String' } };

            global.SampleController = {
                ...SampleController,
                updateRecords: sinon.spy(() => ({ failed: true, error: 'Just a random error' })),
            };

            sampleService = new SampleService();
            await sampleService.updateRecords({ request: { body }, next });
            next.called;
        });

        it('updates records', async () => {
            const body = { options: { any: 'String' }, data: { any: 'String' } };

            global.SampleController = {
                ...SampleController,
                updateRecords: sinon.spy(() => ({
                    ...body,
                    id: 1,
                    _id: '1sampleCompany2345',
                    is_active: true,
                    ok: 1,
                    nModified: 1,
                })),
            };

            sampleService = new SampleService();
            const success = await sampleService.updateRecords({ request: { body }, next });
            expect(success).to.have.ownProperty('payload').to.not.be.null;
        });
    });

    describe('SampleService.deleteRecordById', () => {
        it('throws error when id is not specified', async () => {
            sampleService = new SampleService();
            await sampleService.deleteRecordById({ request: { params: {} }, next });
            next.called;
        });

        it('handles Error from Controller', async () => {
            global.SampleController = {
                ...SampleController,
                deleteRecords: sinon.spy(() => ({ failed: true, error: 'Just a random error' })),
            };

            sampleService = new SampleService();
            await sampleService.deleteRecordById({ request: { params: { id: 2 } }, next });
            next.called;
        });

        it('delete a record for valid a id', async () => {
            const params = { id: 2 };

            global.SampleController = {
                ...SampleController,
                deleteRecords: sinon.spy(() => ({
                    ok: 1,
                    acknowledged: true,
                    modifiedCount: 1,
                    nModified: 1,
                })),
            };

            sampleService = new SampleService();
            const success = await sampleService.deleteRecordById({ request: { params }, next });
            expect(success).to.have.ownProperty('payload').to.not.be.null;
        });
    });

    describe('SampleService.deleteRecords', () => {
        it('throws an error when body options is empty', async () => {
            sampleService = new SampleService();
            await sampleService.deleteRecords({ request: { body: { options: {} } }, next });
            next.called;
        });

        it('handles Error from Controller', async () => {
            const body = { options: { any: 'String' } };
            global.SampleController = {
                ...SampleController,
                deleteRecords: sinon.spy(() => ({ failed: true, error: 'Just a random error' })),
            };

            sampleService = new SampleService();
            await sampleService.deleteRecords({
                request: { body },
                next,
            });
            next.called;
        });

        it('deletes records', async () => {
            const body = { options: { any: 'String' } };
            global.SampleController = {
                ...SampleController,
                deleteRecords: sinon.spy(() => ({
                    ok: 1,
                    acknowledged: true,
                    modifiedCount: 4,
                    nModified: 4,
                })),
            };
            sampleService = new SampleService();
            const success = await sampleService.deleteRecords({ request: { body }, next });
            expect(success).to.have.ownProperty('payload').to.not.be.null;
        });
    });
});
