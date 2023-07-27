// export const HttpException = (message, statusCode) => {
//     const error = new Error(message);
//     error.statusCode = statusCode;
//     return error;
//   };

export class HttpException extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, HttpException.prototype);
  }
}
