const sinon = require('sinon');
const { expect } = require('chai');
const { retrieveLogs } = require('../../src/utilities/logger');

describe('Tests Logs export utility', () => {
    beforeEach(() => {});

    afterEach(() => {});

    describe('Loggers.retrieveLogs', () => {
        it('Should return logs using defaults', async () => {
            const logs = await retrieveLogs({});
            expect(logs).to.not.be.null;
        });

        it('Should return error logs', async () => {
            const logs = await retrieveLogs({ type: 'error' });
            expect(logs).to.not.be.null;
        });

        it('Should return exception logs', async () => {
            const logs = await retrieveLogs({ type: 'exception' });
            expect(logs).to.not.be.null;
        });

        it('Should return request logs', async () => {
            const logs = await retrieveLogs({ type: 'request' });
            expect(logs).to.not.be.null;
        });

        it('Should return logs using specified length', async () => {
            const logs = await retrieveLogs({ length: 20 });
            expect(logs).to.not.be.null;
        });

        it('Should return logs using specified timeFilterRange', async () => {
            const logs = await retrieveLogs({ timeFilterRange: `10-20-2020*17-11-2099` });
            expect(logs).to.not.be.null;
        });

        it('Should return logs using specified order', async () => {
            const logs = await retrieveLogs({ order: 'Tail' });
            expect(logs).to.not.be.null;
        });

        it('Should return logs using specified file', async () => {
            const logs = await retrieveLogs({ file: 'json' });
            expect(logs).to.not.be.null;
        });

        it('Should catch error of non-existing file and return string', async () => {
            const logs = await retrieveLogs({ type: 'success' });
            expect(logs).to.not.be.null;
        });
    });
});
