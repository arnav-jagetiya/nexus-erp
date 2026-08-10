export class ApiError extends Error {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(statusCode: number, code: string, message: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  static badRequest(message: string, details?: any) {
    return new ApiError(400, 'VALIDATION_ERROR', message, details);
  }

  static unauthorized(message: string = 'Authentication required') {
    return new ApiError(401, 'UNAUTHORIZED', message);
  }

  static forbidden(message: string = 'Access denied for your role') {
    return new ApiError(403, 'FORBIDDEN', message);
  }

  static notFound(resource: string = 'Resource') {
    return new ApiError(404, 'NOT_FOUND', `${resource} not found`);
  }

  static conflict(code: string, message: string, details?: any) {
    return new ApiError(409, code, message, details);
  }

  static insufficientStock(productName: string, available: number, requested: number) {
    return new ApiError(
      409,
      'INSUFFICIENT_STOCK',
      `Insufficient stock for '${productName}'. Available: ${available}, Requested: ${requested}`,
      { productName, available, requested }
    );
  }

  static invalidStatusTransition(currentStatus: string, targetStatus: string) {
    return new ApiError(
      409,
      'INVALID_STATUS_TRANSITION',
      `Cannot transition challan from status '${currentStatus}' to '${targetStatus}'`,
      { currentStatus, targetStatus }
    );
  }

  static internal(message: string = 'An unexpected internal server error occurred') {
    return new ApiError(500, 'INTERNAL_ERROR', message);
  }
}
