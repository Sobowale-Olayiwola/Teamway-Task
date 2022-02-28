const { expect } = require('chai');
const util = require('../../src/utilities/query');

describe('Tests Query utility', () => {
    it('builds correct in data', () => {
        const string = '14:15:89';
        const needle = string.split(':')[0];
        expect(util.buildInQuery(string))
            .to.haveOwnProperty('$in')
            .that.is.an('array')
            .that.contains(needle);
    });

    it('builds correct nor data', () => {
        const string = '!15!89';
        const needle = string.split('!')[1];
        expect(util.buildNorQuery(string))
            .to.haveOwnProperty('$nin')
            .that.is.an('array')
            .that.contains(needle);
    });

    it('builds correct or data', () => {
        const string = '14,15,89';
        const needle = string.split(',')[0];
        expect(util.buildOrQuery(string))
            .to.haveOwnProperty('$in')
            .that.is.an('array')
            .that.contains(needle);
    });

    it('builds correct data $gte', () => {
        const string = '2~15';
        const expectedValue = Number(string.split('~')[0]);
        expect(util.buildRangeQuery(string))
            .to.be.an('object')
            .to.have.property('$gte')
            .to.be.equal(expectedValue);
    });

    it('builds correct data $lte', () => {
        const string = '2~15';
        const expectedValue = Number(string.split('~')[1]);
        expect(util.buildRangeQuery(string))
            .to.be.an('object')
            .to.have.property('$lte')
            .to.be.equal(expectedValue);
    });

    it('builds return_fields query params', () => {
        const string = 'name, age';
        expect(util.buildReturnFieldsString(string))
            .to.be.a('string')
            .to.be.equal(string.replace(/,/gi, ' '))
            .to.not.contain(',');
    });

    it('builds sort_by query params', () => {
        const string = 'name, age';
        expect(util.buildSortOrderString(string))
            .to.be.a('string')
            .to.be.equal(string.replace(/,/gi, ' '))
            .to.contain(' ')
            .and.not.contain(',');
    });

    it('builds wildcard options:', () => {
        const keyList = 'firstName,lastName';
        const value = 'Nathan';

        expect(util.buildWildcardOptions(keyList, value))
            .to.have.ownProperty('$or')
            .to.be.an('array')
            .has.length(keyList.split(',').length);
    });

    it('determines correct pagination', () => {
        const page = 1;
        const population = 50;
        const skip = page * population;
        expect(util.determinePagination(page, population))
            .to.have.keys(['limit', 'skip'])
            .to.have.property('skip')
            .to.be.equal(skip);
    });

    it('returns correct data', () => {
        const keys = [
            'count',
            'fieldsToReturn',
            'limit',
            'seekConditions',
            'skip',
            'sortCondition',
        ];

        const options = {
            firstName: 'matt,nate',
            lastName: '!David',
            age: '13:15:67',
            score: '50~100',
            sortBy: '-firstname',
            returnOnly: 'firstname,lastname',
            page: 0,
            population: 100,
        };

        expect(util.buildQuery(options)).to.have.keys(keys);
    });
});
