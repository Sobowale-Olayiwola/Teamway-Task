const { APP_NAME } = process.env;

async function processEmail({ email, name }) {
    const toEmail = email;
    const mailTitle = 'Registration Successful';
    const payload = {
        name: name,
        siteName: APP_NAME,
    };
    const templateLink = './template/registration/buyerRegistrationSuccessful.handlebars';
    const message = 'Sorry, we could not mail registration success to you.';

    const mailing = await sendEmail(toEmail, mailTitle, payload, templateLink);
    if (mailing.rejected.length) throw new Error(message);
}
