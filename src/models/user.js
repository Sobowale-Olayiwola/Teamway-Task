/**
 * This handles all the required configuration for the User model.
 * @module MODELS:User
 */

const { model, Schema } = require('mongoose');

const UserSchema = new Schema({
    // Model Required fields
    id: {
        type: Number,
        required: true,
        unique: true,
        default: 0,
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
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    shiftHours: {
        type: String,
        enum: ['0-8', '8-16', '16-24'],
    },
    shiftStartTime: {
        type: Number,
    },
    shiftEndTime: {
        type: Number,
    },
});

model('User', UserSchema);
