// Helper function for error responses
function handleErrorResponse(res, message, status, details) {
    return res.status(status).json({
        success: false,
        message,
        data: null,
        error: {
            CODE: status === 400 ? 'BAD_REQUEST' : 'UNKNOWN',
            MESSAGE: details || message,
            STATUS: status,
        },
    });
}

module.exports = handleErrorResponse;
