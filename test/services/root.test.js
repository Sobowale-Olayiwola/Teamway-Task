const sinon = require('sinon');
const { expect } = require('chai');

const RootService = require('../../src/services/_root');

describe('Tests _root service', () => {
    let Controller = null;
    let rootService = null;

    beforeEach(() => {
        Controller = {
            readRecords: sinon.spy(() => [
                {
                    id: 1,
                    _id: 'ki_df;kld',
                },
                {
                    id: 2,
                    _id: 'scala_euro_ewk',
                },
            ]),
        };

        rootService = new RootService();
    });

    afterEach(() => {
        Controller = null;
        rootService = null;
    });

    it('calls Controller.readRecords', () => {
        rootService.handleDatabaseRead({ Controller, queryOptions: {} });
        sinon.assert.called(Controller.readRecords);
    });

    it('does not process single reads for invalid data', () => {
        const sampleData = {};
        const result = rootService.processSingleRead(sampleData);
        expect(result).to.have.ownProperty('status').to.be.equal(404);
    });

    it('processes single reads', () => {
        const sampleData = { id: 1, _id: 'scala_on_+bean' };
        const result = rootService.processSingleRead(sampleData);
        expect(result).to.have.ownProperty('status').to.be.equal(200);
    });

    it('does not process multiple read results for invalid data', () => {
        const sampleData = null;
        const result = rootService.processMultipleReadResults(sampleData);
        expect(result).to.have.property('status').to.be.equal(404);
    });

    it('process multiple read results for empty data', () => {
        const sampleData = [];
        const result = rootService.processMultipleReadResults(sampleData);
        expect(result).to.have.property('status').to.be.equal(200);
    });

    it('process multiple read results for non-empty data', () => {
        const sampleData = [{ id: 1, _id: 'just-a_test_string' }];
        const result = rootService.processMultipleReadResults(sampleData);
        expect(result).to.have.property('status').to.be.equal(200);
    });

    it('returns error for null data', () => {
        const sampleData = null;
        const result = rootService.processUpdateResult({ ...sampleData });
        expect(result).to.have.property('error').to.be.a('string');
    });

    it('returns payload for no change in data', () => {
        const sampleData = { ok: 1, nModified: 0 };
        const result = rootService.processUpdateResult({ result: sampleData });
        expect(result).to.have.property('status').to.be.equal(204);
    });

    it('returns valid response for updated data', () => {
        const sampleData = { ok: 1, nModified: 1 };
        const result = rootService.processUpdateResult({
            result: sampleData,
            eventName: 'sampleEventName',
        });
        expect(result).to.have.property('error').to.be.null;
    });

    it('just using this to fire the Logger error event for testing', () => {
        const sampleData = { ok: 1, nModified: 1 };
        const result = rootService.processUpdateResult({ result: sampleData, eventName: 'error' });
        expect(result).to.have.property('error').to.be.null;
    });

    it('returns valid response for successful delete', () => {
        const sampleData = { ok: 1, acknowledged: true, modifiedCount: 1, nModified: 1 };
        const result = rootService.processDeleteResult(sampleData);
        expect(result).to.have.property('error').to.be.null;
    });

    it('returns valid response for unsuccessful delete', () => {
        const sampleData = { ok: 1, acknowledged: true, modifiedCount: 0, nModified: 0 };
        const result = rootService.processDeleteResult(sampleData);
        expect(result).to.have.property('payload').to.be.null;
    });

    it('returns correct failed response', () => {
        const message = 'Request failed';
        const response = rootService.processFailedResponse({ message });
        expect(response).is.an('object').has.property('error').that.is.equal(message);
    });

    it('returns correct success response', () => {
        const payload = {};
        const response = rootService.processSuccessfulResponse({ ...payload });
        expect(response).to.have.property('error').that.is.null;
    });
});
