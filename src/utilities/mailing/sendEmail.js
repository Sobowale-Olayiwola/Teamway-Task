/**
 *
 * This module handles all the email sending for the Application
 * @module UTILITY:Mailer
 */

const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD, FROM_EMAIL } = process.env;

const { readFileSync } = require('fs');
const { join } = require('path');

const { createTransport } = require('nodemailer');
const { compile } = require('handlebars');

const transporter = createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD,
    },
});

/**
 *
 * @typedef {object} SendEmailPayload
 * @property {string|Array<string>} email These are/is the email recipient
 * @property {string} subject This is the email header
 * @property {object} payload This contains the items to replace with in the template
 * @property {sting} templateFileDirectory This is the folder link to the template
 * containing the email format and variable to replace.
 */

/**
 * Sends emails to recipients using the parameters and created transport.
 * @async
 * @method
 * @param {SendEmailPayload} destructuredObject is the
 * object structure required to send a valid email
 * @returns Either a success/failed response
 */
async function sendEmail({ email, subject, payload, templateFileDirectory }) {
    try {
        const source = readFileSync(join(__dirname, templateFileDirectory), 'utf8');
        const compiledTemplate = compile(source);
        const options = () => ({
            from: FROM_EMAIL,
            to: email,
            subject,
            html: compiledTemplate(payload),
        });

        return await transporter.sendMail(options());
    } catch (error) {
        return error;
    }
}

module.exports = sendEmail;
