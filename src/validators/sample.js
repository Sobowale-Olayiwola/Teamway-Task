/**
 * Handles the implementation of Joi package for Sample service validation
 * @module VALIDATOR:Sample
 */

const Joi = require('@hapi/joi');

const createSchema = Joi.object({
    test: Joi.number().required().label('test'),
});

const updateSchema = Joi.object({
    test: Joi.number().required().label('test'),
});

module.exports = {
    createSchema,
    updateSchema,
};
