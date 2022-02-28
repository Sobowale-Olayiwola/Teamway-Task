/**
 * This handles all the required configuration for the Sample model.
 * @module MODELS:Sample
 */

const { model, Schema } = require('mongoose');

const SampleSchema = new Schema({
    // Model Required fields
    id: {
        type: Number,
        required: true,
        unique: true,
        default: 0,
    },
    test: {
        type: Number,
        required: true,
        unique: true,
    },
    isActive: {
        type: Boolean,
        required: true,
        default: true,
    },
    isDeleted: {
        type: Boolean,
        required: true,
        default: false,
    },
    timeStamp: {
        type: Number,
        required: true,
        default: () => Date.now(),
    },
    createdOn: {
        type: Date,
        required: true,
        default: () => new Date(),
    },
    updatedOn: {
        type: Date,
        required: true,
        default: () => new Date(),
    },
    // Custom Fields
});

model('Sample', SampleSchema);
