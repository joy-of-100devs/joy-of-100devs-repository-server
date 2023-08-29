export class CustomError extends Error {
    httpCode = 500;
}

export class NotFoundError extends CustomError {
    httpCode = 404;
}
