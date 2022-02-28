async function verifyInputToken(request, response, next) {
    const invalidTokenError = {
        status: 401,
        error: 'Invalid Token or No token provided in authorization header',
        payload: null,
    };
    try {
        let bearerToken;
        if (request.headers['authorization']) {
            bearerToken = request.headers['authorization'].split(' ')[1];
        }
        if (bearerToken) {
            const decoded = await verifyToken(bearerToken);

            // Append the parameters to the request object
            request.userId = decoded.userId;

            return next();
        } else {
            return next(invalidTokenError);
        }
    } catch (error) {
        return next(invalidTokenError);
    }
}

module.exports = {
    verifyInputToken,
};
