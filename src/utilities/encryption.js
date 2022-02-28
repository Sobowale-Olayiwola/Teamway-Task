/**
 * This module handles all the Application wide encryption tasks
 * @module UTILITY:Encryption
 */

const { promisify } = require('util');
const { genSalt, hash, compare } = require('bcrypt');
const { sign, verify } = require('jsonwebtoken');

const { SALT, SIGNATURE } = process.env;

/**
 * Hashes and the returns the hash of the object passed in as parameter.
 * @async
 * @global
 */
async function hashObject(objectToHash) {
    const salt = await genSalt(Number(SALT));
    const hashedObject = await hash(objectToHash, salt);
    return hashedObject;
}

/**
 * Compares two object sentObject (what you want to verify) and the
 * accurateObject (the single source of truth).
 * Returns a boolean or error.
 * @async
 * @global
 */
async function verifyObject({ sentObject, accurateObject }) {
    const isValid = await compare(sentObject, accurateObject);
    return isValid;
}

const signJWT = promisify(sign);
/**
 * Generates and returns a JWT using the payload and expirationTime,
 * the expirationTime has a default of 6 hours.
 * @async
 * @global
 */
async function generateToken({ payload, expirationTime = '6h' }) {
    const signedToken = await signJWT(payload, SIGNATURE, { expiresIn: expirationTime });
    return signedToken;
}

const verifyJWT = promisify(verify);
/**
 * Checks the validity of a JWT. Returns a boolean or error if any.
 * @async
 * @global
 */
async function verifyToken(tokenToVerify) {
    const isValid = await verifyJWT(tokenToVerify, SIGNATURE);
    return isValid;
}

module.exports = { hashObject, verifyObject, generateToken, verifyToken };
