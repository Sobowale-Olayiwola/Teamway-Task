const sinon = require('sinon');

module.exports = {
    createRecord: sinon.spy((data) => {
        if (!Object.keys(data).length) {
            return { failed: true, error: 'Just a random error' };
        }
        return { id: 1, _id: 'sjdhflkjasdf32uiw7p' };
    }),

    readRecords: sinon.spy(() => [
        {
            id: 1,
            _id: 'jdfhlksdhf837qyh',
        },
        {
            id: 2,
            _id: 'hf3289jdwuy90',
        },
    ]),

    updateRecords: sinon.spy((data) => {
        if (!Object.keys(data).length) {
            return { ok: 1, nModified: 0 };
        }

        return { ok: 1, acknowledged: true, modifiedCount: 1, nModified: 1 };
    }),

    deleteRecords: sinon.spy(() => ({ ok: 1, acknowledged: true, modifiedCount: 1, nModified: 1 })),
};
