/**
 * Handles the implementation of Joi package for Sample service validation
 * @module VALIDATOR:Sample
 */

const Joi = require('@hapi/joi');

const createSchema = Joi.object({
    firstName: Joi.string().required().label('First Name'),
    lastName: Joi.string().required().label('Last Name'),
    email: Joi.string().email().required().label('Email'),
    shiftHours: Joi.string().label('Shift Hours').valid('0-8', '8-16', '16-24'),
});

const updateSchema = Joi.object({
    firstName: Joi.string().label('First Name'),
    lastName: Joi.string().label('Last Name'),
    email: Joi.string().email().label('Email'),
    shiftHours: Joi.string().label('Shift Hours').valid('0-8', '8-16', '16-24'),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required().label('Email'),
    password: Joi.string().min(6).max(16).required().label('Password'),
});

module.exports = {
    loginSchema,
    createSchema,
    updateSchema,
};
